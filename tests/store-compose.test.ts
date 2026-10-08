import { spawnSync } from "node:child_process";
import { constants, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, renameSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const storeComposePath = resolve("scripts/store-compose.mjs");
const storeCompose = await import(storeComposePath);
const reviewerFixturePath = resolve("tests/helpers/server-ops-fixture.mjs");
const reviewerFixtures = await import(reviewerFixturePath);
const markerContents = "Protected Compose compatibility pointer; not an app release.\n";

function snapshot(items: unknown[]) {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e",
    `import { buildCompose } from ${JSON.stringify(resolve("scripts/store-compose.mjs"))}; try {console.log(JSON.stringify(buildCompose(JSON.parse(process.argv[1]))));} catch {process.exit(2);}`,
    JSON.stringify(items)], { encoding: "utf8" });
  return result;
}
function containers() {
  return ["new-api", "jev-adapter", "new-api-postgres", "new-api-redis"].map((service, index) => ({
    Name: `/jev-mvp-${service}-1`, Image: `sha256:${String(index).repeat(64)}`,
    State: { Running: true, Pid: 1000 + index },
    Config: { Labels: { "com.docker.compose.project": "jev-mvp", "com.docker.compose.service": service }, Env: ["PASSWORD=fixture-secret"], Cmd: ["run", "--password", "fixture-secret"], Entrypoint: ["entry"], WorkingDir: "/app", User: "", Healthcheck: { Test: ["CMD", "health"], Interval: 10e9, Timeout: 3e9, Retries: 5 } },
    HostConfig: { RestartPolicy: { Name: "unless-stopped" }, PortBindings: index === 0 ? { "3000/tcp": [{ HostIp: "127.0.0.1", HostPort: "3001" }] } : {}, Memory: 0, MemoryReservation: 0, MemorySwap: 0, MemorySwappiness: null, NanoCpus: 0, CpuPeriod: 0, CpuQuota: 0, CpuShares: 0, CpusetCpus: "", CpusetMems: "", CapAdd: null, CapDrop: null, SecurityOpt: null, ReadonlyRootfs: false, Privileged: false, PidsLimit: null, OomKillDisable: false, OomScoreAdj: 0 } as Record<string, unknown>,
    Mounts: index === 3 ? [{ Type: "volume", Name: "existing_anonymous_redis_volume", Destination: "/data", RW: true }] : [],
    NetworkSettings: { Networks: { "jev-mvp_jev-backend": { Aliases: [`jev-mvp-${service}-1`, service] } } },
  }));
}
describe("Store Compose runtime snapshot", () => {
  it("pins running images and reuses the exact Redis volume and network", () => {
    const result = snapshot(containers());
    expect(result.status, result.stderr).toBe(0);
    const data = JSON.parse(result.stdout);
    expect(data.name).toBe("jev-mvp");
    expect(data.services["new-api"].image).toMatch(/^sha256:/);
    expect(data.services["new-api"].pull_policy).toBe("never");
    expect(data.services["new-api"].ports).toEqual(["127.0.0.1:3001:3000/tcp"]);
    expect(data.volumes.existing_anonymous_redis_volume).toEqual({ external: true, name: "existing_anonymous_redis_volume" });
    expect(data.networks.backend).toEqual({ external: true, name: "jev-mvp_jev-backend" });
    expect(data.services["new-api-redis"].volumes).toEqual(["existing_anonymous_redis_volume:/data:rw"]);
    expect(data.services["new-api"].environment.PASSWORD).toBe("fixture-secret");
    expect(data.services["new-api"].command).toEqual(["run", "--password", "fixture-secret"]);
  });
  it("fails closed for missing, duplicate or foreign containers and unsupported mounts", () => {
    expect(snapshot(containers().slice(1)).status).toBe(2);
    expect(snapshot([...containers(), containers()[0]]).status).toBe(2);
    const foreign = containers(); foreign[0].Config.Labels["com.docker.compose.project"] = "foreign";
    expect(snapshot(foreign).status).toBe(2);
    const unsafe = containers(); unsafe[0].Mounts = [{ Type: "bind", Name: "", Destination: "/data", RW: true }];
    expect(snapshot(unsafe).status).toBe(2);
  });
  it("escapes Compose interpolation without changing external data volumes", () => {
    const items = containers();
    items[0].Config.Env = ["PASSWORD=literal${PASSWORD}$value"];
    items[0].Config.Cmd = ["echo", "$PASSWORD"];
    const data = JSON.parse(snapshot(items).stdout);
    expect(data.services["new-api"].environment.PASSWORD).toBe("literal$${PASSWORD}$$value");
    expect(data.services["new-api"].command).toEqual(["echo", "$$PASSWORD"]);
    expect(data.volumes.existing_anonymous_redis_volume).toEqual({ external: true, name: "existing_anonymous_redis_volume" });
  });
  it("requires all four containers to be running with live PIDs", () => {
    const stopped = containers(); stopped[0].State.Running = false;
    expect(snapshot(stopped).status).toBe(2);
    const noPid = containers(); noPid[0].State.Pid = 0;
    expect(snapshot(noPid).status).toBe(2);
  });
  it("keeps default resource and security fields omitted for the installed snapshot", () => {
    const omitted = containers();
    for (const item of omitted) item.HostConfig = { RestartPolicy: item.HostConfig.RestartPolicy, PortBindings: item.HostConfig.PortBindings };
    const defaults = containers();
    for (const item of defaults) Object.assign(item.HostConfig, {
      KernelMemory: 0, KernelMemoryTCP: 0, CpuRealtimePeriod: 0, CpuRealtimeRuntime: 0, CpuPercent: 0, CpuCount: 0,
      Ulimits: null, Devices: [], DeviceRequests: null, DeviceCgroupRules: null, Sysctls: {},
      CapAdd: [], CapDrop: [], SecurityOpt: [], PidsLimit: 0, OomKillDisable: null,
    });
    const installedShape = snapshot(omitted);
    const runtimeShape = snapshot(defaults);
    expect(installedShape.status).toBe(0);
    expect(runtimeShape.status).toBe(0);
    expect(runtimeShape.stdout).toBe(installedShape.stdout);
    const service = JSON.parse(runtimeShape.stdout).services["new-api"];
    for (const key of ["mem_limit", "mem_reservation", "memswap_limit", "mem_swappiness", "cpus", "cpu_period", "cpu_quota", "cpu_shares", "cpuset", "cap_add", "cap_drop", "security_opt", "read_only", "pids_limit", "oom_kill_disable", "oom_score_adj"]) expect(service).not.toHaveProperty(key);
  });
  it.each([
    ["Memory", 536870912, "mem_limit", 536870912],
    ["MemoryReservation", 268435456, "mem_reservation", 268435456],
    ["MemorySwap", 1073741824, "memswap_limit", 1073741824],
    ["MemorySwap", -1, "memswap_limit", -1],
    ["MemorySwappiness", 0, "mem_swappiness", 0],
    ["MemorySwappiness", 25, "mem_swappiness", 25],
    ["NanoCpus", 1500000001, "cpus", "1.500000001"],
    ["CpuPeriod", 100000, "cpu_period", 100000],
    ["CpuQuota", 50000, "cpu_quota", 50000],
    ["CpuShares", 256, "cpu_shares", 256],
    ["CpusetCpus", "0-1,3", "cpuset", "0-1,3"],
    ["CapAdd", ["NET_BIND_SERVICE"], "cap_add", ["NET_BIND_SERVICE"]],
    ["CapDrop", ["ALL"], "cap_drop", ["ALL"]],
    ["SecurityOpt", ["no-new-privileges:true", "apparmor=fixture-$profile"], "security_opt", ["no-new-privileges:true", "apparmor=fixture-$$profile"]],
    ["ReadonlyRootfs", true, "read_only", true],
    ["PidsLimit", 128, "pids_limit", 128],
    ["OomKillDisable", true, "oom_kill_disable", true],
    ["OomScoreAdj", 100, "oom_score_adj", 100],
  ])("preserves %s and includes its changes in snapshot equality", (field, value, key, expected) => {
    const original = snapshot(containers());
    const items = containers(); items[0].HostConfig[field as string] = value;
    const changed = snapshot(items);
    expect(changed.status, changed.stderr).toBe(0);
    expect(JSON.parse(changed.stdout).services["new-api"][key as string]).toEqual(expected);
    expect(changed.stdout).not.toBe(original.stdout);
  });
  it.each([
    ["Memory", -1], ["Memory", Number.MAX_SAFE_INTEGER + 1],
    ["MemorySwap", -2], ["MemorySwappiness", 101],
    ["NanoCpus", 1.5], ["CpuQuota", -2],
    ["CpusetCpus", "0;unsafe"], ["CapDrop", "ALL"],
    ["SecurityOpt", [false]], ["ReadonlyRootfs", "true"],
    ["Privileged", true], ["KernelMemory", 1024],
    ["CpuRealtimeRuntime", 1000], ["CpuPercent", 50],
    ["CpusetMems", "0"], ["Ulimits", [{ Name: "nofile", Soft: 1024, Hard: 2048 }]],
    ["DeviceRequests", [{ Capabilities: [["gpu"]] }]],
  ])("fails closed for unsupported or malformed %s restrictions", (field, value) => {
    const items = containers(); items[0].HostConfig[field as string] = value;
    expect(snapshot(items).status).toBe(2);
  });
});

describe("Store Compose alias repair", () => {
  let fixture: string;
  let snapshotPath: string;
  let legacyPaths: string[];

  beforeEach(() => {
    fixture = realpathSync(mkdtempSync(join(tmpdir(), "jevhub-store-compose-")));
    snapshotPath = join(fixture, "persistent", "compose.json");
    legacyPaths = ["4e286dd", "26857b6"].map((id) => join(fixture, "releases", id, "docker-compose.backend.yml"));
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, JSON.stringify(storeCompose.buildCompose(containers().sort((a, b) => a.Name.localeCompare(b.Name)))), { mode: 0o600 });
    for (const path of legacyPaths) mkdirSync(dirname(path), { recursive: true });
  });
  afterEach(() => rmSync(fixture, { recursive: true, force: true }));

  function repair(after: ReturnType<typeof containers> | ((count: number) => ReturnType<typeof containers>) = containers(), onInspect?: (count: number) => void) {
    let inspections = 0;
    const command = (name: string, args: string[]) => {
      if (name !== "docker") throw new Error("Only Docker inspection is allowed");
      if (args.join(" ") === "ps -aq --filter label=com.docker.compose.project=jev-mvp") {
        return { status: 0, stdout: "id0\nid1\nid2\nid3\n" };
      }
      if (args.join(" ") !== "inspect id0 id1 id2 id3") throw new Error("No container mutation is allowed");
      inspections += 1;
      onInspect?.(inspections);
      return { status: 0, stdout: JSON.stringify(typeof after === "function" ? after(inspections) : after) };
    };
    return storeCompose.aliases({ before: containers(), snapshotPath, legacyPaths, command });
  }

  it("does not truncate a database through a pre-existing marker symlink", () => {
    const database = join(fixture, "database-fixture");
    const original = "database pages must survive byte for byte\n";
    writeFileSync(database, original);
    const marker = join(dirname(legacyPaths[0]), ".backend-configuration-alias");
    symlinkSync(database, marker);
    let failed = false;
    try { repair(); } catch { failed = true; }
    expect(readFileSync(database, "utf8")).toBe(original);
    expect(readlinkSync(marker)).toBe(database);
    expect(failed).toBe(true);
    expect(legacyPaths.some(existsSync)).toBe(false);
    expect(readdirSync(dirname(legacyPaths[1]))).toEqual([]);
  });
  it("rejects the reviewer's virtual marker-symlink reproduction before any write", () => {
    const reviewed = reviewerFixtures.storeFixture(resolve("."));
    expect(() => reviewed.api.aliases()).toThrow(/Legacy marker/);
    expect(reviewed.databaseUnchanged).toBe(true);
    expect(reviewed.events.some((event: { op: string; p?: string }) => event.op === "lstat" && event.p?.endsWith("/.backend-configuration-alias"))).toBe(true);
    expect(reviewed.events.some((event: { op: string }) => ["write", "mkdir", "symlink"].includes(event.op))).toBe(false);
  });
  it("uses exclusive no-follow creation when a marker symlink arrives at the open boundary", () => {
    const marker = join(dirname(legacyPaths[0]), ".backend-configuration-alias");
    const database = join(fixture, "database-fixture");
    writeFileSync(database, "database bytes survive an open race");
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", `
      import fs from "node:fs";
      import { syncBuiltinESMExports } from "node:module";
      const options = JSON.parse(process.argv[1]);
      const originalOpen = fs.openSync;
      let creationFlags;
      fs.openSync = (path, flags, mode) => {
        if (path === options.marker && typeof flags === "number" && (flags & fs.constants.O_WRONLY)) {
          creationFlags = flags;
          fs.symlinkSync(options.database, path);
        }
        return originalOpen(path, flags, mode);
      };
      syncBuiltinESMExports();
      const store = await import(options.module);
      const command = (name, args) => {
        if (name !== "docker") throw new Error("No external command permitted");
        if (args.join(" ") === "ps -aq --filter label=com.docker.compose.project=jev-mvp") return { status: 0, stdout: "id0\\nid1\\nid2\\nid3\\n" };
        if (args.join(" ") !== "inspect id0 id1 id2 id3") throw new Error("No container mutation permitted");
        return { status: 0, stdout: JSON.stringify(options.before) };
      };
      try { store.aliases({ before: options.before, snapshotPath: options.snapshotPath, legacyPaths: options.legacyPaths, command }); }
      catch { process.exitCode = 2; }
      console.log(JSON.stringify({ creationFlags }));
    `, JSON.stringify({ module: storeComposePath, before: containers(), snapshotPath, legacyPaths, marker, database })], { encoding: "utf8" });
    expect(readFileSync(database, "utf8")).toBe("database bytes survive an open race");
    expect(result.status, result.stderr).toBe(2);
    const flags = JSON.parse(result.stdout).creationFlags;
    expect(flags & constants.O_EXCL).toBe(constants.O_EXCL);
    expect(flags & constants.O_NOFOLLOW).toBe(constants.O_NOFOLLOW);
    expect(flags & constants.O_TRUNC).toBe(0);
    expect(readlinkSync(marker)).toBe(database);
    expect(legacyPaths.some(existsSync)).toBe(false);
    expect(readdirSync(dirname(legacyPaths[1]))).toEqual([]);
  });
  it("leaves an existing correct marker's inode, timestamp and bytes unchanged", () => {
    const marker = join(dirname(legacyPaths[0]), ".backend-configuration-alias");
    writeFileSync(marker, markerContents);
    utimesSync(marker, 1234567890, 1234567890);
    const before = lstatSync(marker);
    expect(repair()).toEqual(legacyPaths);
    const after = lstatSync(marker);
    expect(after.ino).toBe(before.ino);
    expect(after.mtimeMs).toBe(before.mtimeMs);
    expect(readFileSync(marker, "utf8")).toBe(markerContents);
    expect(legacyPaths.map((path) => readlinkSync(path))).toEqual([snapshotPath, snapshotPath]);
  });
  it("makes zero writes when either marker contains unexpected data", () => {
    const marker = join(dirname(legacyPaths[1]), ".backend-configuration-alias");
    writeFileSync(marker, "protected runtime data");
    expect(() => repair()).toThrow();
    expect(readFileSync(marker, "utf8")).toBe("protected runtime data");
    expect(readdirSync(dirname(legacyPaths[0]))).toEqual([]);
    expect(legacyPaths.some(existsSync)).toBe(false);
  });
  it("rejects symlinked directory traversal before creating any directory or pointer", () => {
    const protectedDirectory = join(fixture, "protected");
    mkdirSync(protectedDirectory);
    const parent = join(fixture, "redirected-releases");
    symlinkSync(protectedDirectory, parent);
    legacyPaths = ["4e286dd", "26857b6"].map((id) => join(parent, id, "docker-compose.backend.yml"));
    expect(() => repair()).toThrow();
    expect(readdirSync(protectedDirectory)).toEqual([]);
  });
  it("rejects a changed dangling pointer before writing either compatibility directory", () => {
    symlinkSync(join(fixture, "missing-foreign-snapshot"), legacyPaths[1]);
    expect(() => repair()).toThrow();
    expect(readdirSync(dirname(legacyPaths[0]))).toEqual([]);
    expect(readdirSync(dirname(legacyPaths[1]))).toEqual(["docker-compose.backend.yml"]);
  });
  it.each(["configuration", "PID", "running state", "resource restriction"])("re-inspects and blocks all pointer writes after a %s change", (change) => {
    const after = containers();
    if (change === "configuration") after[0].Config.Env = ["PASSWORD=changed-fixture"];
    if (change === "PID") after[0].State.Pid += 1;
    if (change === "running state") after[0].State.Running = false;
    if (change === "resource restriction") after[0].HostConfig.Memory = 1024;
    expect(() => repair(after)).toThrow();
    for (const path of legacyPaths) expect(readdirSync(dirname(path))).toEqual([]);
  });
  it("revalidates entries changed at the command boundary without following a new marker symlink", () => {
    const database = join(fixture, "database-fixture");
    writeFileSync(database, "unchanged database bytes");
    expect(() => repair(containers(), () => {
      const marker = join(dirname(legacyPaths[0]), ".backend-configuration-alias");
      if (!existsSync(marker)) symlinkSync(database, marker);
    })).toThrow();
    expect(readFileSync(database, "utf8")).toBe("unchanged database bytes");
    expect(legacyPaths.some(existsSync)).toBe(false);
  });
  it("stops before the next alias write if a PID changes between pointers", () => {
    for (const path of legacyPaths) writeFileSync(join(dirname(path), ".backend-configuration-alias"), markerContents);
    const changed = containers(); changed[0].State.Pid += 1;
    expect(() => repair((count) => count === 1 ? containers() : changed)).toThrow();
    expect(readlinkSync(legacyPaths[0])).toBe(snapshotPath);
    expect(existsSync(legacyPaths[1])).toBe(false);
    expect(readFileSync(join(dirname(legacyPaths[1]), ".backend-configuration-alias"), "utf8")).toBe(markerContents);
  });
  it("rejects a directory replaced during runtime inspection before creating a marker", () => {
    const original = dirname(legacyPaths[0]);
    const moved = join(fixture, "moved-directory");
    const protectedDirectory = join(fixture, "protected-directory");
    mkdirSync(protectedDirectory);
    expect(() => repair(containers(), () => {
      renameSync(original, moved);
      symlinkSync(protectedDirectory, original);
    })).toThrow();
    expect(readdirSync(protectedDirectory)).toEqual([]);
    expect(readdirSync(moved)).toEqual([]);
    expect(readdirSync(dirname(legacyPaths[1]))).toEqual([]);
  });
  it("blocks pointer writes if the persistent snapshot changes during inspection", () => {
    expect(() => repair(containers(), () => writeFileSync(snapshotPath, "{}"))).toThrow();
    for (const path of legacyPaths) expect(readdirSync(dirname(path))).toEqual([]);
  });
  it("restores missing compatibility directories with stable runtime checks", () => {
    for (const path of legacyPaths) rmSync(dirname(path), { recursive: true });
    expect(repair()).toEqual(legacyPaths);
    for (const path of legacyPaths) {
      expect(readlinkSync(path)).toBe(snapshotPath);
      expect(readFileSync(join(dirname(path), ".backend-configuration-alias"), "utf8")).toBe(markerContents);
    }
  });
  it("creates no missing directory if the runtime has changed", () => {
    for (const path of legacyPaths) rmSync(dirname(path), { recursive: true });
    const changed = containers(); changed[0].State.Pid += 1;
    expect(() => repair(changed)).toThrow();
    for (const path of legacyPaths) expect(existsSync(dirname(path))).toBe(false);
  });
  it("repairs exactly two aliases and an idempotent rerun leaves their markers untouched", () => {
    expect(repair()).toEqual(legacyPaths);
    const before = legacyPaths.map((path) => lstatSync(join(dirname(path), ".backend-configuration-alias")));
    expect(repair()).toEqual([]);
    legacyPaths.forEach((path, index) => {
      expect(readlinkSync(path)).toBe(snapshotPath);
      const marker = join(dirname(path), ".backend-configuration-alias");
      expect(readFileSync(marker, "utf8")).toBe(markerContents);
      expect(lstatSync(marker).mtimeMs).toBe(before[index].mtimeMs);
    });
  });
});
