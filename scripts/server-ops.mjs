#!/usr/bin/env node
// Root-owned, fixed-allowlist operations. No shell commands or credential output.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, readlinkSync, realpathSync, lstatSync, statSync, statfsSync, mkdirSync, writeFileSync, renameSync, rmSync, appendFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { candidateDecision, httpHealthy, incidentKey, restartDecision, unitHealthy, timerHealthy } from "./server-ops-policy.mjs";

const script = fileURLToPath(import.meta.url);
const guard = "/usr/local/lib/jevhub-ops/release-guard.mjs";
const stateRoot = "/var/lib/jevhub-ops";
const fixed = {
  jevhub: ["/home/ubuntu/jevhub", "jevhub.service", "http://127.0.0.1:3200/", "https://jevhub.xyz/"],
  inboxrevamp: ["/home/ubuntu/jev-email", "inboxrevamp.service", "http://127.0.0.1:3500/", "https://inboxrevamp.com/"],
  store: ["/home/ubuntu/jev-store-new-api", "jev-store-new-api.service", "http://127.0.0.1:3400/", "https://jevhub.store/"],
  vip: ["/home/ubuntu/jev-vip", "jev-vip.service", "http://127.0.0.1:3300/", null],
};
const readOnlyUnits = ["caddy.service", "docker.service", "postgresql@16-main.service", "umami.service", "workflow-lens.service", "goofishcbot.service", "bepusdt.service", "arc-arb-observer.service", "x-telegram-push.service", "umami-db-backup.service", "workflow-lens-db-backup.service", "jevhub-idea-retention-cleanup.service"];
const readOnlyHttp = [
  ["workflow", "https://auturance.com/", [200]],
  ["analytics", "https://analytics.auturance.com/", [200]],
  ["analytics-perppulse", "https://analytics.perppulse.xyz/", [200]],
  ["store-admin", "https://admin.jevhub.store/", [200]],
  ["bot", "https://bot.jevhub.store/", [401]],
  ["payments", "https://pay.perppulse.xyz/", [200]],
];
const readOnlyTimers = [
  ["umami-db-backup.timer", 36 * 3600], ["workflow-lens-db-backup.timer", 36 * 3600],
  ["jevhub-idea-retention-cleanup.timer", 36 * 3600],
  ["inboxrevamp-gmail-worker.timer", 600], ["inboxrevamp-gmail-watch.timer", 600],
  ["inboxrevamp-gmail-metrics.timer", 900], ["inboxrevamp-revamp-apply.timer", 600],
];

const exec = (file, args, options = {}) => spawnSync(file, args, { encoding: "utf8", timeout: 30000, maxBuffer: 16e6, ...options });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const issue = (key, code, detail) => ({ key, code, ...(detail ? { detail } : {}) });
const readState = (path) => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
function save(path, data) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
  renameSync(temporary, path);
}
function settings(path, mutate) {
  const stat = lstatSync(path);
  if (!stat.isFile() || (mutate && (process.getuid?.() !== 0 || stat.uid !== 0 || (stat.mode & 0o022)))) throw new Error("Mutation requires a root-owned, non-writable policy and root execution");
  const policy = JSON.parse(readFileSync(path, "utf8"));
  if (policy.version !== 1 || !Array.isArray(policy.projects)) throw new Error("Invalid policy");
  const seen = new Set();
  for (const project of policy.projects) {
    if (!fixed[project.key] || seen.has(project.key)) throw new Error("Unknown or duplicate project");
    seen.add(project.key);
    if (typeof project.recover !== "boolean" || typeof project.cleanup !== "boolean") throw new Error("Explicit recovery and cleanup flags required");
  }
  return policy;
}
function unit(unitName) {
  const properties = ["Type", "LoadState", "UnitFileState", "ActiveState", "SubState", "Result", "ExecMainStatus", "MainPID", "NRestarts", "WorkingDirectory", "ActiveEnterTimestampMonotonic"];
  const result = exec("systemctl", ["show", unitName, ...properties.flatMap((name) => ["-p", name])]);
  if (result.status !== 0) throw new Error("systemd inspection failed");
  return Object.fromEntries(result.stdout.trim().split("\n").map((line) => { const i = line.indexOf("="); return [line.slice(0, i), line.slice(i + 1)]; }));
}
function http(url, expected = [200]) {
  if (!url) return { skipped: true, healthy: true };
  const result = exec("curl", ["--silent", "--show-error", "--location", "--max-redirs", "6", "--cookie-jar", "/dev/null", "--connect-timeout", "5", "--max-time", "15", "--output", "/dev/null", "--write-out", "%{http_code}", url], { timeout: 17000 });
  const status = Number(result.stdout.trim());
  return { status, healthy: result.status === 0 && httpHealthy(status, expected) };
}
function releaseCheck(root, mode = "check") {
  const result = exec("sudo", ["-n", "-u", "ubuntu", process.execPath, guard, mode, root], { timeout: 60000 });
  const paths = mode === "cleanup-plan" ? result.stdout.split("\n").filter((line) => line.startsWith("candidate=")).map((line) => line.slice(10)) : [];
  return { passed: result.status === 0, candidates: paths };
}
function freeBytes() { const disk = statfsSync("/"); return Number(disk.bavail) * Number(disk.bsize); }
function diskUse() { const disk = statfsSync("/"); return Math.round(100 * (1 - Number(disk.bfree) / Number(disk.blocks))); }
function containerState() {
  const list = exec("docker", ["ps", "-aq"]);
  if (list.status !== 0) throw new Error("Docker inspection failed");
  const ids = list.stdout.trim().split("\n").filter(Boolean);
  if (!ids.length) return [];
  const data = exec("docker", ["inspect", ...ids]);
  if (data.status !== 0) throw new Error("Docker inspection failed");
  // Raw inspect (including environment values) remains only in memory.
  return JSON.parse(data.stdout).map((item) => ({
    name: item.Name.replace(/^\//, ""), status: item.State.Status,
    health: item.State.Health?.Status ?? "none", restarts: item.RestartCount,
    oomKilled: item.State.OOMKilled,
    references: [...(item.Config.Labels?.["com.docker.compose.project.config_files"] ?? "").split(","), item.Config.Labels?.["com.docker.compose.project.working_dir"], ...item.Mounts.map((mount) => mount.Source)].filter(Boolean),
  }));
}

function references() {
  const refs = []; const roots = Object.values(fixed).map((row) => join(row[0], "releases"));
  const add = (source, path) => {
    if (typeof path === "string" && roots.some((root) => path === root || path.startsWith(root + "/"))) refs.push({ source, path: path.replace(/ \(deleted\)$/, "") });
  };
  for (const entry of readdirSync("/proc")) {
    if (!/^\d+$/.test(entry)) continue;
    const path = join("/proc", entry);
    for (const name of ["cwd", "root", "exe"]) {
      try { add("process", readlinkSync(join(path, name))); }
      catch (error) { if (!["ENOENT", "ESRCH", "EINVAL"].includes(error.code)) throw new Error("Incomplete process inspection"); }
    }
    try {
      for (const text of [readFileSync(join(path, "cmdline"), "utf8"), readFileSync(join(path, "maps"), "utf8")]) {
        for (const candidate of text.match(/\/(?:home|opt|var|usr)\/[A-Za-z0-9_./%-]+/g) ?? []) add("process", candidate);
      }
      for (const fd of readdirSync(join(path, "fd"))) {
        try { add("process-fd", readlinkSync(join(path, "fd", fd))); }
        catch (error) { if (!["ENOENT", "ESRCH", "EINVAL"].includes(error.code)) throw error; }
      }
    } catch (error) { if (!["ENOENT", "ESRCH"].includes(error.code)) throw new Error("Incomplete process inspection"); }
  }
  function configs(path) {
    if (!existsSync(path)) return;
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) configs(full);
      else if (entry.isFile() && /\.(service|conf)$/.test(entry.name)) {
        for (const candidate of readFileSync(full, "utf8").match(/\/(?:home|opt|var|usr)\/[A-Za-z0-9_./%-]+/g) ?? []) add("systemd-config", candidate);
      }
    }
  }
  for (const path of ["/etc/systemd/system", "/run/systemd/system", "/usr/lib/systemd/system"]) configs(path);
  const list = exec("systemctl", ["list-units", "--all", "--type=service", "--no-legend", "--plain"]);
  if (list.status !== 0) throw new Error("Incomplete loaded service inspection");
  const names = list.stdout.split("\n").map((line) => line.trim().replace(/^●\s*/, "").split(/\s+/)[0]).filter((name) => /^[A-Za-z0-9_.@:-]+\.service$/.test(name));
  // Include loaded transient units, not just files on disk.
  if (names.length) {
    const loaded = exec("systemctl", ["show", ...names, "-p", "WorkingDirectory", "-p", "ExecStart", "-p", "ExecStartPre", "-p", "EnvironmentFiles"]);
    if (loaded.status !== 0) throw new Error("Incomplete loaded service inspection");
    for (const candidate of loaded.stdout.match(/\/(?:home|opt|var|usr)\/[A-Za-z0-9_./%-]+/g) ?? []) add("loaded-systemd", candidate);
  }
  for (const container of containerState()) for (const path of container.references) add("docker-config-or-mount", path);
  return refs;
}

async function recover(project, state, observed, root, unitName, localUrl, publicUrl) {
  const decision = restartDecision({ allowed: project.recover && observed.UnitFileState === "enabled", reason: "unit", activeState: observed.ActiveState, guardPassed: releaseCheck(root).passed, diskBytes: freeBytes(), now: Date.now(), attempts: state.restartAttempts ?? [] });
  if (!decision.allowed) return { action: "not-restarted", reason: decision.reason };
  // Persist the budget before attempting a restart, including failed attempts.
  state.restartAttempts = [...(state.restartAttempts ?? []).filter((time) => time > Date.now() - 86400_000), Date.now()];
  save(join(stateRoot, `${project.key}.json`), state);
  const result = exec("systemctl", ["restart", unitName], { timeout: 100000 });
  if (result.status !== 0) return { action: "restart-failed" };
  for (let attempt = 0; attempt < 6; attempt++) {
    const next = unit(unitName);
    if (unitHealthy(next) && http(localUrl).healthy && http(publicUrl).healthy) {
      await pause(10000);
      const stable = unit(unitName);
      if (stable.MainPID === next.MainPID && stable.NRestarts === next.NRestarts && unitHealthy(stable)) return { action: "restart-verified" };
    }
    await pause(3000);
  }
  return { action: "restart-unverified" };
}

async function projectRun(project, mutate) {
  const [root, unitName, localUrl, publicUrl] = fixed[project.key];
  const statePath = join(stateRoot, `${project.key}.json`);
  const state = readState(statePath); const issues = []; const actions = [];
  let observed = unit(unitName); const selected = existsSync(join(root, "current")) ? realpathSync(join(root, "current")) : null;
  const checked = releaseCheck(root);
  if (!checked.passed) issues.push(issue(project.key, "release-guard-failed"));
  const maintenance = existsSync("/etc/jevhub-ops/maintenance");
  if (!unitHealthy(observed)) {
    if (mutate && !maintenance) actions.push(await recover(project, state, observed, root, unitName, localUrl, publicUrl));
    observed = unit(unitName);
    if (!unitHealthy(observed)) issues.push(issue(project.key, "web-unit-failed"));
  }
  const local = http(localUrl), publicHttp = http(publicUrl);
  if (!local.healthy || !publicHttp.healthy) issues.push(issue(project.key, "http-failed", { local: local.status, public: publicHttp.status }));
  const upSeconds = Math.floor(Number(readFileSync("/proc/uptime", "utf8").split(" ")[0]) - Number(observed.ActiveEnterTimestampMonotonic) / 1e6);
  const stable = state.lastPid === observed.MainPID && state.lastRestarts === observed.NRestarts && state.current === selected && upSeconds >= 120;
  const cleanupDue = Date.now() - (state.lastCleanup ?? 0) >= 6 * 3600_000 || diskUse() >= 85;
  if (mutate && !maintenance && project.cleanup && stable && checked.passed && local.healthy && publicHttp.healthy && unitHealthy(observed) && cleanupDue) {
    const plan = releaseCheck(root, "cleanup-plan");
    if (!plan.passed) issues.push(issue(project.key, "cleanup-plan-failed"));
    else {
      const removed = [], skipped = [];
      for (const candidate of plan.candidates) {
        if (Date.now() - statSync(candidate).mtimeMs < 3600_000) { skipped.push({ release: candidate.split("/").at(-1), reason: "recent-release" }); continue; }
        const refs = references();
        const decision = candidateDecision(root, candidate, selected, refs);
        if (!decision.allowed) { skipped.push({ release: candidate.split("/").at(-1), reason: decision.reason }); continue; }
        // A fresh plan and live process check are mandatory immediately before
        // each deletion. No broad root, shared/, or environment file is removed.
        const freshPlan = releaseCheck(root, "cleanup-plan");
        if (!freshPlan.passed || !freshPlan.candidates.includes(candidate) || realpathSync(join(root, "current")) !== selected) throw new Error("Selection changed during cleanup");
        const lastCheck = candidateDecision(root, candidate, selected, references());
        if (!lastCheck.allowed) { skipped.push({ release: candidate.split("/").at(-1), reason: lastCheck.reason }); continue; }
        rmSync(candidate, { recursive: true, force: false });
        removed.push(candidate.split("/").at(-1));
        // Journal every individual removal before any following operation.
        appendFileSync(join(stateRoot, "actions.jsonl"), JSON.stringify({ time: new Date().toISOString(), project: project.key, action: "removed-unused-release", release: candidate.split("/").at(-1) }) + "\n", { mode: 0o600 });
      }
      state.lastCleanup = Date.now();
      if (removed.length) {
        if (!releaseCheck(root).passed) throw new Error("Post-cleanup guard failed; do not restart");
        const restarted = exec("systemctl", ["restart", unitName], { timeout: 100000 });
        await pause(5000);
        const before = unit(unitName); const localAfter = http(localUrl), publicAfter = http(publicUrl);
        await pause(10000); const after = unit(unitName);
        const verified = restarted.status === 0 && unitHealthy(after) && before.MainPID === after.MainPID && before.NRestarts === after.NRestarts && localAfter.healthy && publicAfter.healthy;
        actions.push({ action: "cleanup", removed, restartVerified: verified });
        if (!verified) issues.push(issue(project.key, "post-cleanup-http-or-process-failed"));
        observed = after;
      }
      if (skipped.length) issues.push(issue(project.key, "cleanup-blocked", skipped));
    }
  }
  state.lastPid = observed.MainPID; state.lastRestarts = observed.NRestarts; state.current = selected; state.observedAt = new Date().toISOString();
  if (mutate) save(statePath, state);
  return { project: project.key, current: selected, guardPassed: checked.passed, pid: observed.MainPID, restarts: observed.NRestarts, local, public: publicHttp, issues, actions, maintenance };
}

async function gmailHealth() {
  try {
    const env = parseEnv(readFileSync("/home/ubuntu/jev-email/shared/.env.production", "utf8"));
    const response = await fetch("http://127.0.0.1:3500/api/cron/gmail-metrics", { headers: { authorization: `Bearer ${env.CRON_SECRET}` }, redirect: "error", signal: AbortSignal.timeout(10000) });
    if (!response.ok) return { issues: [issue("gmail", "metrics-http-failed", { status: response.status })] };
    const data = await response.json();
    const names = ["staleSyncMailboxes", "unverifiedMailboxes", "failedLabelJobs", "missingLabelMailboxes", "oldestRepairSeconds", "queueDepth"];
    const metrics = Object.fromEntries(names.map((name) => [name, Number.isSafeInteger(data[name]) ? data[name] : null]));
    if (Object.values(metrics).some((value) => value === null)) return { issues: [issue("gmail", "invalid-metrics")] };
    const database = new URL(env.DATABASE_URL).pathname.slice(1);
    if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error("Unsupported database");
    const query = exec("sudo", ["-n", "-u", "postgres", "psql", "-X", "-d", database, "-At", "-v", "ON_ERROR_STOP=1", "-c", `BEGIN READ ONLY; SET LOCAL statement_timeout='5s'; SELECT count(*) FROM "GmailConnection" WHERE status='NEEDS_REAUTH' AND "lastErrorCode"='GMAIL_AUTH_REVOKED'; COMMIT;`], { timeout: 8000 });
    const count = query.status === 0 ? Number(query.stdout.split("\n").find((line) => /^\d+$/.test(line))) : NaN;
    const owners = Number.isSafeInteger(count) ? count : null;
    const issues = [];
    if (owners > 0) issues.push(issue("gmail", "oauth-owner-required", { affectedConnections: owners, action: "Reconnect Gmail at https://inboxrevamp.com/dashboard" }));
    if (metrics.staleSyncMailboxes > (owners ?? 0) || metrics.unverifiedMailboxes > (owners ?? 0) || metrics.failedLabelJobs > 0 || metrics.missingLabelMailboxes > 0 || metrics.oldestRepairSeconds > 1800) issues.push(issue("gmail", "sync-or-label-health-failed"));
    if (owners === null) issues.push(issue("gmail", "reauth-state-unavailable"));
    return { metrics, issues };
  } catch { return { issues: [issue("gmail", "health-inspection-unavailable")] }; }
}

async function main() {
  const [mode, policyPath = "/etc/jevhub-ops/policy.json", projectKey] = process.argv.slice(2);
  if (!["audit", "run", "project"].includes(mode)) throw new Error("Usage: server-ops.mjs audit|run [policy.json]; project policy.json PROJECT");
  const mutate = mode !== "audit";
  const policy = settings(policyPath, mutate);
  if (mode === "project") {
    const project = policy.projects.find((entry) => entry.key === projectKey);
    if (!project) throw new Error("Project not allowlisted");
    console.log(JSON.stringify(await projectRun(project, true))); return;
  }
  const reports = [];
  if (mutate && !existsSync("/etc/jevhub-ops/maintenance")) {
    const repair = exec(process.execPath, [join(dirname(script), "store-compose.mjs"), "repair-aliases"]);
    if (repair.status !== 0) reports.push({ project: "store-compose", issues: [issue("store-compose", "configuration-repair-blocked")], actions: [] });
    else {
      const data = JSON.parse(repair.stdout);
      if (data.repairedAliases.length) reports.push({ project: "store-compose", issues: [], actions: [{ action: "restored-compose-aliases", paths: data.repairedAliases }] });
    }
  }
  for (const project of policy.projects) {
    if (mutate) {
      const rootName = fixed[project.key][0].split("/").at(-1);
      const worker = exec("flock", ["-n", "-E", "75", `/run/lock/${rootName}-release.lock`, process.execPath, script, "project", policyPath, project.key], { timeout: 240000 });
      if (worker.status === 75) reports.push({ project: project.key, issues: [], actions: [], skipped: "deployment-or-cleanup-lock" });
      else if (worker.status !== 0) reports.push({ project: project.key, issues: [issue(project.key, "worker-failed")], actions: [] });
      else reports.push(JSON.parse(worker.stdout));
    } else reports.push(await projectRun(project, false));
  }
  const otherUnits = readOnlyUnits.map((name) => { const observed = unit(name); return { name, active: observed.ActiveState, subState: observed.SubState, result: observed.Result, healthy: unitHealthy(observed) }; });
  const otherHttp = readOnlyHttp.map(([key, url, expected]) => ({ key, ...http(url, expected) }));
  const uptime = Number(readFileSync("/proc/uptime", "utf8").split(" ")[0]);
  const timers = readOnlyTimers.map(([name, maxLagSeconds]) => {
    const output = exec("systemctl", ["show", name, "-p", "ActiveState", "-p", "UnitFileState", "-p", "LastTriggerUSecMonotonic"]);
    const data = Object.fromEntries(output.stdout.trim().split("\n").map((line) => line.split("=")));
    const healthy = output.status === 0 && timerHealthy({ activeState: data.ActiveState, enabled: data.UnitFileState === "enabled", lastTriggerSeconds: Number(data.LastTriggerUSecMonotonic) / 1e6, uptimeSeconds: uptime, maxLagSeconds });
    return { name, healthy, active: data.ActiveState, enabled: data.UnitFileState === "enabled" };
  });
  const containers = containerState(); const gmail = await gmailHealth();
  const issues = reports.flatMap((report) => report.issues);
  for (const item of otherUnits) if (!item.healthy) issues.push(issue(item.name, "readonly-unit-failed"));
  for (const item of otherHttp) if (!item.healthy) issues.push(issue(item.key, "readonly-http-failed", { status: item.status }));
  for (const item of timers) if (!item.healthy) issues.push(issue(item.name, "readonly-timer-disabled-or-stale"));
  for (const item of containers) {
    if (item.status !== "running" || item.health === "unhealthy" || item.oomKilled) issues.push(issue(item.name, "container-unhealthy"));
    for (const path of item.references) if (!existsSync(path)) issues.push(issue(item.name, "container-configuration-missing", { path }));
  }
  issues.push(...gmail.issues);
  const disk = { usedPercent: diskUse(), availableBytes: freeBytes() };
  if (disk.usedPercent >= 85 || disk.availableBytes < 2 * 1024 ** 3) issues.push(issue("disk", disk.usedPercent >= 95 ? "disk-critical" : "disk-warning", disk));
  const report = { time: new Date().toISOString(), disk, projects: reports, otherUnits, otherHttp, timers, containers, gmail, issues, incidentKey: incidentKey(issues) };
  if (mutate) {
    const previous = readState(join(stateRoot, "latest.json"));
    save(join(stateRoot, "latest.json"), report);
    const incidentFile = join(stateRoot, "incidents.jsonl");
    if (existsSync(incidentFile) && statSync(incidentFile).size > 5 * 1024 ** 2) renameSync(incidentFile, join(stateRoot, "incidents.previous.jsonl"));
    const actionFile = join(stateRoot, "actions.jsonl");
    if (existsSync(actionFile) && statSync(actionFile).size > 5 * 1024 ** 2) renameSync(actionFile, join(stateRoot, "actions.previous.jsonl"));
    if (previous.incidentKey !== report.incidentKey || reports.some((entry) => entry.actions?.some((action) => action.action !== "not-restarted"))) {
      appendFileSync(incidentFile, JSON.stringify(report) + "\n", { mode: 0o600 });
      console.log(JSON.stringify({ changed: true, time: report.time, issues, actions: reports.filter((entry) => entry.actions?.length).map((entry) => ({ project: entry.project, actions: entry.actions })), disk }));
    } else console.log(JSON.stringify({ changed: false, time: report.time, incidentKey: report.incidentKey }));
  } else console.log(JSON.stringify(report));
}

if (resolve(process.argv[1] ?? "") === script) {
  main().catch(() => { console.error("FAIL server operations inspection; see root-owned policy and safe state report"); process.exitCode = 1; });
}
