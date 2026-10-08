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

## Approved automatic operations (2026-10-08)

The owner approved bounded automatic handling of recurring production issues.
`deploy/server-ops-policy.json` is an explicit allowlist, not permission to
change arbitrary programs. The root-owned `jevhub-ops.timer` runs the checked-in
`scripts/server-ops.mjs` every five minutes independently of the desktop app.
The timer does **not** deploy a new application commit or bypass quality gates.

Automatic mutations are limited to:

- Recover an enabled, stopped/failed Web unit for JevHub, InboxRevamp, Store
  frontend, or Jev VIP. The release guard must pass and at least 1 GiB of disk
  must remain. The operations worker has a 30-minute cooldown and at most two
  recovery attempts per application per rolling 24 hours, including failures.
  Running services with HTTP-only failures are reported, not restarted blindly.
  VIP currently has no configured public HTTP route, so its mutation flags are
  disabled. Missing public verification must never be treated as success.
- Remove unused code releases for those same four project roots after the
  approved current-only retention policy passes all checks. Cleanup needs two
  observations of the same release/PID/restart count, at least two minutes of
  process uptime, local/public HTTP success, a fresh `cleanup-plan`, and a fresh
  check for process cwd/argv/mapped files/open files, systemd configuration and
  loaded units, Docker references, and cross-release symlinks before **each**
  deletion. Releases younger than one hour or with an unfinished `RELEASE.json`
  are skipped. Cleanup normally runs at most once per six hours, or sooner when
  disk use is at least 85%. Re-run the guard, restart only the cleaned Web
  application, and verify local/public HTTP and stable PID/restart count.
  Each batch removes at most two releases and stops admitting deletions after
  two minutes. Log intent before removal. A partial deletion or journal failure
  must still enter the post-cleanup guard/HTTP/stability finalization; a failed
  guard forbids restart. Nested secrets/database markers and parent Docker
  mounts are protected too, including files within generated dependencies.
- Restore exactly two legacy Store Compose pointers, but only when the
  root-only persistent Compose snapshot still matches the live four containers.
  This operation never runs `docker compose up/down`, restarts a database, or
  changes an image, credential, network or volume.
  Store must be explicitly present in policy and its project lock must be held.
  Re-inspect live containers and filesystem entries before pointer writes;
  exclusively create the marker without following symlinks. Resource/security
  restrictions must be preserved or rejected, never silently discarded.

The remaining units, containers and public websites are read-only checks.
Successful idle oneshots are normal; `bot.jevhub.store` is expected to return
401. Historic cumulative restart counts are not treated as current failures.
Existing Gmail cron results and aggregate **read-only** connection/job counts
distinguish expired/revoked authorization from other connection failures.
The metrics HTTP endpoint also runs application retention cleanup, so the
monitor must not call it. It uses an enforced `BEGIN READ ONLY` SQL transaction.
The timer cannot
reauthorize Google, fake a connection status, send mail, or reset health data.

Protected data: `shared/`, real environment files, databases, backups, uploads,
logs/runtime-data directories, Arc observer observations, OrdoFi run history,
Docker volumes/images, and all other projects. Code cleanup is irreversible;
the action log records every removed release. It is not a general disk vacuum.

### Deployment/maintenance coordination

All deployment and cleanup operators must hold the **same** project lock:

```bash
sudo flock -n /run/lock/jevhub-release.lock COMMAND
sudo flock -n /run/lock/jev-email-release.lock COMMAND
sudo flock -n /run/lock/jev-store-new-api-release.lock COMMAND
sudo flock -n /run/lock/jev-vip-release.lock COMMAND
```

Hold the lock for the complete install/check/switch/HTTP-validation transaction.
The timer skips a busy project. Locks do not intercept an arbitrary manual
`rm`; bypassing the deployment runbook remains unsafe.

Before intentional stops or broader maintenance, pause automatic mutations:

```bash
sudo touch /etc/jevhub-ops/maintenance
# Perform the approved maintenance, then validate the affected services.
sudo unlink /etc/jevhub-ops/maintenance
```

Read-only health reporting continues during maintenance. Do not disable startup
guards or set a cleanup/recovery flag on a new project without owner approval.

### Installed paths and verification

Operations code is installed from a **pushed fixed commit**, outside app releases:

```text
/usr/local/lib/jevhub-ops/{release-guard,server-ops,server-ops-policy,store-compose}.mjs
/etc/jevhub-ops/policy.json
/etc/jevhub-ops/jev-mvp/compose.json         # root:root 600; contains credentials
/var/lib/jevhub-ops/latest.json             # safe current health report
/var/lib/jevhub-ops/{jevhub,inboxrevamp,store,vip}.json
/var/lib/jevhub-ops/incidents.jsonl          # meaningful changes, deduplicated
/var/lib/jevhub-ops/actions.jsonl            # per-release cleanup audit
```

Incident/action logs rotate at 5 MiB, retaining one prior log. No environment
values, mailbox content, refresh tokens, user input or raw Docker inspection
output are written to these reports. Review safe status with:

```bash
sudo systemctl list-timers jevhub-ops.timer
sudo systemctl show jevhub-ops.service -p Result -p ExecMainStatus
sudo /usr/local/bin/node /usr/local/lib/jevhub-ops/server-ops.mjs audit
sudo journalctl -u jevhub-ops.service -n 10 --no-pager
```

`audit` is read-only; `run` is the approved bounded worker. A Codex thread
heartbeat follows the safe report for meaningful changes requiring notification;
the server timer keeps running even if the desktop app is closed. Unchanged
pending OAuth authorization must not generate repetitive reminders.

### InboxRevamp release layout

Use `/home/ubuntu/jev-email/current`, one canonical `inboxrevamp.service`, and a
startup guard; do not append ever-longer `zzzz-release-*.conf` overrides. Archive
retired service configuration outside `/etc/systemd/system`, preserving a
recoverable copy, before cleaning the referenced unused code releases.
The root-only shared environment file remains `600`; systemd reads it. A build
runner may read it as root and pass needed values **in memory** to the Ubuntu
build user, never as command-line arguments or printed shell exports.

On this 3.7 GiB server, an unconstrained TypeScript check hit Node's default
heap ceiling. Use a resource-limited build scope and verify host memory/swap
headroom before increasing a heap limit. Do not skip a typecheck or remove the
running release to make a build fit. A failed build leaves production unchanged.

### Store persistent backend configuration

`scripts/store-compose.mjs install` captures the live, fixed four-container
configuration to the root-only persistent file and validates it with Compose.
It pins existing image IDs (`pull_policy: never`) and uses the exact external
network and data volumes, **including the existing anonymous Redis volume**.
Credentials are stored only in this protected server configuration, never Git.
Legacy labels for releases `4e286dd` and `26857b6` resolve through tiny protected
compatibility pointers; these are configuration directories, not deployable
Next.js releases and must not be cleaned.

Inspect without mutating containers:

```bash
sudo /usr/local/bin/node /usr/local/lib/jevhub-ops/store-compose.mjs audit
sudo docker compose -p jev-mvp -f /etc/jevhub-ops/jev-mvp/compose.json config --quiet
```

Do not print `config` without `--quiet`, because the configuration contains
credentials. Do not use `down -v`, remove the active images, change image tags,
or run a backend upgrade as part of frontend release cleanup. A later approved
backend upgrade must explicitly preserve volumes and update this snapshot.

See [incident registry](PRODUCTION_INCIDENTS.md) for reproduced failures,
root causes, verification and the boundary of each automatic remedy.
