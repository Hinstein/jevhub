# Production deployment and release cleanup

## Incident and required invariant

On 2026-10-03 the Store frontend could not start because its retained release
`fcbbd3a/node_modules` pointed to the deleted release `5ebd735/node_modules`.
The service had continued running after cleanup, so checking only systemd
`active` did not detect the missing files until the next server reboot.

Every retained release must own its runtime dependencies and build output.
Internal pnpm links are allowed; links into another release are forbidden.
Environment files may link to this project's `shared/` directory.

Do not use `ln -s ../old-release/node_modules node_modules` to save space.
Install dependencies into the new release from its frozen lockfile. Package
caches and pnpm hardlinks can save space without referring to an older release.

## Read-only release guard

The guard uses only built-in Node.js modules and never changes files. It scans
all nested symlinks, rejects broken and external dependency links, and checks
the Next.js startup entry, production build ID, server output, and static assets.
It never reads environment-file contents.

```bash
# Inspect the currently selected release.
node /usr/local/lib/jevhub-ops/release-guard.mjs check /home/ubuntu/jevhub

# Inspect a newly built release before switching current.
node /usr/local/lib/jevhub-ops/release-guard.mjs check /home/ubuntu/jevhub --release COMMIT_ID

# List old releases after confirming current is independent.
node /usr/local/lib/jevhub-ops/release-guard.mjs cleanup-plan /home/ubuntu/jevhub
```

The same read-only commands can inspect `/home/ubuntu/jev-store-new-api` and
`/home/ubuntu/jev-vip`. A failed check must stop deployment or cleanup. The plan
is a list of candidates, not an authorization or proof that no other process
uses them. Check process working directories, service configuration, and open
files before deleting an individually approved candidate.

## Deployment sequence

1. Resolve the user-approved remote branch to a pushed, immutable commit and
   record its full SHA. Package that commit, not an uncommitted working tree.
   Check available disk space before copying, installing, or building. If there
   is not enough space, stop and prepare an approved cleanup plan; do not remove
   the running or rollback release to make the new build fit.
2. Create a new release and install dependencies in it using `npm ci` or
   `pnpm install --frozen-lockfile`, according to that project's lockfile.
   Do not overwrite the currently running release.
3. Build the release and run its full quality checks (`npm run check` for
   JevHub). Do not bypass a failed gate.
4. Run `check --release COMMIT_ID`; stop if the exit code is nonzero. Confirm
   JevHub's systemd startup gate is still loaded before switching releases.
5. Atomically switch `current` and restart only the affected application.
6. Wait for the service to start, then check local and public HTTP responses
   and process stability.
   Keep the previous release until the new process has passed both checks.
7. If startup or HTTP validation fails, restore the previous `current` link and
   restart that application. Do not remove its rollback release.
8. After success, generate a fresh cleanup plan. The agreed policy for this
   server is to retain only the current release after verification.

Deployment and cleanup of the same project must be serialized. Re-run an audit
if the selected release or candidate set changes. Record the deployed commit,
previous release, guard result, restart result, and local/public HTTP checks in
the deployment handoff, without including environment values or user input.

The release guard validates files; it does not test API credentials, upstream
availability, or page rendering. HTTP validation is still required.

## Cleanup sequence

1. Run `cleanup-plan` immediately before cleanup and check each candidate for
   running-process or service references. Do not clean during a deployment.
2. Record the exact current release. Delete only approved direct children of
   `releases/`; preserve `shared/`, environment files, backups, and runtime data.
3. Run the guard again after cleanup. If it fails, restore dependencies before
   restarting the service.
4. Restart only the affected application and verify both local and public HTTP
   responses. A still-running process alone is not sufficient evidence.

Production HTTP checks must retain language cookies when following redirects:

```bash
curl --fail --silent --show-error --location --max-redirs 6 \
  --cookie-jar /dev/null --connect-timeout 5 --max-time 20 \
  --output /dev/null --write-out '%{http_code}\n' https://jevhub.xyz/

curl --fail --silent --show-error --location --max-redirs 6 \
  --cookie-jar /dev/null --connect-timeout 5 --max-time 20 \
  --output /dev/null --write-out '%{http_code}\n' https://jevhub.store/
```

Both final responses must be `200`. Also check `systemctl show SERVICE
-p MainPID -p ActiveState -p NRestarts` twice to confirm the process is stable.

## JevHub startup gate

Keep the guard outside `releases/`, so cleaning old releases cannot remove it.
The JevHub drop-in runs the guard before every systemd start, including reboot.

From the repository root on the production server:

```bash
sudo install -D -m 0755 scripts/release-guard.mjs /usr/local/lib/jevhub-ops/release-guard.mjs
node /usr/local/lib/jevhub-ops/release-guard.mjs check /home/ubuntu/jevhub
sudo install -D -m 0644 deploy/jevhub-release-guard.conf /etc/systemd/system/jevhub.service.d/10-release-guard.conf
sudo systemctl daemon-reload
```

Verify the loaded command with `systemctl show jevhub.service -p ExecStartPre`.
Run the guard as the service user (`ubuntu`) too, to catch permission problems.
Installing this drop-in does not restart the service. The other projects can
use the read-only guard without changing their systemd configuration.

## Keeping the policy in effect

`AGENTS.md` makes this sequence mandatory for future JevHub agent work.
`tests/release-guard.test.ts` runs through the existing `npm run check` quality
gate, including GitHub CI on pull requests and pushes to `main`. It covers the
cross-release dependency failure that caused the outage. Do not remove these
tests or disable the startup gate to get a deployment through.

When the guard itself changes, validate it against the current and incoming
releases as the service user before replacing the server's installed copy.
Keep the installed guard outside `releases/`; application release cleanup must
not remove it. Never restart or reconfigure unrelated services as part of a
JevHub deployment.

These rules are not an automatic deployment, cleanup, or monitoring service.
They do not intercept arbitrary manual file deletion. Each operator must use
the checks and retain explicit approval for destructive actions.
