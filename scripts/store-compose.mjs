#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { constants, existsSync, mkdirSync, writeFileSync, readFileSync, lstatSync, readlinkSync, realpathSync, openSync, closeSync, fstatSync, symlinkSync, renameSync, unlinkSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const destination = "/etc/jevhub-ops/jev-mvp/compose.json";
const legacy = ["4e286dd", "26857b6"].map((id) => `/home/ubuntu/jev-store-new-api/releases/${id}/docker-compose.backend.yml`);
const expected = ["new-api", "jev-adapter", "new-api-postgres", "new-api-redis"];
const script = fileURLToPath(import.meta.url);
const markerContents = "Protected Compose compatibility pointer; not an app release.\n";
const escaped = (value) => typeof value === "string" ? value.replaceAll("$", () => "$$") : Array.isArray(value) ? value.map(escaped) : value;

// NewAPI's official logger skips duplicate disk output when log-dir is empty.
// Preserve all unrelated flags; never replace the whole command in an override.
export function stdoutCommand(command) {
  if (!Array.isArray(command) || command.some(value => typeof value !== "string" || /[\0\r\n]/.test(value))) throw new Error("Invalid NewAPI command");
  const result = [...command];
  let found = false;
  for (let index = 0; index < result.length; index++) {
    if (result[index] === "--log-dir") {
      if (index + 1 >= result.length || result[index + 1].startsWith("--")) throw new Error("Ambiguous log-dir command");
      result[++index] = "";
      found = true;
    } else if (result[index].startsWith("--log-dir=")) {
      result[index] = "--log-dir=";
      found = true;
    }
  }
  if (!found) result.push("--log-dir", "");
  return result;
}

function restrictions(host, data) {
  const integer = (from, to, minimum = 0, maximum = Number.MAX_SAFE_INTEGER, includeZero = false) => {
    const value = host[from];
    if (value == null) return;
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new Error("Unsupported runtime resource restriction");
    if (value !== 0 || includeZero) data[to] = value;
  };
  for (const [from, to] of [["Memory", "mem_limit"], ["MemoryReservation", "mem_reservation"], ["CpuShares", "cpu_shares"], ["CpuPeriod", "cpu_period"]]) integer(from, to);
  integer("MemorySwap", "memswap_limit", -1);
  integer("MemorySwappiness", "mem_swappiness", 0, 100, true);
  integer("CpuQuota", "cpu_quota", -1);
  integer("PidsLimit", "pids_limit", -1);
  integer("OomScoreAdj", "oom_score_adj", -1000, 1000);
  if (host.NanoCpus != null && (!Number.isSafeInteger(host.NanoCpus) || host.NanoCpus < 0)) throw new Error("Unsupported runtime CPU restriction");
  if (host.NanoCpus) {
    if (host.CpuPeriod || host.CpuQuota) throw new Error("Conflicting runtime CPU restrictions");
    // Keep nanocpu precision without rounding through a floating-point ratio.
    const nanos = BigInt(host.NanoCpus);
    const fraction = String(nanos % 1000000000n).padStart(9, "0").replace(/0+$/, "");
    data.cpus = `${nanos / 1000000000n}${fraction ? `.${fraction}` : ""}`;
  }
  if (host.CpusetCpus != null) {
    if (typeof host.CpusetCpus !== "string" || (host.CpusetCpus && !/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(host.CpusetCpus))) throw new Error("Unsupported runtime CPU affinity");
    if (host.CpusetCpus) data.cpuset = host.CpusetCpus;
  }
  for (const [from, to] of [["CapAdd", "cap_add"], ["CapDrop", "cap_drop"], ["SecurityOpt", "security_opt"]]) {
    const value = host[from];
    if (value == null) continue;
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || !entry || /[\0\r\n]/.test(entry) || (from !== "SecurityOpt" && !/^[A-Za-z][A-Za-z0-9_]*$/.test(entry)))) throw new Error("Unsupported runtime security restriction");
    if (value.length) data[to] = escaped(value);
  }
  for (const [from, to] of [["ReadonlyRootfs", "read_only"], ["OomKillDisable", "oom_kill_disable"]]) {
    if (host[from] != null && typeof host[from] !== "boolean") throw new Error("Unsupported runtime security restriction");
    if (host[from]) data[to] = true;
  }
  // Do not silently discard restrictions with no supported reconstruction here.
  for (const field of ["KernelMemory", "KernelMemoryTCP", "CpuRealtimePeriod", "CpuRealtimeRuntime", "CpuPercent", "CpuCount", "BlkioWeight"]) if (host[field] != null && host[field] !== 0) throw new Error("Unsupported runtime resource restriction");
  for (const field of ["CpusetMems", "CgroupParent", "UsernsMode", "PidMode", "UTSMode"]) if (host[field] != null && host[field] !== "") throw new Error("Unsupported runtime isolation restriction");
  for (const field of ["Ulimits", "Devices", "DeviceRequests", "DeviceCgroupRules", "BlkioWeightDevice", "BlkioDeviceReadBps", "BlkioDeviceWriteBps", "BlkioDeviceReadIOps", "BlkioDeviceWriteIOps"]) if (host[field] != null && (!Array.isArray(host[field]) || host[field].length)) throw new Error("Unsupported runtime resource restriction");
  if (host.Privileged != null && host.Privileged !== false) throw new Error("Unsupported privileged runtime");
  if (host.Sysctls != null && (typeof host.Sysctls !== "object" || Array.isArray(host.Sysctls) || Object.keys(host.Sysctls).length)) throw new Error("Unsupported runtime kernel restriction");
}

export function buildCompose(items) {
  if (items.length !== expected.length) throw new Error("Exactly four Store containers required");
  const services = {}, volumes = {};
  for (const item of items) {
    if (item.State?.Running !== true || !Number.isSafeInteger(item.State.Pid) || item.State.Pid <= 0) throw new Error("All four Store containers must be running");
    const service = item.Config.Labels["com.docker.compose.service"];
    if (item.Config.Labels["com.docker.compose.project"] !== "jev-mvp" || !expected.includes(service) || services[service]) throw new Error("Foreign or duplicate service");
    if (!/^sha256:[a-f0-9]{64}$/.test(item.Image)) throw new Error("Unpinned runtime image");
    if (Object.keys(item.NetworkSettings.Networks).join(",") !== "jev-mvp_jev-backend") throw new Error("Unexpected network");
    const environment = {};
    for (const entry of item.Config.Env ?? []) {
      const index = entry.indexOf("=");
      if (index < 1) throw new Error("Invalid environment entry");
      // Compose interprets dollar signs, even in JSON. Escape interpolation.
      environment[entry.slice(0, index)] = escaped(entry.slice(index + 1));
    }
    const data = {
      image: item.Image, pull_policy: "never", container_name: item.Name.replace(/^\//, ""),
      restart: item.HostConfig.RestartPolicy.Name, environment,
      command: escaped(item.Config.Cmd), entrypoint: escaped(item.Config.Entrypoint),
      networks: { backend: { aliases: item.NetworkSettings.Networks["jev-mvp_jev-backend"].Aliases ?? [service] } },
    };
    restrictions(item.HostConfig, data);
    const logging = item.HostConfig.LogConfig;
    if (logging != null) {
      if (!logging || typeof logging !== "object" || Array.isArray(logging) ||
          typeof logging.Type !== "string" || !/^[a-z][a-z0-9-]*$/.test(logging.Type) ||
          !logging.Config || typeof logging.Config !== "object" || Array.isArray(logging.Config) ||
          Object.entries(logging.Config).some(([key, value]) => !/^[a-z][a-z0-9.-]*$/.test(key) || typeof value !== "string" || /[\0\r\n]/.test(value))) {
        throw new Error("Unsupported runtime logging configuration");
      }
      // Keep old default-json snapshots compatible, but never discard actual
      // rotation settings or a non-default driver during runtime reconstruction.
      if (logging.Type !== "json-file" || Object.keys(logging.Config).length) {
        data.logging = { driver: logging.Type, options: Object.fromEntries(Object.entries(logging.Config).map(([key, value]) => [key, escaped(value)])) };
      }
    }
    if (item.Config.WorkingDir) data.working_dir = item.Config.WorkingDir;
    if (item.Config.User) data.user = item.Config.User;
    if (item.Config.StopSignal) data.stop_signal = item.Config.StopSignal;
    if (item.Config.StopTimeout) data.stop_grace_period = `${item.Config.StopTimeout}s`;
    const mounts = [];
    for (const mount of item.Mounts) {
      if (mount.Type !== "volume" || !/^[A-Za-z0-9_.-]+$/.test(mount.Name)) throw new Error("Unsupported mount; do not reconstruct blindly");
      volumes[mount.Name] = { external: true, name: mount.Name };
      mounts.push(`${mount.Name}:${mount.Destination}:${mount.RW ? "rw" : "ro"}`);
    }
    if (mounts.length) data.volumes = mounts;
    const ports = [];
    for (const [port, bindings] of Object.entries(item.HostConfig.PortBindings ?? {})) {
      for (const binding of bindings ?? []) {
        if (binding.HostIp !== "127.0.0.1") throw new Error("Refuse to publish a new external port");
        ports.push(`${binding.HostIp}:${binding.HostPort}:${port}`);
      }
    }
    if (ports.length) data.ports = ports;
    const health = item.Config.Healthcheck;
    if (health) {
      data.healthcheck = { test: escaped(health.Test) };
      for (const [from, to] of [["Interval", "interval"], ["Timeout", "timeout"], ["StartPeriod", "start_period"], ["StartInterval", "start_interval"]]) if (health[from]) data.healthcheck[to] = `${health[from]}ns`;
      if (health.Retries) data.healthcheck.retries = health.Retries;
    }
    services[service] = data;
  }
  services["new-api"].depends_on = { "new-api-postgres": { condition: "service_healthy" }, "jev-adapter": { condition: "service_healthy" }, "new-api-redis": { condition: "service_started" } };
  return { name: "jev-mvp", services, volumes, networks: { backend: { external: true, name: "jev-mvp_jev-backend" } } };
}

function inspect(command = spawnSync) {
  const list = command("docker", ["ps", "-aq", "--filter", "label=com.docker.compose.project=jev-mvp"], { encoding: "utf8", timeout: 10000 });
  if (list.status !== 0) throw new Error("Docker list failed");
  const ids = list.stdout.trim().split("\n").filter(Boolean);
  if (ids.length !== 4) throw new Error("Store container count changed");
  const result = command("docker", ["inspect", ...ids], { encoding: "utf8", timeout: 10000, maxBuffer: 8e6 });
  if (result.status !== 0) throw new Error("Docker inspect failed");
  return JSON.parse(result.stdout).sort((a, b) => a.Name.localeCompare(b.Name));
}
function statEntry(path) {
  try { return lstatSync(path); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
function sameEntry(left, right, directory = false) {
  if (!left || !right) return left === right;
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode && left.uid === right.uid && left.gid === right.gid &&
    (directory || (left.nlink === right.nlink && left.size === right.size && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs));
}
function checkDirectory(path, stat) {
  if (stat && (!stat.isDirectory() || realpathSync(path) !== path)) throw new Error("Legacy directory traversal is not canonical");
}
function checkMarker(path, stat) {
  if (!stat) return;
  if (!stat.isFile() || stat.nlink !== 1 || stat.size !== Buffer.byteLength(markerContents) || (stat.mode & 0o022)) throw new Error("Legacy marker unexpectedly changed");
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!sameEntry(stat, fstatSync(fd)) || readFileSync(fd, "utf8") !== markerContents || !sameEntry(stat, fstatSync(fd)) || !sameEntry(stat, statEntry(path))) throw new Error("Legacy marker unexpectedly changed");
  } finally { closeSync(fd); }
}
// Injectable paths are an import-only fixture seam; the CLI keeps fixed paths.
export function aliases({ before, snapshotPath = destination, legacyPaths = legacy, command = spawnSync } = {}) {
  if (legacyPaths.length !== 2 || new Set(legacyPaths).size !== 2 || resolve(snapshotPath) !== snapshotPath || !constants.O_NOFOLLOW) throw new Error("Invalid compatibility pointer paths");
  const directories = new Map();
  const entries = new Map();
  const rememberDirectories = (path) => {
    if (resolve(path) !== path) throw new Error("Legacy path is not canonical");
    const chain = [];
    for (let directory = dirname(path); ; directory = dirname(directory)) {
      chain.unshift(directory);
      if (dirname(directory) === directory) break;
    }
    for (const directory of chain) {
      const stat = statEntry(directory);
      checkDirectory(directory, stat);
      if (!directories.has(directory)) directories.set(directory, stat);
    }
  };
  rememberDirectories(snapshotPath);
  const plans = legacyPaths.map((path) => {
    rememberDirectories(path);
    const pointer = statEntry(path);
    if (pointer && (!pointer.isSymbolicLink() || readlinkSync(path) !== snapshotPath)) throw new Error("Legacy configuration unexpectedly changed");
    const marker = join(dirname(path), ".backend-configuration-alias");
    const markerStat = statEntry(marker);
    checkMarker(marker, markerStat);
    entries.set(path, pointer);
    entries.set(marker, markerStat);
    return { path, marker, pointer };
  });
  const compose = buildCompose([...before].sort((a, b) => a.Name.localeCompare(b.Name)));
  const snapshotStat = statEntry(snapshotPath);
  if (!snapshotStat?.isFile() || snapshotStat.nlink !== 1 || (snapshotStat.mode & 0o077)) throw new Error("Persistent snapshot is not a protected regular file");
  const snapshotFd = openSync(snapshotPath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!sameEntry(snapshotStat, fstatSync(snapshotFd)) || JSON.stringify(JSON.parse(readFileSync(snapshotFd, "utf8"))) !== JSON.stringify(compose) || !sameEntry(snapshotStat, fstatSync(snapshotFd))) throw new Error("No matching persistent snapshot");
  } finally { closeSync(snapshotFd); }
  entries.set(snapshotPath, snapshotStat);
  const beforeWrite = () => {
    const after = inspect(command);
    if (JSON.stringify(buildCompose(after)) !== JSON.stringify(compose) || before.some((item) => !after.some((next) => next.Name === item.Name && next.State.Pid === item.State.Pid))) throw new Error("Containers changed before alias repair");
    // Docker inspection is an external boundary: recheck every filesystem entry
    // afterwards, including missing entries and all directory ancestors.
    for (const [path, saved] of directories) {
      const current = statEntry(path);
      checkDirectory(path, current);
      if (!sameEntry(saved, current, true)) throw new Error("Legacy directory changed before alias repair");
    }
    for (const [path, saved] of entries) if (!sameEntry(saved, statEntry(path))) throw new Error("Legacy entry changed before alias repair");
  };
  const repaired = [];
  for (const plan of plans) {
    if (plan.pointer) continue;
    for (const [directory, stat] of directories) {
      if (stat || (!dirname(plan.path).startsWith(`${directory}/`) && dirname(plan.path) !== directory)) continue;
      beforeWrite();
      mkdirSync(directory, { mode: 0o755 });
      const created = lstatSync(directory);
      checkDirectory(directory, created);
      directories.set(directory, created);
    }
    if (!entries.get(plan.marker)) {
      beforeWrite();
      // Never truncate an existing inode or follow a symlink, even if it
      // appeared after validation. Write only to the exclusively created fd.
      const fd = openSync(plan.marker, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o644);
      try {
        const created = fstatSync(fd);
        if (!sameEntry(created, statEntry(plan.marker)) || !created.isFile() || created.nlink !== 1) throw new Error("Legacy marker changed during creation");
        writeFileSync(fd, markerContents);
        entries.set(plan.marker, fstatSync(fd));
      } finally { closeSync(fd); }
    }
    beforeWrite();
    // symlinkSync fails on any existing entry, including dangling symlinks.
    symlinkSync(snapshotPath, plan.path);
    entries.set(plan.path, lstatSync(plan.path));
    repaired.push(plan.path);
  }
  return repaired;
}
function main() {
  const mode = process.argv[2] ?? "audit";
  if (!["install", "repair-aliases", "audit"].includes(mode)) throw new Error("Usage: store-compose.mjs audit|install|repair-aliases");
  if (mode !== "audit" && process.getuid?.() !== 0) throw new Error("Root required");
  const before = inspect(); const compose = buildCompose(before);
  let configured = false;
  if (existsSync(destination)) {
    const stat = lstatSync(destination);
    if (!stat.isFile() || stat.uid !== 0 || (stat.mode & 0o077)) throw new Error("Compose credentials must remain root-only");
    // Stable ordering of the snapshot is derived from sorted container names.
    configured = JSON.stringify(JSON.parse(readFileSync(destination, "utf8"))) === JSON.stringify(compose);
    if (!configured) throw new Error("Live runtime differs from stored snapshot; do not overwrite");
  }
  if (mode === "install" && !configured) {
    mkdirSync(dirname(destination), { recursive: true, mode: 0o700 });
    const temporary = `${destination}.pending`;
    if (existsSync(temporary)) throw new Error("Pending Compose installation exists");
    writeFileSync(temporary, JSON.stringify(compose, null, 2) + "\n", { mode: 0o600 });
    const check = spawnSync("docker", ["compose", "-p", "jev-mvp", "-f", temporary, "config", "--quiet"], { encoding: "utf8", timeout: 15000 });
    if (check.status !== 0) { unlinkSync(temporary); throw new Error("Compose validation failed (credentials not logged)"); }
    const after = inspect();
    if (JSON.stringify(buildCompose(after)) !== JSON.stringify(compose) || before.some((item, index) => item.State.Pid !== after[index].State.Pid)) { unlinkSync(temporary); throw new Error("Containers changed during snapshot"); }
    renameSync(temporary, destination); configured = true;
  }
  if (mode === "repair-aliases" && !configured) throw new Error("No matching persistent snapshot");
  const repaired = mode === "audit" ? [] : aliases({ before });
  console.log(JSON.stringify({ configured, repairedAliases: repaired, containersUntouched: true, imagesPinned: true, volumesPreserved: true }));
}

if (resolve(process.argv[1] ?? "") === script) {
  try { main(); }
  catch { console.error("FAIL Store Compose validation; live containers were not changed and credentials were not logged"); process.exitCode = 1; }
}
