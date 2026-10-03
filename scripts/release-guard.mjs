#!/usr/bin/env node
import {
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  statSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

// Deliberately read-only: a failed audit must never delete or switch a release.
const usage =
  "Usage: node release-guard.mjs check <absolute-project-root> [--release <name>]\n" +
  "       node release-guard.mjs cleanup-plan <absolute-project-root>";

function inside(parent, child) {
  return child === parent || child.startsWith(parent + sep);
}

function requireRealDirectory(path) {
  if (!lstatSync(path).isDirectory()) {
    throw new Error(`Expected a real directory (not a symlink): ${path}`);
  }
}

function layout(projectPath, releaseName) {
  if (!isAbsolute(projectPath)) {
    throw new Error("Project root must be an absolute path.");
  }
  const projectRoot = realpathSync(projectPath);
  const releases = join(projectRoot, "releases");
  requireRealDirectory(releases);
  const currentLink = join(projectRoot, "current");
  if (!lstatSync(currentLink).isSymbolicLink()) {
    throw new Error(`Expected a current symlink: ${currentLink}`);
  }
  const current = realpathSync(currentLink);
  if (dirname(current) !== releases) {
    throw new Error("Current release must be a direct child of releases.");
  }
  requireRealDirectory(current);

  const release = releaseName ? join(releases, releaseName) : current;
  requireRealDirectory(release);
  return { projectRoot, releases, current, release };
}

function auditRelease({ projectRoot, release }) {
  const errors = [];
  const shared = join(projectRoot, "shared");

  function inspect(path) {
    const relativePath = relative(release, path);
    let entry;
    try {
      entry = lstatSync(path);
    } catch (error) {
      errors.push(`Cannot inspect ${relativePath}: ${error.code}`);
      return;
    }

    if (entry.isSymbolicLink()) {
      let target;
      let firstTarget;
      try {
        firstTarget = resolve(dirname(path), readlinkSync(path));
        target = realpathSync(path);
      } catch (error) {
        errors.push(`Broken symlink ${relativePath}: ${error.code}`);
        return;
      }

      // Environment files may use shared/, but cannot pass through an old
      // release on their way there. No file contents or credentials are read.
      const sharedEnv =
        /^\.env(?:\.[^/]+)?$/.test(relativePath) &&
        inside(shared, firstTarget) &&
        inside(shared, target) &&
        statSync(path).isFile();
      if (!sharedEnv && (!inside(release, firstTarget) || !inside(release, target))) {
        errors.push(`Dependency ${relativePath} points outside this release: ${firstTarget}`);
      }
      return;
    }

    if (entry.isDirectory()) {
      try {
        for (const child of readdirSync(path)) inspect(join(path, child));
      } catch (error) {
        errors.push(`Cannot inspect directory ${relativePath || "."}: ${error.code}`);
      }
    }
  }

  inspect(release);
  for (const [name, directory] of [
    ["node_modules", true],
    ["node_modules/next/dist/bin/next", false],
    [".next/BUILD_ID", false],
    [".next/server", true],
    [".next/static", true],
  ]) {
    try {
      const path = join(release, name);
      const entry = statSync(path);
      if (directory ? !entry.isDirectory() : !entry.isFile()) {
        errors.push(`Invalid runtime entry: ${name}`);
      }
      if (!inside(release, realpathSync(path))) {
        errors.push(`Runtime entry ${name} points outside this release.`);
      }
    } catch (error) {
      errors.push(`Missing runtime entry ${name}: ${error.code}`);
    }
  }
  try {
    if (!readFileSync(join(release, ".next/BUILD_ID"), "utf8").trim()) {
      errors.push("Empty production BUILD_ID.");
    }
  } catch {
    // The missing-file error is reported above.
  }
  return errors;
}

function main() {
  const [mode, projectPath, ...options] = process.argv.slice(2);
  if (mode === "--help") {
    console.log(usage);
    return;
  }
  if (!["check", "cleanup-plan"].includes(mode) || !projectPath) {
    throw new Error(usage);
  }
  let releaseName;
  if (options.length) {
    if (mode !== "check" || options.length !== 2 || options[0] !== "--release") {
      throw new Error(usage);
    }
    releaseName = options[1];
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(releaseName)) {
      throw new Error("Invalid release name.");
    }
  }

  const project = layout(projectPath, releaseName);
  const errors = auditRelease(project);
  if (errors.length) {
    for (const error of errors) console.error(`FAIL ${error}`);
    process.exitCode = 1;
    return;
  }

  const candidates = [];
  if (mode === "cleanup-plan") {
    for (const entry of readdirSync(project.releases).sort()) {
      const path = join(project.releases, entry);
      requireRealDirectory(path);
      if (path !== project.current) candidates.push(path);
    }
  }
  // Refuse a result obtained while another deployment switched current.
  if (realpathSync(join(project.projectRoot, "current")) !== project.current) {
    throw new Error("Current changed during inspection; run the guard again.");
  }
  console.log(`PASS release=${project.release}`);
  if (mode === "cleanup-plan") {
    console.log(`keep=${project.current}`);
    for (const path of candidates) console.log(`candidate=${path}`);
    console.log("Read-only plan. Check running processes before approving deletion.");
  }
}

try {
  main();
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}
