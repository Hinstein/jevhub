# Production log retention — proposal, not installed

Server: `ubuntu@43.135.155.97`.
Observed: 2026-10-08, 17:23–17:30 Asia/Shanghai.
Status: historical initial shared-pool proposal. The owner has since requested
business-isolated retention instead; see [current tooling research and recommendation](PRODUCTION_LOG_SERVICES_RESEARCH.md).
The shared-pool design below is not the current implementation decision.
This historical shared-pool proposal was not applied. For the later approved,
installed business-isolated configuration and accepted native-logger exception, see
[local logging rollout](PRODUCTION_LOG_LOCAL_SETUP.md).

## Recommended decision

Use the existing journald, logrotate, and Docker log rotation. Do not add a
logging database, collection cluster, or a different cleanup script per service.
Capacity wins over age: these are maximum retention windows, not guarantees
that every log from that many days ago will still be available.

The systemd applications currently share the default journal namespace. Its
budget is **1 GiB total, not 1 GiB per service**. A per-service hard quota would
require separate journal namespaces or separate outputs; that is deliberately
not part of this initial lightweight proposal. Noisy services should first
reduce repetitive/debug output rather than receive a larger disk allowance.

## Per-service policy

| Service / log | Proposed retention | Proposed capacity | Rotation / handling |
| --- | --- | --- | --- |
| `jevhub.service` | At most 14 days | Shared journal pool, 1 GiB total | journald; no duplicate application log files |
| `inboxrevamp.service` | At most 14 days | Same shared pool | journald; never log email bodies, OAuth tokens, or mailbox identifiers |
| `jev-store-new-api.service` frontend | At most 14 days | Same shared pool | journald; backend containers are listed separately below |
| `jev-vip.service` | At most 14 days | Same shared pool | journald; log policy does not authorize deployment or recovery |
| `workflow-lens.service` | At most 14 days | Same shared pool | journald; no extra application file logs were found in its `logs/` path |
| `caddy.service` | At most 14 days | Same shared pool | Runtime/errors in journald; keep full access logging off as currently configured |
| `goofishcbot.service` | At most 14 days in journal; at most 7 days for existing diagnostic files | Shared journal; file directory target 50 MiB | Prefer one output; inspect the application's file writer before changing its rotation |
| `x-telegram-push.service` | At most 14 days in journal; at most 7 days for diagnostic file logs | Shared journal; file directory target 50 MiB | Only verified log files; the extensionless file in `logs/` is not automatically a cleanup target |
| `bepusdt.service` | At most 14 days in journal; at most 30 days for diagnostic files | Shared journal; file directory target 128 MiB | Confirm writer reopen/rotation support; payment records and ledgers are not diagnostic logs |
| `tat_agent.service`, Docker/containerd daemon, kernel, other system units | At most 14 days | Same shared pool | journald; proprietary agent file logs require their own verified inventory |
| Gmail process-jobs / watch-renewal / metrics / revamp-apply services | At most 14 days | Same shared pool | Existing stdout/stderr → journald; logs contain status/counts/latency only |
| Idea retention, Umami DB backup, Workflow Lens DB backup, ops oneshots | At most 14 days | Same shared pool | Keep result and error metadata; never delete their output backups or application data |
| Host `postgresql@16-main.service` diagnostic files | At most 7 days | File directory target 64 MiB | daily logrotate, compressed archives; avoid logging complete SQL parameters or every statement |
| `/var/log/pgbackrest` execution logs | At most 30 days | File directory target 64 MiB | daily logrotate; excludes `/var/lib/pgbackrest` backups and WAL |
| `syslog` / kernel text logs | At most 7 days | Combined file target 128 MiB | daily compressed rotation, checked hourly for size; keep security logging intact |
| SSH/authentication diagnostic logs | At most 30 days | File directory target 64 MiB | daily compressed rotation; not permission to erase security/accounting records indiscriminately |
| Ops incident/action JSONL | Capacity first; propose at most 30 days of closed archives | Preserve current approximately 20 MiB aggregate rotation budget | Existing 5 MiB rotation plus one previous file per stream; age cleanup is not installed yet |
| Arc Observer / Ordo historical run output | No new collection or retention authorization | None while producers remain stopped | This one-time authorized deletion is not approval to restart collectors or delete future data automatically |

File-directory values above are budget targets, not filesystem hard quotas.
Logrotate checks thresholds only when it runs, so a log can exceed its threshold
between checks. File count, size, and age settings must be chosen for the actual
number of streams and verified against each writer. Large single entries may
also exceed rolling thresholds. Do not promise a byte-exact ceiling.

## Container policy

Preserve `json-file` for the first rollout to avoid changing the existing
logging interface. Add explicit settings to each project's persistent Compose
definition, not merely the Docker daemon default.

| Container | Proposed rotation | Approximate uncompressed retained capacity |
| --- | --- | --- |
| `jev-mvp-new-api-1` | `max-size: 20m`, `max-file: 5`, `compress: true` | 100 MiB |
| `jev-mvp-jev-adapter-1` | `10m × 5`, compression | 50 MiB |
| `jev-mvp-new-api-postgres-1` | `10m × 5`, compression | 50 MiB |
| `jev-mvp-new-api-redis-1` | `10m × 3`, compression | 30 MiB |
| `umami-umami-1` | `10m × 5`, compression | 50 MiB |
| `umami-db-1` | `10m × 5`, compression | 50 MiB |
| `telegram-forwarder` | Keep current `10m × 3`, compression | 30 MiB; already configured |

Docker `json-file` supplies size/file-count rotation, **not day-based expiry**.
Therefore the container policy intentionally has no guaranteed day count or
14-day TTL. Its proposed aggregate capacity is about 360 MiB before compression
and occasional record-size overrun. A strict age TTL would need a different
logging path; defer that additional complexity unless required.

Changing defaults does not update existing containers. Per-container settings
take effect only after recreation. Stage these changes during approved normal
releases. **Do not restart Docker or recreate database/Redis/payment/message
containers merely to apply this proposal.** Those changes require separate
explicit authority and exact preservation of images, volumes, networks,
credentials, restart/resource/security settings, and persistent Compose receipts.
Never externally truncate, delete, or logrotate Docker-managed JSON log files.

## Automatic handling

1. Configure a root-owned journald drop-in after approval:

   ```ini
   [Journal]
   Storage=persistent
   Compress=yes
   SystemMaxUse=1G
   SystemKeepFree=2G
   SystemMaxFileSize=64M
   MaxFileSec=1day
   MaxRetentionSec=14day
   RuntimeMaxUse=64M
   ```

   journald rotates and removes old archived journal files itself. Active
   journal files are not deleted by vacuuming, so total usage may temporarily
   exceed the target. Any initial rotation/vacuum is a separate approved log
   deletion; it has **not** been executed in this task. Shared retention means
   filtering `journalctl -u UNIT` does not create an independent service quota.

2. For approved native file logs, use the existing logrotate state lock and
   service, with an hourly timer check, daily rotation, size thresholds, bounded
   archive counts, compression, and `maxage`. Do not create competing definitions
   for paths already handled by a package or application logger. `maxage` is
   evaluated when a file is rotated; stopped/unchanged logs need a separately
   reviewed closed-archive expiry rule if a strict age TTL is required.

3. Verify how each application reopens its log before changing file rotation.
   Prefer built-in rolling or a supported reopen signal. `copytruncate` can
   lose entries between copying and truncation; it is not a default choice for
   payment/audit logs. Do not rotate currently open files with broad `rm/find`.

4. Docker removes the oldest rolled logs at write time once its configured file
   count is exceeded. No external cleanup cron for container log files.

5. Keep existing five-minute ops checks and hourly meaningful-change reporting.
   Proposed follow-up checks: effective journal cap, logrotate freshness/result,
   actual container logging options, and sustained directory-budget overruns.
   These new checks are **not implemented or installed** yet. Any ops code change
   must retain tests and install from a pushed fixed SHA outside app releases.
   Do not turn a log-budget warning into automatic arbitrary file deletion.

Expected local retained logs: approximately 1.5–2 GiB with headroom, not a hard
combined quota. This excludes database/WAL, backups, uploads, message/email data,
and other application state. Ordinary logs may record service, severity, time,
status, elapsed time, counts, and non-sensitive request IDs; never credentials,
cookies, user inputs, email bodies, or complete sensitive query strings.

## Rollout and acceptance, after approval

- Validate the effective journald/logrotate definitions before applying them;
  use logrotate debug mode for a no-write check. Keep the existing maintenance
  coordination and locks. Do not disable startup/release guards.
- Apply journal/native-file policy first; preserve unrelated Web PIDs. Check
  real log delivery, timer results, local/public HTTP, and disk usage afterward.
- Roll container settings out through individually approved releases. Existing
  unbounded containers remain explicitly pending until their effective
  `HostConfig.LogConfig` is verified; a new Compose file alone is not completion.
- Do not add new log namespaces or collectors without a separate decision.
  If strict individual quotas or exact retention by day become necessary,
  revisit that requirement instead of pretending shared budgets enforce it.

## Primary references

- [Ubuntu/systemd journal configuration](https://manpages.ubuntu.com/manpages/noble/man5/journald.conf.5.html)
- [Ubuntu logrotate manual](https://manpages.ubuntu.com/manpages/noble/man8/logrotate.8.html)
- [Upstream logrotate manual](https://github.com/logrotate/logrotate/blob/main/logrotate.8.in)
- [Docker json-file rotation](https://docs.docker.com/engine/logging/drivers/json-file/)
- [Docker logging configuration and container recreation](https://docs.docker.com/engine/logging/configure/)
- [Caddy runtime/access log distinction and rolling](https://caddyserver.com/docs/caddyfile/directives/log)
- [PostgreSQL 16 diagnostic logging](https://www.postgresql.org/docs/16/runtime-config-logging.html)
