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

## Owner-action item

Gmail authorization is the one known issue that cannot be automatically repaired.
Use [Reconnect Gmail](https://inboxrevamp.com/dashboard). After reconnect, the
existing sync/verification jobs and the automatic monitor must confirm that
stale/verification counters recover. A valid Web homepage alone is not proof of
a healthy Gmail connection.

## Repair verification log

The 2026-10-08 operational rollout is in progress. Append the actual fixed ops
SHA, InboxRevamp gate results, released space, current release, local/public
HTTP checks and timer results only after they have been observed. Never mark a
pending build or OAuth reconnection as complete.
