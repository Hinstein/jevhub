#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, lstatSync, readlinkSync, symlinkSync, renameSync, unlinkSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const destination = "/etc/jevhub-ops/jev-mvp/compose.json";
const legacy = ["4e286dd", "26857b6"].map((id) => `/home/ubuntu/jev-store-new-api/releases/${id}/docker-compose.backend.yml`);
const expected = ["new-api", "jev-adapter", "new-api-postgres", "new-api-redis"];
const script = fileURLToPath(import.meta.url);

export function buildCompose(items) {
  if (items.length !== expected.length) throw new Error("Exactly four Store containers required");
  const services = {}, volumes = {};
  for (const item of items) {
    const service = item.Config.Labels["com.docker.compose.service"];
    if (item.Config.Labels["com.docker.compose.project"] !== "jev-mvp" || !expected.includes(service) || services[service]) throw new Error("Foreign or duplicate service");
    if (!/^sha256:[a-f0-9]{64}$/.test(item.Image)) throw new Error("Unpinned runtime image");
    if (Object.keys(item.NetworkSettings.Networks).join(",") !== "jev-mvp_jev-backend") throw new Error("Unexpected network");
    const environment = {};
    for (const entry of item.Config.Env ?? []) {
      const index = entry.indexOf("=");
      if (index < 1) throw new Error("Invalid environment entry");
      // Compose interprets dollar signs, even in JSON. Escape interpolation.
      environment[entry.slice(0, index)] = entry.slice(index + 1).replaceAll("$", "$$");
    }
    const escaped = (value) => typeof value === "string" ? value.replaceAll("$", "$$") : Array.isArray(value) ? value.map(escaped) : value;
    const data = {
      image: item.Image, pull_policy: "never", container_name: item.Name.replace(/^\//, ""),
      restart: item.HostConfig.RestartPolicy.Name, environment,
      command: escaped(item.Config.Cmd), entrypoint: escaped(item.Config.Entrypoint),
      networks: { backend: { aliases: item.NetworkSettings.Networks["jev-mvp_jev-backend"].Aliases ?? [service] } },
    };
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

function inspect() {
  const list = spawnSync("docker", ["ps", "-aq", "--filter", "label=com.docker.compose.project=jev-mvp"], { encoding: "utf8", timeout: 10000 });
  if (list.status !== 0) throw new Error("Docker list failed");
  const ids = list.stdout.trim().split("\n").filter(Boolean);
  if (ids.length !== 4) throw new Error("Store container count changed");
  const result = spawnSync("docker", ["inspect", ...ids], { encoding: "utf8", timeout: 10000, maxBuffer: 8e6 });
  if (result.status !== 0) throw new Error("Docker inspect failed");
  return JSON.parse(result.stdout).sort((a, b) => a.Name.localeCompare(b.Name));
}
function aliases() {
  const repaired = [];
  for (const path of legacy) {
    if (existsSync(path)) {
      if (!lstatSync(path).isSymbolicLink() || readlinkSync(path) !== destination) throw new Error("Legacy configuration unexpectedly changed");
      continue;
    }
    if (existsSync(dirname(path)) && !lstatSync(dirname(path)).isDirectory()) throw new Error("Legacy directory is not real");
    mkdirSync(dirname(path), { recursive: true, mode: 0o755 });
    writeFileSync(join(dirname(path), ".backend-configuration-alias"), "Protected Compose compatibility pointer; not an app release.\n", { mode: 0o644 });
    symlinkSync(destination, path);
    repaired.push(path);
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
  const repaired = mode === "audit" ? [] : aliases();
  console.log(JSON.stringify({ configured, repairedAliases: repaired, containersUntouched: true, imagesPinned: true, volumesPreserved: true }));
}

if (resolve(process.argv[1] ?? "") === script) {
  try { main(); }
  catch { console.error("FAIL Store Compose validation; live containers were not changed and credentials were not logged"); process.exitCode = 1; }
}
