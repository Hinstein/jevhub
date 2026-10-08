import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function cleanup(fault: string) {
  const run = spawnSync(process.execPath, ["--input-type=module", "-e", `
    import { runnerFixture } from ${JSON.stringify(resolve("tests/helpers/server-ops-fixture.mjs"))};
    const f = runnerFixture(process.cwd(), process.argv[1]);
    let result, error;
    try { result = await f.api.projectRun(f.project, true); } catch(e) { error = e.code ?? e.message; }
    const last = f.events.findLastIndex(e => e.op === "destructive-change");
    const commands = f.events.slice(last + 1).filter(e => e.op === "command");
    console.log(JSON.stringify({ result, error, changes: f.destructiveChanges,
      guard: commands.some(e => e.file === "sudo" && e.args.includes("check")),
      restart: commands.some(e => e.file === "systemctl" && e.args[0] === "restart"),
      http: commands.filter(e => e.file === "curl").length,
      pid: commands.filter(e => e.file === "systemctl" && e.args[0] === "show").length }));
  `, fault], { encoding: "utf8" });
  expect(run.status, run.stderr).toBe(0);
  return JSON.parse(run.stdout);
}

describe("production cleanup failure finalization", () => {
  it.each(["second-delete", "journal", "partial-first-delete"])("checks dependencies, HTTP and stability after %s", (fault) => {
    const result = cleanup(fault);
    expect(result.changes).toBeGreaterThan(0);
    expect(result.guard).toBe(true);
    expect(result.restart).toBe(true);
    expect(result.http).toBeGreaterThanOrEqual(2);
    expect(result.pid).toBeGreaterThanOrEqual(2);
    expect(result.result.issues.some((entry: { code: string }) => entry.code === "cleanup-interrupted")).toBe(true);
  });
  it("does not delete VIP releases when public verification is unconfigured", () => {
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", `
      import { runnerFixture } from ${JSON.stringify(resolve("tests/helpers/server-ops-fixture.mjs"))};
      const f = runnerFixture(process.cwd(), "none", "vip", { recover: true, cleanup: true });
      const result = await f.api.projectRun(f.project, true);
      console.log(JSON.stringify({ result, changes: f.destructiveChanges }));
    `], { encoding: "utf8" });
    expect(run.status, run.stderr).toBe(0);
    const result = JSON.parse(run.stdout);
    expect(result.changes).toBe(0);
    expect(result.result.public.healthy).toBe(false);
    expect(result.result.issues).toContainEqual({ key: "vip", code: "public-verification-unconfigured" });
  });
});

describe("Store pointer maintenance coordination", () => {
  it.each([[false, false], [true, true]])("does not repair aliases with storePresent=%s busyStore=%s", (storePresent, busyStore) => {
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", `
      import { mainFixture } from ${JSON.stringify(resolve("tests/helpers/server-ops-fixture.mjs"))};
      const f = mainFixture(process.cwd(), ${storePresent}, ${busyStore});
      await f.api.main();
      console.log(JSON.stringify({ mutations: f.mutations, locks: f.lockRequests }));
    `], { encoding: "utf8" });
    expect(run.status, run.stderr).toBe(0);
    const result = JSON.parse(run.stdout);
    expect(result.mutations).toEqual([]);
    if (storePresent) expect(result.locks.some((args: string[]) => args.includes("/run/lock/jev-store-new-api-release.lock") && args.includes("repair-aliases"))).toBe(true);
  });
});
