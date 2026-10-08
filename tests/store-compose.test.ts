import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function snapshot(items: unknown[]) {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e",
    `import { buildCompose } from ${JSON.stringify(resolve("scripts/store-compose.mjs"))}; try {console.log(JSON.stringify(buildCompose(JSON.parse(process.argv[1]))));} catch {process.exit(2);}`,
    JSON.stringify(items)], { encoding: "utf8" });
  return result;
}
function containers() {
  return ["new-api", "jev-adapter", "new-api-postgres", "new-api-redis"].map((service, index) => ({
    Name: `/jev-mvp-${service}-1`, Image: `sha256:${String(index).repeat(64)}`,
    Config: { Labels: { "com.docker.compose.project": "jev-mvp", "com.docker.compose.service": service }, Env: ["PASSWORD=fixture-secret"], Cmd: ["run", "--password", "fixture-secret"], Entrypoint: ["entry"], WorkingDir: "/app", User: "", Healthcheck: { Test: ["CMD", "health"], Interval: 10e9, Timeout: 3e9, Retries: 5 } },
    HostConfig: { RestartPolicy: { Name: "unless-stopped" }, PortBindings: index === 0 ? { "3000/tcp": [{ HostIp: "127.0.0.1", HostPort: "3001" }] } : {} },
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
});
