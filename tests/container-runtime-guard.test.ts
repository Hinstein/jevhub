import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const guardPath = resolve("scripts/container-runtime-guard.mjs");
const volume = "a".repeat(64);
const originalId = "1".repeat(64);
const replacementId = "2".repeat(64);
const sentinel = "synthetic-secret-not-for-output";

function container(service = "new-api") {
  return {
    Id: originalId, Name: `/jev-mvp-${service}-1`, Image: `sha256:${"3".repeat(64)}`,
    State: { Running: true, Restarting: false, Pid: 123, OOMKilled: false },
    Config: {
      Image: "original-image-tag", Hostname: originalId.slice(0, 12),
      Labels: { "com.docker.compose.project": "jev-mvp", "com.docker.compose.service": service,
        "com.docker.compose.config-hash": "old-hash", custom: "preserve-me" },
      Env: [`PASSWORD=${sentinel}`, "MODE=production"], Cmd: ["run", "--port", "3000", "--log-dir", "/app/logs"],
      Entrypoint: ["entry"], User: "1000", WorkingDir: "/app", Healthcheck: { Test: ["CMD", "health"] },
    },
    HostConfig: {
      Dns: null, DnsOptions: null, DnsSearch: null, Binds: [] as string[],
      LogConfig: { Type: "json-file", Config: {} as Record<string, string> },
      Memory: 64 * 1024 ** 2, ReadonlyRootfs: true, CapDrop: ["ALL"], SecurityOpt: ["no-new-privileges"],
      PortBindings: { "3000/tcp": [{ HostIp: "127.0.0.1", HostPort: "3001" }] },
      RestartPolicy: { Name: "unless-stopped", MaximumRetryCount: 0 },
    } as Record<string, unknown>,
    Mounts: [{ Type: "volume", Name: volume, Source: `/var/lib/docker/volumes/${volume}/_data`,
      Destination: "/data", Driver: "local", Mode: "", RW: true, Propagation: "" }],
    NetworkSettings: { Networks: { "jev-mvp_jev-backend": {
      NetworkID: "same-network", EndpointID: "old-endpoint", IPAddress: "172.20.0.2",
      Aliases: ["new-api", originalId.slice(0, 12)], IPAMConfig: null, DriverOpts: null,
    } } },
  };
}

type Container = ReturnType<typeof container>;
const boundedLogging = { Type: "json-file", Config: { compress: "true", "max-file": "3", "max-size": "5m" } };

describe("read-only container runtime equivalence gate", () => {
  let fixture: string;
  let beforePath: string;
  let afterPath: string;
  beforeEach(() => {
    fixture = realpathSync(mkdtempSync(join(tmpdir(), "jevhub-container-guard-")));
    beforePath = join(fixture, "before.json");
    afterPath = join(fixture, "after.json");
  });
  afterEach(() => rmSync(fixture, { recursive: true, force: true }));

  function check(before: Container[], after: Container[], options: string[] = []) {
    writeFileSync(beforePath, JSON.stringify(before), { mode: 0o600 });
    writeFileSync(afterPath, JSON.stringify(after), { mode: 0o600 });
    const beforeBytes = readFileSync(beforePath);
    const afterBytes = readFileSync(afterPath);
    const result = spawnSync(process.execPath, [guardPath, beforePath, afterPath, ...options], { encoding: "utf8" });
    expect(readFileSync(beforePath)).toEqual(beforeBytes);
    expect(readFileSync(afterPath)).toEqual(afterBytes);
    expect(result.stdout + result.stderr).not.toContain(sentinel);
    return result;
  }

  it("accepts an unchanged complete runtime without writing snapshots", () => {
    const before = [container()];
    const result = check(before, structuredClone(before));
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ passed: true, containers: 1, differences: [] });
  });

  it.each(["Dns", "DnsOptions", "DnsSearch"])("allows only the absent null/empty representation for %s", (field) => {
    const before = [container()];
    const after = structuredClone(before);
    after[0].HostConfig[field] = [];
    expect(check(before, after).status).toBe(0);
    after[0].HostConfig[field] = ["real-override"];
    expect(check(before, after).status).toBe(2);
  });

  it.each(["Dns", "DnsOptions", "DnsSearch"])("does not discard a real override in %s", (field) => {
    const before = [container()];
    before[0].HostConfig[field] = ["original-override"];
    const after = structuredClone(before);
    after[0].HostConfig[field] = [];
    expect(check(before, after).status).toBe(2);
  });

  it("keeps actual environment values strict while allowing entry order changes", () => {
    const before = [container()];
    const after = structuredClone(before);
    after[0].Config.Env.reverse();
    expect(check(before, after).status).toBe(0);
    after[0].Config.Env[0] = "MODE=changed";
    expect(check(before, after).status).toBe(2);
  });

  it("deduplicates aliases but rejects real network identity or alias changes", () => {
    const before = [container()];
    const after = structuredClone(before);
    const network = after[0].NetworkSettings.Networks["jev-mvp_jev-backend"];
    network.Aliases.push("new-api");
    expect(check(before, after).status).toBe(0);
    network.Aliases.push("different-backend");
    expect(check(before, after).status).toBe(2);
    network.Aliases.pop();
    network.NetworkID = "different-network";
    expect(check(before, after).status).toBe(2);
  });

  it("permits only the selected container to be recreated with exact bounded logs", () => {
    const before = [container(), container("jev-adapter")];
    before[1].Id = "4".repeat(64);
    before[1].State.Pid = 456;
    const after = structuredClone(before);
    after[0].Id = replacementId;
    after[0].State.Pid = 789;
    after[0].Config.Hostname = replacementId.slice(0, 12);
    after[0].Config.Image = after[0].Image;
    after[0].Config.Labels["com.docker.compose.config-hash"] = "new-hash";
    after[0].HostConfig.LogConfig = boundedLogging;
    const network = after[0].NetworkSettings.Networks["jev-mvp_jev-backend"];
    network.Aliases = ["new-api", replacementId.slice(0, 12)];
    network.IPAddress = "172.20.0.3";
    network.EndpointID = "new-endpoint";
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(0);
    after[1].State.Pid += 1;
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
  });

  it("requires the explicitly selected target's 5 MiB x 3 compressed logging settings", () => {
    const before = [container()];
    const after = structuredClone(before);
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
    after[0].HostConfig.LogConfig = boundedLogging;
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(0);
    after[0].HostConfig.LogConfig = { Type: "none", Config: {} };
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
    expect(check(before, after).status).toBe(2);
  });

  it("allows only NewAPI's empty log-dir and preserves unrelated command arguments", () => {
    const before = [container()];
    const after = structuredClone(before);
    after[0].Config.Cmd = ["run", "--port", "3000", "--log-dir", ""];
    after[0].HostConfig.LogConfig = boundedLogging;
    const options = ["--target", before[0].Name, "--newapi-stdout"];
    expect(check(before, after, options).status).toBe(0);
    after[0].Config.Cmd[2] = "8080";
    expect(check(before, after, options).status).toBe(2);
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
  });

  it("refuses the stdout exception for any other service or project", () => {
    for (const before of [[container("jev-adapter")], [container()]]) {
      if (before[0].Config.Labels["com.docker.compose.service"] === "new-api") {
        before[0].Config.Labels["com.docker.compose.project"] = "foreign";
      }
      const after = structuredClone(before);
      after[0].HostConfig.LogConfig = boundedLogging;
      expect(check(before, after, ["--target", before[0].Name, "--newapi-stdout"]).status).toBe(2);
    }
  });

  it("allows explicit binding of only the original anonymous Redis volume", () => {
    const before = [container("new-api-redis")];
    const after = structuredClone(before);
    after[0].HostConfig.Binds = [`${volume}:/data:rw`];
    after[0].Mounts[0].Mode = "rw";
    after[0].HostConfig.LogConfig = boundedLogging;
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(0);
    after[0].HostConfig.Binds = ["different-volume:/data:rw"];
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
  });

  it.each(["Name", "Source", "Destination", "Driver", "Propagation", "Mode"])("rejects changes to Redis volume %s", (field) => {
    const before = [container("new-api-redis")];
    const after = structuredClone(before);
    Object.assign(after[0].Mounts[0], { [field]: "different-value" });
    after[0].HostConfig.LogConfig = boundedLogging;
    expect(check(before, after, ["--target", before[0].Name]).status).toBe(2);
  });

  it("rejects read-only Redis, host binds and anonymous binding exceptions for non-Redis services", () => {
    const before = [container("new-api-redis")];
    const after = structuredClone(before);
    after[0].Mounts[0].RW = false;
    expect(check(before, after).status).toBe(2);
    after[0].Mounts[0].RW = true;
    after[0].Mounts[0].Type = "bind";
    expect(check(before, after).status).toBe(2);
    const otherBefore = [container("jev-adapter")];
    const otherAfter = structuredClone(otherBefore);
    otherAfter[0].HostConfig.Binds = [`${volume}:/data:rw`];
    expect(check(otherBefore, otherAfter).status).toBe(2);
  });

  it("allows mount and exact named-volume bind order changes, not binding option changes", () => {
    const before = [container()];
    before[0].Mounts.push({ ...before[0].Mounts[0], Name: "second-volume", Source: "/volume-two", Destination: "/cache", Mode: "rw" });
    before[0].Mounts[0].Mode = "rw";
    before[0].HostConfig.Binds = [`${volume}:/data:rw`, "second-volume:/cache:rw"];
    const after = structuredClone(before);
    after[0].Mounts.reverse();
    (after[0].HostConfig.Binds as string[]).reverse();
    expect(check(before, after).status).toBe(0);
    after[0].HostConfig.Binds = [`${volume}:/data:rw,z`, "second-volume:/cache:rw"];
    expect(check(before, after).status).toBe(2);
  });

  it.each(["Image", "Memory", "ReadonlyRootfs", "CapDrop", "SecurityOpt", "PortBindings", "RestartPolicy"])("rejects real %s changes", (field) => {
    const before = [container()];
    const after = structuredClone(before);
    if (field === "Image") after[0].Image = `sha256:${"5".repeat(64)}`;
    else after[0].HostConfig[field] = "changed";
    expect(check(before, after).status).toBe(2);
  });

  it("rejects changed custom labels, Compose project/service and unknown host restrictions", () => {
    const before = [container()];
    for (const key of ["custom", "com.docker.compose.project", "com.docker.compose.service"]) {
      const after = structuredClone(before);
      Object.assign(after[0].Config.Labels, { [key]: "changed" });
      expect(check(before, after).status).toBe(2);
    }
    const after = structuredClone(before);
    after[0].HostConfig.FutureRestriction = "changed";
    expect(check(before, after).status).toBe(2);
  });

  it("rejects stopped or OOM containers, duplicates, removals and unknown targets", () => {
    const before = [container()];
    const stopped = structuredClone(before); stopped[0].State.Running = false;
    const oom = structuredClone(before); oom[0].State.OOMKilled = true;
    for (const after of [stopped, oom, [], [...before, before[0]]]) {
      expect(check(before, after).status).toBe(2);
    }
    expect(check(before, before, ["--target", "/missing"]).status).toBe(2);
    expect(check(before, before, ["--apply"]).status).toBe(2);
  });

  it("refuses public-readable or symlink snapshots and emits no raw parser error", () => {
    check([container()], [container()]);
    chmodSync(beforePath, 0o644);
    let result = spawnSync(process.execPath, [guardPath, beforePath, afterPath], { encoding: "utf8" });
    expect(result.status).toBe(2);
    const link = join(fixture, "linked.json"); symlinkSync(afterPath, link);
    result = spawnSync(process.execPath, [guardPath, link, afterPath], { encoding: "utf8" });
    expect(result.status).toBe(2);
    writeFileSync(afterPath, `{invalid-json-${sentinel}`, { mode: 0o600 });
    result = spawnSync(process.execPath, [guardPath, afterPath, afterPath], { encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stdout + result.stderr).not.toContain(sentinel);
  });
});
