import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const policy = resolve("scripts/server-ops-policy.mjs");
const temporary: string[] = [];
function evaluate(fn: string, ...args: unknown[]) {
  const call = spawnSync(process.execPath, ["--input-type=module", "-e",
    `import * as p from ${JSON.stringify(policy)}; console.log(JSON.stringify(p[process.argv[1]](...JSON.parse(process.argv[2]))));`,
    fn, JSON.stringify(args)], { encoding: "utf8" });
  expect(call.status, call.stderr).toBe(0);
  return JSON.parse(call.stdout);
}
function project() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "server-ops-test-")));
  temporary.push(root);
  mkdirSync(join(root, "releases", "current"), { recursive: true });
  mkdirSync(join(root, "releases", "old"));
  mkdirSync(join(root, "shared"));
  symlinkSync(join(root, "releases", "current"), join(root, "current"));
  return root;
}
afterEach(() => { for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true }); });

describe("bounded server operations policy", () => {
  it("treats successful idle oneshots and protected HTTP 401 as normal", () => {
    expect(evaluate("unitHealthy", { ActiveState: "inactive", Type: "oneshot", Result: "success", ExecMainStatus: "0" })).toBe(true);
    expect(evaluate("unitHealthy", { ActiveState: "failed", Type: "oneshot", Result: "exit-code", ExecMainStatus: "1" })).toBe(false);
    expect(evaluate("httpHealthy", 401, [401])).toBe(true);
    expect(evaluate("httpHealthy", 401, [200])).toBe(false);
  });
  it("never restarts on expired Gmail credentials or HTTP-only failures", () => {
    const base = { allowed: true, activeState: "failed", guardPassed: true, diskBytes: 4e9, now: 1_800_000_000_000, attempts: [] };
    expect(evaluate("restartDecision", { ...base, reason: "oauth-required" }).allowed).toBe(false);
    expect(evaluate("restartDecision", { ...base, reason: "http" }).allowed).toBe(false);
    expect(evaluate("restartDecision", { ...base, reason: "unit", activeState: "active" }).allowed).toBe(false);
  });
  it("requires allowlist, guard, free disk, cooldown and a bounded daily budget", () => {
    const base = { allowed: true, reason: "unit", activeState: "failed", guardPassed: true, diskBytes: 4e9, now: 1_800_000_000_000, attempts: [] };
    expect(evaluate("restartDecision", base).allowed).toBe(true);
    for (const override of [{ allowed: false }, { guardPassed: false }, { diskBytes: 1e8 }, { attempts: [base.now - 1_000] }, { attempts: [base.now - 3_600_000, base.now - 7_200_000] }]) {
      expect(evaluate("restartDecision", { ...base, ...override }).allowed).toBe(false);
    }
  });
  it("rejects current, traversal, symlinked releases and stale selection", () => {
    const root = project();
    const current = join(root, "releases", "current");
    expect(evaluate("candidateDecision", root, current, current, []).allowed).toBe(false);
    expect(evaluate("candidateDecision", root, join(root, "releases", "..", "shared"), current, []).allowed).toBe(false);
    symlinkSync(join(root, "shared"), join(root, "releases", "alias"));
    expect(evaluate("candidateDecision", root, join(root, "releases", "alias"), current, []).allowed).toBe(false);
    expect(evaluate("candidateDecision", root, join(root, "releases", "old"), join(root, "releases", "other"), []).allowed).toBe(false);
  });
  it("blocks old releases referenced by a process, unit, container or other release symlink", () => {
    const root = project(); const old = join(root, "releases", "old"); const current = join(root, "releases", "current");
    for (const source of ["process", "systemd", "docker-config", "docker-mount"]) {
      expect(evaluate("candidateDecision", root, old, current, [{ source, path: join(old, "nested", "file") }]).reason).toBe("referenced-release");
    }
    symlinkSync(join(old, "node_modules"), join(current, "node_modules"));
    mkdirSync(join(old, "node_modules"));
    expect(evaluate("candidateDecision", root, old, current, []).allowed).toBe(false);
  });
  it("protects real environment files and runtime data but permits shared env links and examples", () => {
    const root = project(); const old = join(root, "releases", "old"); const current = join(root, "releases", "current");
    writeFileSync(join(old, ".env.production"), "SECRET=never-print-this\n");
    const blocked = evaluate("candidateDecision", root, old, current, []);
    expect(blocked.allowed).toBe(false);
    expect(JSON.stringify(blocked)).not.toContain("never-print-this");
    rmSync(join(old, ".env.production"));
    writeFileSync(join(old, ".env.example"), "SECRET=example\n");
    writeFileSync(join(root, "shared", ".env.production"), "SECRET=never-print-this\n");
    symlinkSync(join(root, "shared", ".env.production"), join(old, ".env.production"));
    expect(evaluate("candidateDecision", root, old, current, []).allowed).toBe(true);
    mkdirSync(join(old, "data"));
    expect(evaluate("candidateDecision", root, old, current, []).allowed).toBe(false);
  });
  it("deduplicates incidents by meaning, not volatile timestamps or counters", () => {
    const a = [{ key: "gmail", code: "oauth-required", detail: "one account" }];
    expect(evaluate("incidentKey", a)).toBe(evaluate("incidentKey", a));
    expect(evaluate("incidentKey", a)).not.toBe(evaluate("incidentKey", [{ key: "gmail", code: "healthy" }]));
  });
  it("detects disabled/stale timers without flagging successful idle jobs", () => {
    const input = { activeState: "active", enabled: true, uptimeSeconds: 100000, lastTriggerSeconds: 99000, maxLagSeconds: 36 * 3600 };
    expect(evaluate("timerHealthy", input)).toBe(true);
    expect(evaluate("timerHealthy", { ...input, enabled: false })).toBe(false);
    expect(evaluate("timerHealthy", { ...input, lastTriggerSeconds: 1, maxLagSeconds: 600 })).toBe(false);
    expect(evaluate("timerHealthy", { ...input, uptimeSeconds: 100, lastTriggerSeconds: 0 })).toBe(true);
  });
});
