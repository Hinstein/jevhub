import { lstatSync, readdirSync, readlinkSync, realpathSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";

export const inside = (parent, child) => child === parent || child.startsWith(parent + sep);

export function unitHealthy(unit) {
  if (unit.ActiveState === "active") return unit.Result === "success";
  return unit.Type === "oneshot" && unit.ActiveState === "inactive" &&
    unit.Result === "success" && unit.ExecMainStatus === "0";
}

export function httpHealthy(status, expected) {
  return expected.includes(Number(status));
}

export function timerHealthy(input) {
  return input.activeState === "active" && input.enabled &&
    (input.lastTriggerSeconds > 0 ? input.uptimeSeconds - input.lastTriggerSeconds <= input.maxLagSeconds : input.uptimeSeconds <= input.maxLagSeconds);
}

export function restartDecision(input) {
  const deny = (reason) => ({ allowed: false, reason });
  if (!input.allowed) return deny("not-allowlisted");
  if (input.reason !== "unit") return deny("not-a-stopped-web-service");
  if (!["failed", "inactive"].includes(input.activeState)) return deny("service-not-stopped");
  if (!input.guardPassed) return deny("release-guard-failed");
  if (input.diskBytes < 1024 ** 3) return deny("insufficient-disk");
  const recent = input.attempts.filter((time) => time > input.now - 86400_000);
  if (recent.length >= 2) return deny("daily-restart-budget-exhausted");
  if (recent.some((time) => time > input.now - 1800_000)) return deny("restart-cooldown");
  return { allowed: true, reason: "bounded-web-recovery" };
}

// Only paths/metadata are read. Never read environment file contents.
export function projectReferences(root) {
  const references = [];
  function walk(path) {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      references.push({ source: "symlink", owner: path, path: resolve(dirname(path), readlinkSync(path)) });
      try { references.push({ source: "symlink", owner: path, path: realpathSync(path) }); }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    } else if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) if (entry !== ".git") walk(join(path, entry));
    }
  }
  walk(root);
  return references;
}

export function candidateDecision(root, candidate, expectedCurrent, references) {
  const deny = (reason) => ({ allowed: false, reason });
  try {
    if (!isAbsolute(root) || root !== realpathSync(root)) return deny("non-canonical-project-root");
    const releases = join(root, "releases");
    if (!lstatSync(releases).isDirectory() || realpathSync(releases) !== releases) return deny("non-canonical-releases");
    if (candidate !== resolve(candidate) || dirname(candidate) !== releases || !lstatSync(candidate).isDirectory()) return deny("not-a-direct-real-release");
    const currentLink = join(root, "current");
    if (!lstatSync(currentLink).isSymbolicLink() || realpathSync(currentLink) !== expectedCurrent) return deny("current-changed");
    if (candidate === expectedCurrent) return deny("current-release");
    function protectedContents(path) {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const full = join(path, entry.name);
        if (entry.isFile() && /\.(?:db|sqlite3?|dump|pgdump|bak|log)$/i.test(entry.name)) return true;
        if (entry.isDirectory() && /^(uploads|backups?|storage|runtime|logs)$/i.test(entry.name)) return true;
        if (entry.isDirectory() && !["node_modules", ".next", ".git"].includes(entry.name) && protectedContents(full)) return true;
      }
      return false;
    }
    if (protectedContents(candidate)) return deny("protected-database-or-runtime-data");
    for (const entry of readdirSync(candidate)) {
      const path = join(candidate, entry);
      const stat = lstatSync(path);
      if (/^\.env(?:\.|$)/.test(entry) && !/^\.env\.(example|sample|template)$/.test(entry)) {
        if (!stat.isSymbolicLink() || !inside(join(root, "shared"), resolve(candidate, readlinkSync(path))) || !inside(join(root, "shared"), realpathSync(path))) return deny("protected-environment-file");
      }
      if (/^(data|uploads|backups?|storage|runtime|logs|\.backend-configuration-alias)$/i.test(entry)) return deny("protected-runtime-data-or-configuration");
      if (entry === "RELEASE.json") {
        const manifest = JSON.parse(readFileSync(path, "utf8"));
        if (manifest.qualityStatus !== "passed") return deny("unfinished-release");
      }
    }
    const allReferences = [...references, ...projectReferences(root)];
    if (allReferences.some((ref) => inside(candidate, ref.path) && (!ref.owner || !inside(candidate, ref.owner)))) return deny("referenced-release");
    return { allowed: true, reason: "unused-code-release" };
  } catch (error) {
    return deny(`inspection-failed:${error.code ?? "invalid-metadata"}`);
  }
}

export function incidentKey(issues) {
  const normalized = issues.map(({ key, code }) => ({ key, code }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.code.localeCompare(b.code));
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
