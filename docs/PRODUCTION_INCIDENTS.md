# Production incident registry

Server: `43.135.155.97`. Record only operational metadata; no credentials,
mailbox/account identifiers, user text or raw environment/Docker output.

| Incident | Evidence and cause | Prevention / bounded response |
| --- | --- | --- |
| 2026-10-03 Store frontend failed after cleanup/reboot | Retained `fcbbd3a/node_modules` referred to removed `5ebd735`. A running process hid the missing startup files. | Independent lockfile installs; recursive release guard; startup gate; real HTTP and PID stability checks before/after cleanup. |
| 2026-10-08 Gmail synchronization alarm | Initially one connection was `NEEDS_REAUTH / GMAIL_AUTH_REVOKED`; last successful sync 2026-10-06. An actual Google refresh attempt returned `400 invalid_grant` (expired/revoked). Later read-only verification confirmed reconnection and successful sync; see the recovery receipt below. | Automatically detect and deduplicate owner-action incidents. Reconnect Gmail in the existing dashboard. Never falsify ACTIVE/sync timestamps, send mail, delete a connection or repeatedly restart the Web app. Google OAuth Testing's seven-day limit is a possible cause, not a verified console setting. |
| 2026-10-08 InboxRevamp old-release dependency | Running release `2d57d00-main-20261005` had 659 cross-release symlinks into `75dfbcb-proxyfix` and `b0c230e-main-old-label-choice`. No current pointer; 20 sequential release drop-ins. | Build an independent release from an owner-approved pushed fixed commit after all quality/security gates. Canonical current/unit/startup guard. Cleanup is blocked until independence and all references pass; the original locked dependencies currently fail the security gate. |
| 2026-10-08 disk pressure | 59 GiB root volume, 93% used, about 4.1 GiB available before repair. InboxRevamp kept roughly 15 GiB of old code releases. | Automatic cleanup of unreferenced, verified old code releases only, under project locks and the current-only retention policy. Protect DBs/backups/real env files, Arc observations and OrdoFi run data. |
| 2026-10-08 Store missing Compose entry points | Four healthy containers' labels referred to deleted `4e286dd`/`26857b6` backend Compose paths. They survived because Docker retained runtime configuration. | Root-only persistent, image-pinned Compose snapshot outside releases; exact volume/network preservation; validated compatibility pointers. Auto restore missing pointers only if snapshot still matches. No container/DB restart for this repair. |
| 2026-10-08 build configuration access | Ubuntu Node could not read shared `.env.production`: file exists as root:root `600`; systemd can read it. | Preserve permissions. Root build runner reads configuration into memory and passes values to the build user, never in argv/output. Failed quality checks leave production unchanged. |
| 2026-10-08 TypeScript build heap limit | Original server typecheck exhausted Node's roughly 1.9 GiB default heap. Other Web services remained active. | Build in an explicit CPU/memory/swap-limited scope after checking headroom. Do not skip quality gates or let build OOM affect unrelated services. |
| 2026-10-08 misleading Gmail metrics endpoint | Source inspection showed the metrics GET also calls application retention pruning. Earlier diagnostic GETs did not capture pruning counts. | The monitor must not call this endpoint. Use an enforced READ ONLY aggregate query and inspect existing timer results; original application retention stays in its own scheduled task. |
| 2026-10-08 InboxRevamp dependency security gate | Fresh `npm audit --omit=dev` reported one critical and two high production-dependency findings, including locked Next.js 16.3.5. Existing CI gates production audit at high. | Record and request explicit dependency-update authority. Do not suppress audit, upgrade automatically or mark the tests-only independent release ready while this gate fails. Keep production unchanged pending approval and complete clean verification. |

## Gmail recovery verification

Before activation on 2026-10-08, an enforced READ ONLY query confirmed the
connection was `ACTIVE`, with a new connection time of 10:23 and a successful
sync at 10:43. Completed `HISTORY_SYNC` and `LABEL_VERIFY` jobs were present;
there were no pending jobs or current connection errors. The existing metrics
cron also reported success. No token refresh or connection-state mutation was
performed by this recheck. This verifies reconnection and synchronization, not
every mail/label business behavior or a change in Google's publishing settings.

If authorization fails again, use [Reconnect Gmail](https://inboxrevamp.com/dashboard).
The monitor detects and deduplicates the owner-action requirement; it cannot
reauthorize Google. Never infer connection health from the homepage alone.

## Repair verification log

The bounded automatic-operations installation is enabled; the independent
InboxRevamp application rollout is still blocked pending dependency-update
authority:

- CI-passed ops SHA `8e449b2f5bfdeabab8a5f080db5539b81e050917` is installed outside
  releases. Source hashes and root ownership are recorded in
  `/etc/jevhub-ops/INSTALL.json`. Its systemd maintenance-mode test completed
  with `Result=success / ExecMainStatus=0` before activation.
- At 10:55 China time, the installer removed only its own known maintenance
  marker, enabled `jevhub-ops.timer`, and loaded startup guards/bounded failure
  restart settings for JevHub, Store frontend and VIP. It held the global and
  affected-project locks throughout. No healthy Web application was restarted
  by installation. InboxRevamp cannot receive its canonical startup guard until
  its independent runtime is ready; VIP automatic mutations remain disabled.
- The first enabled run at 10:55 completed successfully. JevHub, InboxRevamp
  and Store returned local/public HTTP 200; VIP returned local HTTP 200 and
  explicitly skipped public verification. Their PIDs and restart counters were
  unchanged. Guard failed only for the known dependent InboxRevamp runtime.
  No cleanup or recovery action was taken. Store's two newly created Compose
  compatibility directories were skipped, as required, and must remain protected.
- The remaining read-only Web checks passed (the protected bot correctly
  returned 401), all seven Docker containers were running, and backup/Gmail/
  retention timers passed freshness checks. Root disk remained about 96% used,
  with 2.7 GiB available; this is still an unresolved disk-pressure incident.
- Final verification at 11:09 China time confirmed installed source hashes
  matched the fixed SHA, the receipt was `enabled`, maintenance was absent,
  the timer was enabled/active and the latest service execution was successful.
  Its automatically refreshed 11:08:55 report was six seconds old. The worker
  emitted `changed:false`, confirming meaningful-issue deduplication. All four
  Web PIDs/restart counters still matched pre-install observations, and the
  release-removal action count remained zero. InboxRevamp's shared environment
  file retained mode `600`.
- A separate hourly thread heartbeat named `生产服务器异常跟进` was created for
  read-only meaningful-change notifications. Existing automations were not
  modified. Unchanged known blockers and expected protected compatibility
  directories are not repeated alerts. Server recovery remains the systemd
  timer's responsibility, not the notification heartbeat's.
- Store's persistent root-only Compose configuration and two legacy pointers
  were validated. The four container PIDs, existing network and volumes were
  unchanged; no container recreation/restart was performed.
- InboxRevamp tests-only repair is pushed on `codex/runtime-release-quality-20261008`
  at `dddd4cc61fba9e3cd4834faf9650af1a4ea0e714`. Full tests: 950 passed, 74 existing
  skips; lint/typecheck passed. Application/schema/lockfile remain unchanged.
  Production stays on the prior release because its dependency security gate
  fails and dependency-upgrade authority is still pending.
- First read-only audit exposed systemd's formatted monotonic timer values;
  regression fixtures now parse formatted and numeric values without marking
  healthy timers stale. Disk pressure uses available unreserved blocks, matching
  `df` (about 96% used / 2.7 GiB free at this stage), rather than understating
  pressure by including root-reserved space.
- Safety review produced real deletion/pointer/finalization counterexamples.
  They are covered by behavioral fixtures before mutation enablement. Complete
  JevHub checks passed (177 tests, one optional DB integration skip), and clean
  remote CI passed for the installed SHA. A fresh targeted guard/ops/Compose
  rerun passed all 98 tests. VIP is read-only until a public verification target
  is deliberately configured.

No release, environment file, database, backup or business data was removed in
this rollout. Record any later automatic removals from the per-release action
log. Do not clear the InboxRevamp dependency or disk-pressure incidents merely
because the monitoring service is healthy.

## Owner-approved historical data removal — 2026-10-08

At 17:26 Asia/Shanghai, the owner separately authorized one-time deletion of
Arc Observer observations and Ordo historical experimental runs. This exception
does not expand the automatic operations policy: future observations/run data
remain protected without new authorization.

- Rechecked stopped producers, the disabled/inactive Arc unit, process
  cwd/argv/maps/open-file references, target filesystem boundaries, and all
  Docker container mounts. No active producer or data mount was found.
- Held the global ops lock plus the two data-cleanup locks. Checked directory
  and regular-file identities again before deletion; rejected symlinks,
  cross-filesystem entries, protected filenames, and multiple hardlinks.
- Removed 122 `observations.ndjson*` files from `/var/lib/arc-arb-observer`
  (6,386,429,952 allocated bytes). Preserved its 4 KiB `status.json` and directory.
- Removed 18 historical JSON/NDJSON run files from
  `/home/ubuntu/ordofi-b2/data/runs` (5,462,761,472 allocated bytes). Preserved
  its empty directories, code/releases, other data such as audits, and config.
- Intent and completion are recorded under journal tag
  `jevhub-manual-cleanup`; 140 files deleted, 11,849,191,424 bytes (about
  11.0 GiB) freed. No backup/archive was created; the deleted files cannot be
  recovered from a backup made by this operation.
- Root usage decreased from 71% to 51%, with about 27.7 GiB available. The nine
  checked application/proxy/bot PIDs remained unchanged; no service was restarted.
  JevHub, InboxRevamp, Store, and VIP local HTTP returned 200; the three configured
  public main sites returned 200. VIP public verification remains unconfigured.
- Databases, WAL/backups, environment files, payment/message state, and the
  existing installed ops code/policy were not changed. Logging retention was
  only inventoried and proposed in `PRODUCTION_LOG_RETENTION_PLAN.md`, not applied.

## Owner-approved local logging — 2026-10-08

The owner later approved business-isolated local logging and declined a Web UI.
See [implementation receipt](PRODUCTION_LOG_LOCAL_SETUP.md) for exact budgets,
installed-versus-pending status, measurements and log-loss/config rollback bounds.

- Installed ordinary journal limits totalling 488 MiB across all configured
  pools, 14-day maximum retention targets and small file rotation granularity.
  Main Web/task/ops pools are active; some service mappings await an approved
  restart. Capacity/rotation may retain less than 14 days.
- Preserved plain task stdout/stderr at notice while filtering routine info-level
  PID 1 lifecycle noise. A synthetic success/failure canary proved visibility;
  real Gmail timers/frequency and successful task outcomes were unchanged.
- Existing logrotate checks hourly; actual 19:40 run succeeded. Standard rotation
  reduced the old syslog/journal footprint, without deleting DB/WAL/backups or
  changing OAuth, business records or container volumes. Deleted historical
  logs have no backup made by this operation; only old small configs are saved.
- Five Web services were migrated one at a time, preserving current code and
  checking guard where applicable, local/public HTTP and stable PID. No DB,
  Bot, payment, VIP or container restart. A concurrent InboxRevamp release was
  respected, not reverted or attributed to this logging change.
- All seven containers remain running; six still lack log capacity options.
  Container recreation and remaining native-file age/capacity controls are
  not complete. Do not report a strict full-server 1 GiB/14-day guarantee.
- Added seven local logging config tests; full local check passed (184 tests,
  one optional integration skip). No application code or ops worker upgrade
  was deployed by the first logging rollout. Config/docs/tests were subsequently
  pushed on `codex/business-logging-20261008` / PR #7, not merged into main.

### Second-round review and runtime gates

- The owner approved sequential service/container restarts, preserving each
  application's version, databases, data volumes and configuration. VIP,
  Goofish, X relay and BEpusdt namespace migrations passed stable-PID and actual
  journal-delivery checks; the protected Bot URL returned its expected 401.
  Payment transaction/message delivery was not exercised by these checks.
- An independent review found two unsafe proposed configurations before their
  installation: a whole-directory relay archive expiry rule could remove unknown
  files, and a static NewAPI command override could discard unrelated CLI flags.
  Removed both; use the relay's existing diagnostic path override and a tested
  argument-preserving NewAPI helper instead. No unknown relay files were deleted.
- Umami recreation stopped on a runtime-invariant difference and restored its
  original Compose file. The DB remained ready and public HTTP returned 200.
  The DB's reproduced difference was only three absent DNS override lists
  represented as `[]` versus `null`. A synthetic canary verifies normalization
  is restricted to these absent lists; actual DNS overrides and unrelated host
  differences still fail closed. Retry requires fresh runtime/HTTP verification.
  The first Umami Web mismatch was not reproduced and is not assigned a guessed
  root cause; its verified retry preserved the live parameters and fixed image.
- Store Adapter recreation also failed its initial network invariant and rolled
  back; runtime HTTP stayed healthy. Fresh inspection reproduced only duplicate
  aliases: the same two DNS names appeared four times, with no changed alias set
  or network. Snapshot reconstruction now deduplicates names while preserving
  custom aliases. A regression test first failed on duplicate growth and also
  checks that an actually added alias still changes the snapshot; the runtime
  gate compares unique names, not ignored networks or guessed exceptions.
- A repeated, locked, read-only Store audit then reproduced a separate existing
  nondeterminism: 3 of 12 checks reported only NewAPI's volume-array order changed.
  Docker returned the same mount mappings in different orders. Reconstruction
  now sorts by mount destination, retaining all source names and access modes.
  A red-first regression compares byte-identical snapshots from reversed mount
  order and ensures an actually changed volume still produces a different result.
- BEpusdt's native logger has no size setting: two hardcoded 300 MB log families
  can exceed the ordinary-log budget. Only its journal migration is complete;
  on 2026-10-09 the owner declined a native-logger rebuild and accepted this
  exception. It is closed, not a pending authorization request. Do not rebuild,
  add cleanup rules or repeatedly request approval. A strict fleet-wide 1 GiB
  limit still cannot be claimed; normal disk-pressure reporting remains enabled.

### Verified second-round outcome

All six formerly unbounded containers now use compressed json-file rotation at
5 MiB × 3 each. Existing Telegram Forwarder remains at 10 MiB × 3 without a
redundant recreation. Original image IDs, volumes, runtime values and security/
resource settings were checked, including the original Redis anonymous volume.
An explicit binding of that same volume and equivalent named-volume list order
are normalized only after exact mapping checks; different sources/modes remain
failures. Redis's initial rollback validation failed, but subsequent fresh PING,
HTTP and mount checks were normal; its later bounded-logging retry passed. No
unverified cause is asserted for the initial rollback validation failure.

NewAPI and X relay use existing diagnostic-path settings to stop duplicate disk
output while retaining actual Docker/journal diagnostics. No application source
upgrade, SQL audit deletion, backup deletion or email/transaction test occurred.
The updated Store tool is installed outside releases from pushed SHA
`fa7d9d14317994e3442ed3ffd44450baac96ee00`; core ops SHA/policy remain unchanged.
Local full check passed (200 tests plus one optional integration skip), and
the same SHA has successful hosted CI. Fresh 15:38 UTC guards/HTTP/containers
passed; known VIP public-URL absence and intentionally disabled Arc Observer
are not new faults. See the receipt for remaining payment-native capacity limits.

Final closeout at 16:14 UTC (2026-10-09 00:14 Asia/Shanghai) repeated four guard/
HTTP checks, nine stable service PID checks, seven container-capacity checks and
Store snapshot validation under the global lock. Ops/logrotate timers remained
enabled/active with successful executions. The installer removed only its own
identity-checked maintenance marker and 11 verified temporary uploads/helpers;
root-owned source/configuration receipts and small configuration rollback copies
remain. No production application commit was switched and no business data or
backup was removed. New timer samples were checked without manually executing
Gmail, payment or backup tasks.
The final temporary closeout helper was then removed after identity/hash/reference
checks (12 own temporary files total). The 16:16 UTC read-only audit confirmed no
maintenance marker, an 86-second-old fresh automatic report, healthy configured
HTTP routes/containers/timers and zero Gmail aggregate error/job counts; only the
previously known disabled Arc and absent VIP public-URL conditions remained.

### Review closeout — 2026-10-09

The second-round configuration-equivalence gate and DNS synthetic check had
remained only in a one-time maintenance helper. Archive the reusable read-only
gate in `scripts/container-runtime-guard.mjs` and its executable fixture tests in
`tests/container-runtime-guard.test.ts`, included by the existing full quality
gate. It never runs Docker or mutates files/services. It permits only scoped
representation differences (absent DNS lists, exact named-volume ordering,
the selected original anonymous Redis volume) and rejects real image, network,
source/mode, secret, command, resource or security changes. The selected target
must have exact compressed json-file 5m x 3 rotation; only Store NewAPI may
explicitly opt into the existing argument-preserving stdout-only helper.
Protected input snapshots never enter Git, logs or CI; output contains only
fixed difference categories and ordinal container indexes.

InboxRevamp's namespace is persisted in its root-owned canonical service file,
not in the optional logging drop-in. Both on-disk and loaded values were checked
as `inbox-web`; this is equivalent placement, not a restart-persistence failure.
Do not overwrite that unit merely to obtain byte-identical template placement.
The BEpusdt native capacity exception above is accepted, while capacity/TTL
claims retain their documented limits. No business code deployment, container
recreation, timer trigger, data cleanup or service restart belongs to this
source-archival closeout.

Before pushing, two-axis review reproduced three gaps in the initial new gate:
effective/unknown top-level fields were omitted, sorting duplicate environment
names could hide precedence changes, and Redis equivalence was incorrectly
bidirectional. CLI regressions failed on each before fixes. Retain effective
Path/Args/AppArmor and unknown outer/State/GraphDriver fields, reject duplicate
environment names and require Redis's exact explicit binding after the selected
transition. Generated engine metadata exclusions are narrow and do not erase
unknown fields. Follow-up Standards/Spec review found no remaining actionable
findings. The clean, locked-dependency Node22 check at 03:15 UTC passed lint,
typecheck, 240 tests (40 container-gate tests), production build, with the one
existing optional database integration test skipped. No unreviewed version of
the new comparator was pushed or installed on the production server.
