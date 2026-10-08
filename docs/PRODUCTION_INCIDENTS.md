# Production incident registry

Server: `43.135.155.97`. Record only operational metadata; no credentials,
mailbox/account identifiers, user text or raw environment/Docker output.

| Incident | Evidence and cause | Prevention / bounded response |
| --- | --- | --- |
| 2026-10-03 Store frontend failed after cleanup/reboot | Retained `fcbbd3a/node_modules` referred to removed `5ebd735`. A running process hid the missing startup files. | Independent lockfile installs; recursive release guard; startup gate; real HTTP and PID stability checks before/after cleanup. |
| 2026-10-08 Gmail synchronization alarm | One connection is `NEEDS_REAUTH / GMAIL_AUTH_REVOKED`; last successful sync 2026-10-06. An actual Google refresh attempt returned `400 invalid_grant` (expired/revoked). | Automatically detect and deduplicate owner-action incidents. Reconnect Gmail in the existing dashboard. Never falsify ACTIVE/sync timestamps, send mail, delete a connection or repeatedly restart the Web app. Google OAuth Testing's seven-day limit is a possible cause, not a verified console setting. |
| 2026-10-08 InboxRevamp old-release dependency | Running release `2d57d00-main-20261005` had 659 cross-release symlinks into `75dfbcb-proxyfix` and `b0c230e-main-old-label-choice`. No current pointer; 20 sequential release drop-ins. | Repackage the same pushed commit `2d57d008b547c9cd4f74775c92a039777eb216ee` into an independent release after full gates. Canonical current/unit/startup guard. Cleanup is blocked until independence and all references pass. |
| 2026-10-08 disk pressure | 59 GiB root volume, 93% used, about 4.1 GiB available before repair. InboxRevamp kept roughly 15 GiB of old code releases. | Automatic cleanup of unreferenced, verified old code releases only, under project locks and the current-only retention policy. Protect DBs/backups/real env files, Arc observations and OrdoFi run data. |
| 2026-10-08 Store missing Compose entry points | Four healthy containers' labels referred to deleted `4e286dd`/`26857b6` backend Compose paths. They survived because Docker retained runtime configuration. | Root-only persistent, image-pinned Compose snapshot outside releases; exact volume/network preservation; validated compatibility pointers. Auto restore missing pointers only if snapshot still matches. No container/DB restart for this repair. |
| 2026-10-08 build configuration access | Ubuntu Node could not read shared `.env.production`: file exists as root:root `600`; systemd can read it. | Preserve permissions. Root build runner reads configuration into memory and passes values to the build user, never in argv/output. Failed quality checks leave production unchanged. |
| 2026-10-08 TypeScript build heap limit | Original server typecheck exhausted Node's roughly 1.9 GiB default heap. Other Web services remained active. | Build in an explicit CPU/memory/swap-limited scope after checking headroom. Do not skip quality gates or let build OOM affect unrelated services. |
| 2026-10-08 misleading Gmail metrics endpoint | Source inspection showed the metrics GET also calls application retention pruning. Earlier diagnostic GETs did not capture pruning counts. | The monitor must not call this endpoint. Use an enforced READ ONLY aggregate query and inspect existing timer results; original application retention stays in its own scheduled task. |
| 2026-10-08 InboxRevamp dependency security gate | Fresh `npm audit --omit=dev` reported one critical and two high production-dependency findings, including locked Next.js 16.3.5. Existing CI gates production audit at high. | Record and request explicit dependency-update authority. Do not suppress audit, upgrade automatically or mark the tests-only independent release ready while this gate fails. Keep production unchanged pending approval and complete clean verification. |

## Owner-action item

Gmail authorization is the one known issue that cannot be automatically repaired.
Use [Reconnect Gmail](https://inboxrevamp.com/dashboard). After reconnect, the
existing sync/verification jobs and the automatic monitor must confirm that
stale/verification counters recover. A valid Web homepage alone is not proof of
a healthy Gmail connection.

## Repair verification log

The 2026-10-08 operational rollout remains in progress:

- CI-passed ops SHA `37e37a3dea6d5205dbc5131a39d2561a4320d847` was installed outside
  releases with maintenance enabled; its first run was a read-only audit. The
  timer is not enabled yet. Review corrections must be installed and verified
  before allowing automatic mutations.
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
  They are covered by behavioral fixtures before mutation enablement. VIP is
  read-only until a public verification target is deliberately configured.

Append final installed SHA, local/public HTTP checks, timer results and any
actual removals after observing them. No release/data cleanup has been claimed
or performed in this rollout yet; never mark OAuth reconnection complete without
fresh connection verification.
