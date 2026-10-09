#!/usr/bin/env node
// Read-only manual-maintenance gate. Never runs Docker or changes live services.
import { constants, openSync, closeSync, fstatSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stdoutCommand } from "./store-compose.mjs";

const script = fileURLToPath(import.meta.url);
const logging = { Type: "json-file", Config: { compress: "true", "max-file": "3", "max-size": "5m" } };
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const same = (left, right) => JSON.stringify(ordered(left)) === JSON.stringify(ordered(right));
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])]));
  return value;
}
function invalid() { throw new Error("Invalid protected runtime snapshot or options"); }

function inventory(items) {
  if (!Array.isArray(items) || !items.length || items.length > 32) invalid();
  const result = new Map();
  for (const item of items) {
    if (!object(item) || typeof item.Name !== "string" || !/^\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(item.Name) ||
        result.has(item.Name) || !/^[a-f0-9]{64}$/.test(item.Id ?? "") || !/^sha256:[a-f0-9]{64}$/.test(item.Image ?? "") ||
        !object(item.Config) || !object(item.HostConfig) || !object(item.Config.Labels) ||
        !Array.isArray(item.Mounts) || !object(item.NetworkSettings?.Networks) ||
        !item.Config.Labels["com.docker.compose.project"] || !item.Config.Labels["com.docker.compose.service"] ||
        item.State?.Running !== true || item.State.Restarting !== false || item.State.OOMKilled !== false ||
        !Number.isSafeInteger(item.State.Pid) || item.State.Pid <= 0 ||
        (item.State.Health && item.State.Health.Status !== "healthy")) invalid();
    const destinations = new Set();
    for (const mount of item.Mounts) {
      if (!object(mount) || typeof mount.Destination !== "string" || destinations.has(mount.Destination) ||
          typeof mount.RW !== "boolean") invalid();
      destinations.add(mount.Destination);
    }
    result.set(item.Name, item);
  }
  return result;
}

function redisBinding(before, after, target) {
  if (!target || before.Config.Labels["com.docker.compose.project"] !== "jev-mvp" ||
      before.Config.Labels["com.docker.compose.service"] !== "new-api-redis" || before.Mounts.length !== 1 || after.Mounts.length !== 1) return null;
  const mount = before.Mounts[0], next = after.Mounts[0];
  if (mount.Type !== "volume" || !/^[a-f0-9]{64}$/.test(mount.Name ?? "") || mount.Destination !== "/data" ||
      mount.RW !== true || !["", "rw"].includes(mount.Mode) || !["", "rw"].includes(next.Mode) ||
      !same({ ...mount, Mode: "rw" }, { ...next, Mode: "rw" })) return null;
  const binding = `${mount.Name}:/data:rw`;
  const allowed = value => value === null || (Array.isArray(value) && (value.length === 0 || same(value, [binding])));
  // Directional: introducing/retaining this explicit binding is safe; removing
  // it can make the next recreation allocate a different anonymous volume.
  return allowed(before.HostConfig.Binds) && same(after.HostConfig.Binds, [binding]) ? binding : null;
}

function invariant(item, { target, stdout, redis }) {
  const config = structuredClone(item.Config);
  // The target may pin a tag to the same image ID; the pair is checked below.
  if (target) delete config.Image;
  if (target && config.Hostname === item.Id.slice(0, 12)) config.Hostname = "<automatic-container-hostname>";
  if (target) {
    // Ignore generated receipt labels only; project, service, custom and unknown
    // Compose labels remain strict, including source-file and working-dir labels.
    for (const key of ["com.docker.compose.config-hash", "com.docker.compose.image"]) delete config.Labels[key];
  }
  if (config.Env) {
    if (!Array.isArray(config.Env) || config.Env.some(value => typeof value !== "string")) invalid();
    const names = new Set();
    for (const entry of config.Env) {
      const separator = entry.indexOf("=");
      const name = entry.slice(0, separator);
      if (separator < 1 || names.has(name)) invalid();
      names.add(name);
    }
    config.Env.sort();
  }
  if (stdout) config.Cmd = stdoutCommand(config.Cmd);
  const host = structuredClone(item.HostConfig);
  if (target) delete host.LogConfig;
  // ONLY absent DNS lists are equivalent. Actual overrides stay byte-strict.
  for (const key of ["Dns", "DnsOptions", "DnsSearch"]) {
    if (host[key] === null || (Array.isArray(host[key]) && host[key].length === 0)) host[key] = [];
  }
  const mounts = structuredClone(item.Mounts).sort((a, b) => a.Destination.localeCompare(b.Destination));
  if (redis) { host.Binds = []; mounts[0].Mode = "rw"; }
  const bindings = mounts.map(mount => `${mount.Name}:${mount.Destination}:${mount.RW ? "rw" : "ro"}`).sort();
  if (mounts.every(mount => mount.Type === "volume") && Array.isArray(host.Binds) && same([...host.Binds].sort(), bindings)) host.Binds.sort();
  const networks = structuredClone(item.NetworkSettings.Networks);
  for (const network of Object.values(networks)) {
    if (!object(network)) invalid();
    for (const key of ["Aliases", "DNSNames"]) {
      if (network[key] == null) continue;
      if (!Array.isArray(network[key]) || network[key].some(value => typeof value !== "string")) invalid();
      network[key] = [...new Set(network[key].filter(value => !target || (value !== item.Id && value !== item.Id.slice(0, 12))))].sort();
    }
    if (target) for (const key of ["EndpointID", "IPAddress", "GlobalIPv6Address", "MacAddress"]) delete network[key];
  }
  // Retain everything outside the named sections too: effective Path/Args,
  // AppArmor, labels, future engine fields and non-endpoint network settings.
  const extra = structuredClone(item);
  for (const key of ["Image", "Config", "HostConfig", "Mounts"]) delete extra[key];
  delete extra.NetworkSettings.Networks;
  // Healthcheck execution transcripts and size counters change during ordinary
  // operation; health status and every unclassified field remain strict.
  for (const key of ["ExecIDs", "SizeRw", "SizeRootFs"]) delete extra[key];
  if (extra.State.Health) delete extra.State.Health.Log;
  if (stdout && Array.isArray(extra.Args)) extra.Args = stdoutCommand(extra.Args);
  if (target) {
    for (const key of ["Id", "Created"]) delete extra[key];
    for (const key of ["Pid", "StartedAt", "FinishedAt"]) delete extra.State[key];
    for (const key of ["SandboxID", "SandboxKey", "EndpointID", "IPAddress", "GlobalIPv6Address", "MacAddress"]) delete extra.NetworkSettings[key];
    // Recreated writable-layer paths are engine metadata, not storage mounts.
    // Preserve driver name and all unknown graph-driver fields.
    if (object(extra.GraphDriver?.Data)) {
      for (const key of ["LowerDir", "UpperDir", "MergedDir", "WorkDir"]) delete extra.GraphDriver.Data[key];
    }
    for (const [key, suffix] of [["ResolvConfPath", "resolv.conf"], ["HostnamePath", "hostname"], ["HostsPath", "hosts"], ["LogPath", `${item.Id}-json.log`]]) {
      const value = extra[key];
      if (typeof value !== "string") continue;
      const ending = `/containers/${item.Id}/${suffix}`;
      if (value.endsWith(ending)) extra[key] = `${value.slice(0, -ending.length)}/containers/<automatic-id>/${key}`;
    }
  }
  return { image: item.Image, config, host, mounts, networks, extra };
}

export function compareRuntime(beforeItems, afterItems, { target = null, newapiStdout = false } = {}) {
  if ((target !== null && typeof target !== "string") || typeof newapiStdout !== "boolean" || (newapiStdout && !target)) invalid();
  const before = inventory(beforeItems), after = inventory(afterItems);
  if (target && !before.has(target)) invalid();
  const names = [...before.keys()].sort();
  if (!same(names, [...after.keys()].sort())) return { passed: false, containers: before.size, differences: [{ fields: ["inventory"] }] };
  const differences = [];
  for (const [index, name] of names.entries()) {
    const left = before.get(name), right = after.get(name), selected = target === name;
    if (newapiStdout && selected && (left.Config.Labels["com.docker.compose.project"] !== "jev-mvp" ||
        left.Config.Labels["com.docker.compose.service"] !== "new-api")) invalid();
    const redis = redisBinding(left, right, selected);
    const a = invariant(left, { target: selected, stdout: selected && newapiStdout, redis });
    const b = invariant(right, { target: selected, stdout: false, redis });
    const fields = Object.keys(a).filter(key => !same(a[key], b[key]));
    if (!selected && (left.Id !== right.Id || left.State.Pid !== right.State.Pid || left.RestartCount !== right.RestartCount)) fields.push("process");
    if (selected && !same(right.HostConfig.LogConfig, logging)) fields.push("logging");
    if (selected && right.Config.Image !== left.Config.Image && right.Config.Image !== left.Image) fields.push("image-reference");
    if (fields.length) differences.push({ index, fields });
  }
  // No env values, commands, paths, labels, container names or parser errors.
  return { passed: differences.length === 0, containers: before.size, differences };
}

function sameFile(left, right) {
  return ["dev", "ino", "uid", "gid", "mode", "nlink", "size", "mtimeMs", "ctimeMs"].every(key => left[key] === right[key]);
}
function protectedSnapshot(path) {
  if (!isAbsolute(path) || realpathSync(path) !== path || !constants.O_NOFOLLOW) invalid();
  const before = lstatSync(path);
  if (!before.isFile() || before.nlink !== 1 || (before.mode & 0o077) || before.uid !== process.getuid?.() || before.size > 16 * 1024 ** 2) invalid();
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!sameFile(before, fstatSync(fd))) invalid();
    const bytes = readFileSync(fd, "utf8");
    if (!sameFile(before, fstatSync(fd)) || !sameFile(before, lstatSync(path))) invalid();
    return JSON.parse(bytes);
  } finally { closeSync(fd); }
}

function main() {
  try {
    const [beforePath, afterPath, ...args] = process.argv.slice(2);
    if (!beforePath || !afterPath) invalid();
    let target = null, newapiStdout = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--target" && target === null && args[i + 1]) target = args[++i];
      else if (args[i] === "--newapi-stdout" && !newapiStdout) newapiStdout = true;
      else invalid();
    }
    const report = compareRuntime(protectedSnapshot(beforePath), protectedSnapshot(afterPath), { target, newapiStdout });
    console.log(JSON.stringify(report));
    if (!report.passed) process.exitCode = 2;
  } catch {
    console.error(JSON.stringify({ passed: false, error: "invalid-input-or-runtime", sensitiveValuesPrinted: false }));
    process.exitCode = 2;
  }
}
if (resolve(process.argv[1] ?? "") === script) main();
