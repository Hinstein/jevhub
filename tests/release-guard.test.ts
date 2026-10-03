import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const script = resolve("scripts/release-guard.mjs");
let fixture: string;
let project: string;

function release(name: string) {
  const root = join(project, "releases", name);
  mkdirSync(join(root, "node_modules/next/dist/bin"), { recursive: true });
  mkdirSync(join(root, ".next/server"), { recursive: true });
  mkdirSync(join(root, ".next/static"), { recursive: true });
  writeFileSync(join(root, "node_modules/next/dist/bin/next"), "// fixture\n");
  writeFileSync(join(root, ".next/BUILD_ID"), "fixture-build\n");
  return root;
}

function run(...args: string[]) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

beforeEach(() => {
  fixture = realpathSync(mkdtempSync(join(tmpdir(), "jevhub-release-guard-")));
  project = join(fixture, "app");
  mkdirSync(join(project, "releases"), { recursive: true });
  release("current-version");
  symlinkSync("releases/current-version", join(project, "current"));
});

afterEach(() => {
  rmSync(fixture, { recursive: true, force: true });
});

describe("production release guard", () => {
  it("accepts a self-contained production release", () => {
    const result = run("check", project);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("PASS");
  });

  it("rejects the cross-release node_modules link that caused the outage", () => {
    const old = release("old-version");
    const modules = join(project, "releases/current-version/node_modules");
    rmSync(modules, { recursive: true });
    symlinkSync(join(old, "node_modules"), modules);

    const result = run("cleanup-plan", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("outside this release");
    expect(existsSync(old)).toBe(true);
    expect(existsSync(modules)).toBe(true);
  });

  it("rejects an already broken dependency link", () => {
    const modules = join(project, "releases/current-version/node_modules");
    rmSync(modules, { recursive: true });
    symlinkSync("../../deleted-version/node_modules", modules);

    const result = run("check", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Broken symlink");
  });

  it("finds dependencies hidden in nested build output", () => {
    const old = release("old-version");
    symlinkSync(
      join(old, "node_modules/next"),
      join(project, "releases/current-version/.next/server/vendor"),
    );

    const result = run("check", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(".next/server/vendor");
  });

  it("rejects a symlink chain that goes through shared and ends in an old release", () => {
    const old = release("old-version");
    mkdirSync(join(project, "shared"));
    symlinkSync(join(old, "node_modules/next"), join(project, "shared/vendor"));
    symlinkSync(
      join(project, "shared/vendor"),
      join(project, "releases/current-version/node_modules/vendor"),
    );

    const result = run("check", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("outside this release");
  });

  it("accepts pnpm symlinks contained in the same release", () => {
    const modules = join(project, "releases/current-version/node_modules");
    mkdirSync(join(modules, ".pnpm/sample"), { recursive: true });
    symlinkSync(".pnpm/sample", join(modules, "sample"));

    expect(run("check", project).status).toBe(0);
  });

  it("allows shared environment files without reading or printing their contents", () => {
    mkdirSync(join(project, "shared"));
    const env = join(project, "shared/.env.production");
    writeFileSync(env, "API_KEY=fixture-private-value\n");
    symlinkSync(env, join(project, "releases/current-version/.env.production"));

    const result = run("check", project);
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toContain("fixture-private-value");
    expect(readFileSync(env, "utf8")).toContain("fixture-private-value");
  });

  it("does not allow an environment file to reference an old release", () => {
    const old = release("old-version");
    writeFileSync(join(old, ".env.production"), "API_KEY=fixture\n");
    symlinkSync(
      join(old, ".env.production"),
      join(project, "releases/current-version/.env.production"),
    );

    const result = run("check", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("outside this release");
  });

  it("prints a read-only cleanup plan and never includes the current release", () => {
    const old = release("old-version");
    const result = run("cleanup-plan", project);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`candidate=${old}`);
    expect(result.stdout).not.toContain(`candidate=${join(project, "releases/current-version")}`);
    expect(existsSync(old)).toBe(true);
    expect(existsSync(join(project, "current"))).toBe(true);
  });

  it("checks a new release before it becomes current", () => {
    const incoming = release("incoming-version");
    rmSync(join(incoming, ".next/BUILD_ID"));

    const result = run("check", project, "--release", "incoming-version");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("BUILD_ID");
  });

  it("rejects traversal in a release name", () => {
    const result = run("check", project, "--release", "../outside");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Invalid release name");
  });

  it("rejects current pointing outside the project's releases directory", () => {
    rmSync(join(project, "current"));
    symlinkSync(fixture, join(project, "current"));

    const result = run("cleanup-plan", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("direct child");
  });

  it("rejects a cleanup candidate that is itself a directory symlink", () => {
    symlinkSync(fixture, join(project, "releases/external-release"));

    const result = run("cleanup-plan", project);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("real directory");
  });
});
