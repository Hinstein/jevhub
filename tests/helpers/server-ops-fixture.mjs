#!/usr/bin/env node
// Standalone fixture harness. Only readSource() touches the host filesystem,
// and it reads the three named .mjs source files. All subject I/O is mocked.
// Usage: node repro.mjs /absolute/repo [--assert-safe]
import { readFileSync as readSource, constants } from "node:fs";
import { createHash } from "node:crypto";
import * as pathFns from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import vm from "node:vm";

const ACTIVE_MICROS = "351164093196"; // Owner-observed numeric ActiveEnter.
const UPTIME = Number(ACTIVE_MICROS) / 1e6 + 200;
const TIMER_FORMATTED = "4d 1h 32min 44.093196s"; // Same instant, formatted.
const NODE = "/fixture/node";
const STATE = "/var/lib/jevhub-ops";
const COMPOSE = "/etc/jevhub-ops/jev-mvp/compose.json";
const STORE_ROOT = "/home/ubuntu/jev-store-new-api";
const LEGACY_DIR = STORE_ROOT + "/releases/4e286dd";
const MARKER = LEGACY_DIR + "/.backend-configuration-alias";
const DATABASE = STORE_ROOT + "/releases/live/prisma/runtime.sqlite";
const ioError = (code) => Object.assign(new Error("Injected " + code), { code });

function load(repo, filename, mocks, names) {
  const raw = readSource(pathFns.join(repo, "scripts", filename), "utf8");
  const exported = [...raw.matchAll(/^export\s+(?:async\s+)?(?:function|const)\s+(\w+)/gm)].map((m) => m[1]);
  const source = raw
    .replace(/^import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?\r?$/gm, "")
    .replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class))/g, "")
    .replace("const script = fileURLToPath(import.meta.url);", `const script = ${JSON.stringify("/subject/" + filename)};`);
  const context = vm.createContext({
    ...pathFns, createHash, constants, parseEnv, fileURLToPath,
    Buffer,
    process: { argv: [NODE, "/fixture/entry", "repair-aliases"], execPath: NODE, getuid: () => 0, pid: 42 },
    console: { log() {}, error() {} }, setTimeout: (done) => { done(); return 0; },
    ...mocks,
  });
  vm.runInContext(source + `\nglobalThis.fixtureApi = {${(names ?? exported).join(",")}};`, context, { timeout: 1000, filename });
  return context.fixtureApi;
}

// Deliberately permit the candidate/guard: this isolates cleanup finalization
// from the independent release-content and reference-protection tests.
export function runnerFixture(repo, fault = "none", key = "jevhub", flags = { recover: false, cleanup: true }, overrides = {}) {
  const root = key === "vip" ? "/home/ubuntu/jev-vip" : "/home/ubuntu/jevhub";
  const current = root + "/releases/live";
  const candidates = [root + "/releases/old-one", root + "/releases/old-two"];
  const events = [];
  let deleteCalls = 0, destructiveChanges = 0;
  const policy = load(repo, "server-ops-policy.mjs", {});
  const state = { lastPid: "111", lastRestarts: "0", current, lastCleanup: 0 };
  const project = { key, ...flags };
  const mocks = {
    ...policy,
    candidateDecision: () => ({ allowed: true, reason: "fixture-code-only-release" }),
    existsSync: (p) => p.endsWith("/current") || p === STATE + `/${key}.json`,
    realpathSync: (p) => p.endsWith("/current") ? current : p,
    lstatSync: () => ({ isFile: () => true, isDirectory: () => true, isSymbolicLink: () => false, uid: 0, mode: 0o100600 }),
    statSync: () => ({ mtimeMs: Date.now() - 7200000, size: 0 }),
    statfsSync: () => ({ bavail: 500000, bfree: 500000, bsize: 4096, blocks: 1000000 }),
    readdirSync: () => [], readlinkSync: () => { throw ioError("ENOENT"); },
    readFileSync: (p) => {
      if (p === "/proc/uptime") return UPTIME + " 0";
      if (p === STATE + `/${key}.json`) return JSON.stringify(state);
      throw new Error("Unexpected VIRTUAL read: " + p);
    },
    mkdirSync: (p) => events.push({ op: "mkdir", p }),
    writeFileSync: (p) => events.push({ op: "write", p }),
    renameSync: (from, to) => events.push({ op: "rename", from, to }),
    rmSync: (p) => {
      deleteCalls++;
      events.push({ op: "delete-attempt", p });
      if (fault === "second-delete" && deleteCalls === 2) throw ioError("EIO");
      destructiveChanges++;
      events.push({ op: "destructive-change", p });
      if (fault === "partial-first-delete" && deleteCalls === 1) throw ioError("EIO");
    },
    appendFileSync: (p) => {
      events.push({ op: "journal-attempt", p });
      if (fault === "journal" && destructiveChanges > 0) throw ioError("ENOSPC");
    },
    spawnSync: (file, args) => {
      events.push({ op: "command", file, args: [...args] });
      if (file === "sudo" && args.some((a) => a.endsWith("/release-guard.mjs"))) {
        return { status: 0, stdout: args.includes("cleanup-plan") ? candidates.map((p) => "candidate=" + p).join("\n") : "PASS\n", stderr: "" };
      }
      if (file === "systemctl" && args[0] === "show") return { status: 0, stdout: [
        "Type=simple", "UnitFileState=enabled", "ActiveState=active", "SubState=running", "Result=success", "ExecMainStatus=0",
        "MainPID=111", "NRestarts=0", "WorkingDirectory=" + root + "/current", "ActiveEnterTimestampMonotonic=" + ACTIVE_MICROS,
      ].join("\n"), stderr: "" };
      if ((file === "systemctl" && ["list-units", "restart"].includes(args[0])) || (file === "docker" && args[0] === "ps")) return { status: 0, stdout: "", stderr: "" };
      if (file === "curl") return { status: 0, stdout: "200", stderr: "" };
      throw new Error("Unexpected VIRTUAL command: " + file + " " + args.join(" "));
    },
  };
  Object.assign(mocks, overrides);
  const api = load(repo, "server-ops.mjs", mocks, ["projectRun", "recover", "references", "main"]);
  return { api, project, events, root, current, mocks, get destructiveChanges() { return destructiveChanges; } };
}

export function mainFixture(repo, storePresent, busyStore) {
  const mutations = [], lockRequests = [];
  const f = runnerFixture(repo);
  const baseExec = f.mocks.spawnSync;
  const baseRead = f.mocks.readFileSync;
  const overridden = runnerFixture(repo, "none", "jevhub", { recover: false, cleanup: false }, {
    process: { argv: [NODE, "/fixture/entry", "run", "/fixture/policy.json"], execPath: NODE, getuid: () => 0, pid: 42 },
    readFileSync: (p) => p === "/fixture/policy.json" ? JSON.stringify({ version: 1, projects: storePresent ? [{ key: "store", recover: false, cleanup: false }] : [] }) : baseRead(p),
    spawnSync: (file, args) => {
      if (file === "flock") {
        lockRequests.push([...args]);
        if (busyStore && args.includes("/run/lock/jev-store-new-api-release.lock")) return { status: 75, stdout: "", stderr: "" };
        if (args.includes("repair-aliases")) {
          mutations.push({ file, args });
          return { status: 0, stdout: JSON.stringify({ repairedAliases: [] }), stderr: "" };
        }
        return { status: 0, stdout: JSON.stringify({ project: "store", issues: [], actions: [] }), stderr: "" };
      }
      if (file === NODE && args.includes("repair-aliases")) {
        mutations.push({ file, args });
        return { status: 0, stdout: JSON.stringify({ repairedAliases: [] }), stderr: "" };
      }
      return baseExec(file, args);
    },
  });
  return { api: overridden.api, mutations, lockRequests };
}

export function storeFixture(repo) {
  let databaseBytes = "VIRTUAL DATABASE: MUST STAY UNCHANGED";
  const original = databaseBytes;
  const entries = new Map([[LEGACY_DIR, "dir"], [DATABASE, "file"], [MARKER, "link"]]);
  const events = [];
  const api = load(repo, "store-compose.mjs", {
    existsSync: (p) => entries.has(p),
    lstatSync: (p) => {
      events.push({ op: "lstat", p });
      if (!entries.has(p)) throw ioError("ENOENT");
      return { isDirectory: () => entries.get(p) === "dir", isFile: () => entries.get(p) === "file", isSymbolicLink: () => entries.get(p) === "link", uid: p === MARKER ? 1000 : 0, mode: 0o600, nlink: 1 };
    },
    readlinkSync: (p) => p === MARKER ? DATABASE : COMPOSE,
    realpathSync: (p) => p === MARKER ? DATABASE : p,
    mkdirSync: (p) => { entries.set(p, "dir"); events.push({ op: "mkdir", p }); },
    writeFileSync: (p, data, options = {}) => {
      const flag = options.flag ?? "w";
      if ((typeof flag === "string" && flag.includes("x")) || (typeof flag === "number" && flag & constants.O_EXCL)) {
        if (entries.has(p)) throw ioError("EEXIST");
      }
      if (typeof flag === "number" && flag & constants.O_NOFOLLOW && entries.get(p) === "link") throw ioError("ELOOP");
      const target = entries.get(p) === "link" && p === MARKER ? DATABASE : p;
      events.push({ op: "write", p, target });
      if (target === DATABASE) databaseBytes = String(data);
      else entries.set(p, "file");
    },
    symlinkSync: (target, p) => { entries.set(p, "link"); events.push({ op: "symlink", target, p }); },
    readFileSync: () => { throw new Error("Unexpected VIRTUAL read; marker repro needs no contents"); },
    renameSync: () => { throw new Error("Unexpected VIRTUAL rename"); },
    unlinkSync: (p) => { entries.delete(p); events.push({ op: "unlink", p }); },
    spawnSync: () => { throw new Error("Unexpected VIRTUAL command; aliases() needs none"); },
  }, ["aliases", "buildCompose"]);
  return { api, events, get databaseUnchanged() { return databaseBytes === original; } };
}

async function invoke(fn) {
  try { return { result: await fn(), error: null }; }
  catch (error) {
    // Fail loudly for harness/API mismatches rather than counting them as safety.
    if (error instanceof ReferenceError || /Unexpected VIRTUAL|is not defined|is not a function/.test(error.message)) throw error;
    return { result: null, error: error.code ?? error.message };
  }
}

export async function runRepros(repo) {
  const rows = [];
  for (const fault of ["second-delete", "journal", "partial-first-delete"]) {
    const fixture = runnerFixture(repo, fault);
    const outcome = await invoke(() => fixture.api.projectRun(fixture.project, true));
    const lastChange = fixture.events.findLastIndex((e) => e.op === "destructive-change");
    const after = fixture.events.slice(lastChange + 1).filter((e) => e.op === "command");
    const guardAfter = after.some((e) => e.file === "sudo" && e.args.includes("check"));
    const restartAfter = after.some((e) => e.file === "systemctl" && e.args[0] === "restart");
    const httpAfter = after.filter((e) => e.file === "curl").length;
    const pidChecksAfter = after.filter((e) => e.file === "systemctl" && e.args[0] === "show").length;
    rows.push({ case: "partial-cleanup:" + fault, safe: fixture.destructiveChanges > 0 && guardAfter && restartAfter && httpAfter >= 2 && pidChecksAfter >= 2,
      destructiveChanges: fixture.destructiveChanges, guardAfter, restartAfter, httpAfter, pidChecksAfter, error: outcome.error });
  }
  const marker = storeFixture(repo);
  const markerOutcome = await invoke(() => marker.api.aliases());
  rows.push({ case: "store-marker-symlink", safe: marker.databaseUnchanged, databaseUnchanged: marker.databaseUnchanged,
    markerInspected: marker.events.some((e) => e.op === "lstat" && e.p === MARKER), error: markerOutcome.error });
  const policy = load(repo, "server-ops-policy.mjs", {});
  for (const raw of [ACTIVE_MICROS, TIMER_FORMATTED]) {
    const input = { activeState: "active", enabled: true, uptimeSeconds: UPTIME, maxLagSeconds: 600, lastTriggerMonotonic: raw };
    // Compatible with both the old numeric API and the main agent's raw API.
    if (/^\d+$/.test(raw)) input.lastTriggerSeconds = Number(raw) / 1e6;
    const healthy = policy.timerHealthy(input);
    rows.push({ case: "timer:" + (/^\d+$/.test(raw) ? "numeric" : "formatted"), safe: healthy === true, raw, healthy });
  }
  const vip = runnerFixture(repo, "none", "vip", { recover: false, cleanup: false });
  const vipOutcome = await invoke(() => vip.api.projectRun(vip.project, true));
  rows.push({ case: "vip:no-public-route-mutations-disabled", safe: vip.destructiveChanges === 0 && vipOutcome.result?.public?.healthy !== true,
    destructiveChanges: vip.destructiveChanges, public: vipOutcome.result?.public, issues: vipOutcome.result?.issues, error: vipOutcome.error });
  return rows;
}

if (pathFns.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const repo = pathFns.resolve(process.argv[2] ?? "/Users/lilinhai/Projects/jevhub");
  const rows = await runRepros(repo);
  for (const row of rows) console.log(JSON.stringify(row));
  if (process.argv.includes("--assert-safe") && rows.some((row) => !row.safe)) process.exitCode = 1;
}
