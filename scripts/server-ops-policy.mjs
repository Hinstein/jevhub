import { lstatSync, readdirSync, readlinkSync, realpathSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";

export const inside = (parent, child) => child === parent || child.startsWith(parent === sep ? sep : parent + sep);

export function unitHealthy(unit) {
  if (unit.ActiveState === "active") return unit.Result === "success";
  return unit.Type === "oneshot" && unit.ActiveState === "inactive" &&
    unit.Result === "success" && unit.ExecMainStatus === "0";
}

export function httpHealthy(status, expected) {
  return expected.includes(Number(status));
}

export function diskSummary(disk) {
  const used = Number(disk.blocks) - Number(disk.bfree);
  const available = Number(disk.bavail);
  return { usedPercent: Math.ceil(100 * used / (used + available)), availableBytes: available * Number(disk.bsize) };
}

export function timerHealthy(input) {
  let trigger = input.lastTriggerSeconds;
  if (trigger === undefined && typeof input.lastTriggerMonotonic === "string") {
    const value = input.lastTriggerMonotonic.trim();
    if (/^\d+$/.test(value)) trigger = Number(value) / 1e6;
    else {
      // systemctl renders timer timestamps as a duration since boot, unlike
      // ActiveEnterTimestampMonotonic's raw microseconds on this host.
      const units = { w: 604800, d: 86400, h: 3600, min: 60, s: 1, ms: 0.001, us: 0.000001 };
      const parts = [...value.matchAll(/(\d+(?:\.\d+)?)(min|ms|us|w|d|h|s)/g)];
      trigger = parts.length && parts.map((part) => part[0]).join("") === value.replace(/\s/g, "")
        ? parts.reduce((sum, part) => sum + Number(part[1]) * units[part[2]], 0) : NaN;
    }
  }
  return input.activeState === "active" && input.enabled &&
    Number.isFinite(trigger) && trigger >= 0 && trigger <= input.uptimeSeconds &&
    (trigger > 0 ? input.uptimeSeconds - trigger <= input.maxLagSeconds : input.uptimeSeconds <= input.maxLagSeconds);
}

export function restartDecision(input) {
  const deny = (reason) => ({ allowed: false, reason });
  if (!input.allowed) return deny("not-allowlisted");
  if (input.reason !== "unit") return deny("not-a-stopped-web-service");
  if (!["failed", "inactive"].includes(input.activeState)) return deny("service-not-stopped");
  if (!input.guardPassed) return deny("release-guard-failed");
  if (!input.publicAvailable) return deny("public-verification-unconfigured");
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
      const generated = inside(join(candidate, "node_modules"), path) || inside(join(candidate, ".next"), path);
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        const full = join(path, entry.name);
        if (entry.isFile() && (/\.(?:db|sqlite3?|dump|pgdump|bak|log)$/i.test(entry.name) || /^(PG_VERSION|WiredTiger|ibdata1)$/i.test(entry.name))) return true;
        if (path !== candidate && /^\.env(?:\.|$)/.test(entry.name) && !/^\.env\.(example|sample|template)$/.test(entry.name)) return true;
        // Dependency/runtime code has legitimate data/shared/runtime folders;
        // still inspect every nested file for secrets and database markers.
        if (entry.isDirectory() && (generated ? /^(uploads|backups?|storage|logs)$/i : /^(data|shared|uploads|backups?|storage|runtime|logs)$/i).test(entry.name)) return true;
        if (entry.isDirectory() && protectedContents(full)) return true;
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
    if (allReferences.some((ref) => (inside(candidate, ref.path) || (ref.source === "docker-mount" && inside(ref.path, candidate))) && (!ref.owner || !inside(candidate, ref.owner)))) return deny("referenced-release");
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
