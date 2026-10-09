# 本机业务隔离日志 — 2026-10-08 实施记录

服务器：`ubuntu@43.135.155.97`。用户批准本地轻量管理，明确不需要网页入口。
使用现有 systemd-journald / logrotate；没有安装集中日志平台、采集器、
日志数据库或自定义常驻清理程序。配置源位于 `deploy/logging/`。

状态：**两轮日志隔离与六容器容量限制已实施并验收；BEpusdt 原生文件日志容量为用户已接受的例外，不再处理**。
2026-10-09 用户明确决定不修改该原生 logger；这不是待授权任务。
不要把静默 backup namespace 或支付原生文件预算说成具备已验证的严格容量上限。

## 磁盘预算与实际生效范围

普通诊断日志总预算目标约 **1 GiB**，不是 RAM，也不是每个项目 1 GiB。
所有 journal 配置合计 **488 MiB**，给文件日志、容器及轮转余量留下 536 MiB。
容量优先于天数；`14day` 是最长保留目标，不保证完整保存 14 天。
这些成熟组件按文件轮转，不是字节级实时硬配额／逐行即时 TTL。

| Journal 池 | SystemMaxUse | 本轮状态 |
| --- | ---: | --- |
| 默认系统／安全／PID 1 | 128 MiB | 已生效；保留原有 auth/syslog 转发 |
| JevHub | 32 MiB | Web 已验证；原 retention task 下次执行采用新池 |
| InboxRevamp Web | 32 MiB | 已验证真实应用日志投递 |
| InboxRevamp scheduled tasks | 96 MiB | 四类原任务自动采用新池，结果均 success |
| Store 前端 | 48 MiB | 已验证；不包含后端容器 |
| VIP | 16 MiB | 第二轮已重启，启动 guard、本机 200 和稳定 PID 通过；公网验证仍未配置 |
| Workflow Lens | 24 MiB | Web 已验证；backup 下次执行采用新池 |
| Caddy | 24 MiB | 已验证；未开启全量 access log |
| Goofish Bot | 16 MiB | 第二轮已重启，真实日志进入新池，受保护公网 401 符合预期；文件轮转已生效 |
| X Telegram relay | 16 MiB | 第二轮已重启，4 条真实启动日志入池；现有路径配置关闭重复文件输出 |
| BEpusdt | 16 MiB | 第二轮已重启，真实日志进入新池，公网 200；支付文件日志容量未改 |
| 运维巡检 | 24 MiB | 原 timer 后续执行已进入新池 |
| Umami backup | 16 MiB | 配置已装，下次原计划执行生效；容器日志另计 |
| **合计** | **488 MiB** | 已包含默认池和尚未激活的预留池 |

命名业务池不再转发到 syslog，不产生第二份业务 stdout；系统池仍转发，
以保留认证文件日志。PID 1 的管理消息仍属于默认池，namespace 不会搬走它们。

## 高频任务降噪与失败可观测性

`inboxrevamp-gmail-cron@.service.d/30-business-logging.conf` 设置：

```ini
[Service]
LogNamespace=inbox-jobs
SyslogLevel=notice
LogLevelMax=notice
```

先核对原 wrapper：正常输出使用 console.log，失败使用未加优先级前缀的
console.error，并设置非零退出码。仅提高过滤阈值会丢 stderr，因此同步
把默认 stdout/stderr 投递优先级设为 notice；不把它误称为错误分类。
保留普通输出／stderr／明确的高优先级信息；过滤 info/debug 及 PID 1
关于该单元的正常 Started/Finished 消息。任务失败仍有 Result、ExecMainStatus
和 PID 1 失败提示。没有修改任务间隔、请求方式、OAuth 或业务状态。

纯合成 oneshot canary 验证了 stdout、stderr、显式 err 优先级和退出 1；
错误可见，正常生命周期消息不出现。真实任务随后进入 inbox-jobs，四类
service Result=success / ExecMainStatus=0；采样期间默认池无这些任务的
正常启动／结束洪水。没有人工调用任何 Gmail cron HTTP 接口。

## 已安装的文件日志轮转

现有 `logrotate.timer` 改为每小时检查，仍只用系统原有 logrotate service
和 state 文件；`daily` 加 `maxsize`，无需新写删除程序。

| 文件日志 | 单文件触发阈值 | 归档数 | 方式 |
| --- | ---: | ---: | --- |
| syslog | 8 MiB | 3 | rename/create + 原 rsyslog reopen |
| auth.log | 4 MiB | 3 | 同上；保留原权限 |
| kern/mail/user/cron/mail.err | 1 MiB | 3 | 同上；缺失文件跳过 |
| btmp / wtmp | 各 4 MiB | 1 | 包原有 create 权限 |
| PostgreSQL 诊断 `.log` | 2 MiB | 4 | 保留包原有 copytruncate；未重启 DB |
| pgBackRest 诊断 `.log` | 1 MiB | 4 | 保留原 copytruncate；不是 backup/WAL 文件 |
| Goofish `logs/*/*.log` | 1 MiB | 3 | rename/create；每次 appendFile 按路径重开，无须重启 |

以上 maxage=14，按大小／数量可更早淘汰；阈值每小时检查，不是实时硬上限。
Goofish 设置 ifempty，使静止文件也参与每日归档过期检查；保留日期目录，
不处理其 data/、订单数据库或配置。未给支付／消息业务新加 copytruncate。
PostgreSQL／pgBackRest 沿用既有机制的丢记录窗口没有因此消失。

logrotate maxage 在轮转时检查：其他长期静止的旧归档不保证精确 14 天删除。
没有清理备份、数据库、支付流水、mail/job records 或运维的状态／审计 JSON。

## 容器与剩余原生文件日志

`docker-capacity-plan.json` 是预算清单，不是可直接套用的 Compose。
用户已批准逐项重建；六个原先无限额的容器现已逐项验收实际容量选项。
Telegram Forwarder 原有 10 MiB × 3 的限制保留不变。新限额只有重建容器
才会生效，普通 restart 不能替代重建；没有重启 Docker daemon。

当前有效容量预算：Store 四容器合计 60 MiB，Umami 两容器合计 30 MiB，
Telegram Forwarder 30 MiB，**容器合计 120 MiB**，不是各容器 120 MiB。
json-file 不提供按天 TTL，现有方案只控制容器容量，不能报告严格 14 天过期。
重建时必须保留固定镜像、原卷（含 Redis 匿名卷）、网络和所有资源／安全
限制，并更新 Store root-only snapshot 与匹配检查；不修改数据卷内容。

X relay 使用现有 `TWSCRAPE_RELAY_LOG_FILE=/dev/null` 配置关闭重复文件输出，
保留 stderr → 独立 journal；已用真实 logger 函数做合成 canary，并验证新 PID 的实际投递。
不要给整个 logs 目录加年龄删除规则：未知文件、数据库或运行状态可能被误删。
NewAPI 使用当前官方版本的 `--log-dir` 空值关闭重复诊断文件，只修改该参数，
保留其余 CLI 参数；不得用静态 command override 替换整条命令。
BEpusdt 的原生 logger 仍为每类 300 MB × 6、7 天，程序没有容量配置项。
2026-10-09 用户明确接受该例外，不修改源码、不重建、不增加文件清理规则，
也不继续催促授权。不要因此宣称全机日志已具备严格 1 GiB 总硬配额或
严格 14 天逐行删除；真实磁盘压力仍按现有阈值报告。

## 第一轮验收及回退边界（历史记录）

- systemd-analyze verify、全局 logrotate dry-run 通过；原 timer 在
  19:40 Asia/Shanghai 实际执行，Result=success / ExecMainStatus=0。
- JevHub、InboxRevamp、Store 前端持有各自项目锁，前后 guard 均 PASS。
  Workflow Lens、Caddy 逐个迁移。五个 Web 本机／公网 200，稳定 PID 验证通过。
- 本次没有部署应用代码或切换 current。期间另一轮 InboxRevamp 发布已经
  把 current 推进到 99a05617-evidence-20261008；这里只验证并保留该版本。
- PostgreSQL、Bot、支付、VIP 和七个容器 PID 未被本次迁移改变。
- journal 总目录约 2.15 GiB → 150 MiB（含新业务池）；默认池约 122 MiB。
  syslog 约 443 MiB → 12.5 MiB。root 约 47%，可用约 30 GiB。
  同时有其他发布活动，不能把 root 的全部容量变化归因于日志。
- 实测默认池加七个活跃 namespace 的 MemoryCurrent 合计约 14.9 MiB，
  是当时 cgroup 采样，不是永久 RAM 上限。主机 available 约 2.0 GiB。
- 已淘汰／过期的历史日志没有另存副本，不可从本轮操作备份恢复。
  原配置保留在 root-only `/etc/jevhub-ops/logging/previous-20261008.PWnaVK`
  （约 48 KiB），只用于配置回退，不包含代码、数据库或日志内容。
- 本地 npm run check 通过：lint、typecheck、184 tests、production build，
  一个原有可选 DB integration test 跳过。初次构建被沙箱端口权限阻止，
  在正常本机权限下重跑通过；未改依赖。新增 7 个配置回归测试。
- 19:59 收尾仅移除本轮创建、inode 已核对的维护标记；原自动运维 timer
  保持 enabled/active。随后只读 audit 的 guard／HTTP／Gmail 计数均正常，
  原环境文件仍为 root:root 600。两条高频 timer 采样告警需按先读取
  LastTrigger、service 结果再读取 uptime 的顺序复核，不据旧采样重启任务。
  收尾复核两者触发距采样约 1.69 秒，均 enabled/active、service success/0，
  确认为已知非行动采样误报。删除了本轮独占临时上传包／一次性清单，
  正式配置和小型原配置回退副本保留；未遗留维护暂停标记。

修改原 namespace/drop-in 前先取锁、开启自己的维护标记、备份配置。
只有自己的维护标记可在全部验收后移除，不能移除其他维护者的标记。
现有自动运维代码／policy 不因日志配置变更获得任何新增操作权限。

## 第二轮验收 — 2026-10-08

- 从已推送固定提交 `fa7d9d14317994e3442ed3ffd44450baac96ee00` 安装日志配置源及
  Store 快照工具，位置在 release 外；工具 SHA256 为
  `4880a20d8061f96db0b28ab83b14110590c1865c7537e3b59bdede78406a0f9c`。
  原巡检 worker/core SHA `8e449b2f5bfdeabab8a5f080db5539b81e050917` 与 root policy 未变，
  core INSTALL 中单独记录组件 SHA/hash，不冒称整个 worker 已升级。
- VIP、Goofish、X relay、BEpusdt 逐项重启，实际 journal 投递及稳定 PID 已验证。
  没有做消息发送或付款交易测试。X relay 应用源码、启动命令未改，旧日志 FD 为零。
- Umami Web、DB 和 Store Adapter、PostgreSQL、Redis、NewAPI 逐项重建，原实际镜像
  ID、数据卷、环境值、网络别名集合和资源/安全设置通过比较；其余容器不同时重建。
  PostgreSQL readiness 与 Redis 认证 PING 通过；七个容器均 running，四个配置了
  healthcheck 的容器均 healthy，采样时 restart count 均为 0。
- NewAPI 仅将现有 log-dir 值改为空，未丢弃其他参数。Docker 仍有真实诊断输出，
  原生诊断日志 FD 为零；SQL 审计/计费记录与数据卷未清理。Telegram Forwarder 已有
  30 MiB 容量限制，因此本轮保留其配置和 PID，没有为相同配置再重建。
- 运行门禁先后阻止 DNS 空列表表示、重复 DNS 别名、挂载列表/绑定列表顺序和
  Redis 原匿名卷显式绑定的表示差异。先回退并核实真实运行状态，再限制等价判定范围；
  未忽略任意网络、卷来源或权限变化。初次 Redis 回退验收失败后，只读实查确认原卷、
  PING 和三处 HTTP 正常；未猜测该次验收失败的具体原因。随后重新验收成功。
- 独立审查在安装前阻止了目录范围的未知文件删除与整条 NewAPI command 覆盖。
  移除这两个配置；挂载排序/别名去重都有先失败、后通过的回归测试。
  稳定排序安装后，连续 12 次只读快照审计全部通过。
- 最新本地 `npm run check`：lint、typecheck、200 tests、production build 通过，
  一个原有可选 DB integration test 跳过。[该固定提交 CI](https://github.com/Hinstein/jevhub/actions/runs/37797913863) 通过。
  没有安装/升级依赖，没有部署应用代码或切换 current；另一轮 InboxRevamp 发布推进到
  `4627ae53-utc-evidence-20261008`，只读 guard 和本机/公网 200 均正常，未回退它。
- 15:38 UTC 的新只读全机审计：四项目 guard PASS，本机 HTTP 全部 200；三个已配置
  公网主站和 Workflow/两处 analytics/Store admin/payment 均 200，Bot 为预期 401。
  VIP 未配置公网验证、Arc Observer 按原批准停用，均不是本轮新增异常。
  Gmail needsReauth/pendingJobs/otherConnectionErrors 均 0，没有调用任何 cron HTTP。
- 运维及 logrotate timer 为 enabled/active，其 service Result=success/0。
  高频 Apply timer 先取触发时间、再取 uptime，实测新鲜并 success/0，未人工触发任务。
  root 使用率约 47%，可用约 30.2 GiB；不能将其他并行发布的容量变化归因于日志。
- 此时 journal 合计约 117.7 MiB；各 journal cgroup MemoryCurrent 合计约 55.4 MiB，
  含缓存的瞬时采样，不是 RSS 或永久 RAM 上限。业务池不互相挤占容量；默认池仍由
  系统/安全/PID 1 共享。analytics backup 尚未自然触发，新池为 0B，没有为它启动备份。
- 关闭重复写入后保留了约 4.8 MiB relay、5.5 MiB NewAPI 的旧诊断文件，未对这些目录
  或未知文件做年龄删除；它们不再继续产生重复新日志。BEpusdt 原生文件实测约 1.3 MiB，
  两类硬编码的潜在总容量约 3.6 GB；当时尚未获准修改，2026-10-09 用户决定保留
  为已接受例外，不再处理。不能宣称全机严格 1 GiB/14 天。
- 收尾于 2026-10-09 00:14 Asia/Shanghai（2026-10-08 16:14 UTC）：持有全局锁重新
  验证四项目 guard／HTTP、九服务稳定 PID、七容器原镜像及容量配置、Store 快照、
  运维／logrotate timer 的 enabled/active 和 service success/0，然后仅移除本轮创建、
  inode／owner／内容均匹配的维护标记。没有因采样告警人工触发后台任务。
  root-owned `logging/INSTALL.json` 为 600，记录 13 个 journal 配置 hash、固定源提交、
  七容器限额及当时未获修改授权的支付原生容量项；该历史收据不等于待办授权请求，
  现状按上面的已接受例外处理。未扩大原运维权限。
- 删除本轮 11 个已核对 inode／uid／大小、无进程／服务／挂载引用的临时上传包和助手
  （406,132 字节）。正式配置源和小型配置回退副本保留，不包含旧应用代码或日志内容；
  不清理 shared、真实备份、数据库、数据卷或未知文件。
- 完成后最后一个临时收尾脚本也按 inode／hash／无引用检查删除；本轮共移除 12 个
  临时文件、416,507 字节，源代码和正式配置可追溯。00:16 的维护后只读审计确认
  标记不存在、自动报告仅 86 秒且新鲜，guard／HTTP／七容器及全部 timer 正常，
  Gmail aggregate 的三类计数均 0。VIP 公网未配置和已停用 Arc 仍为原已知非行动状态。

## 收尾校验工具与已接受例外 — 2026-10-09

审查发现完整容器等价比较器和 DNS 合成验证仅存于一次性维护助手，未随配置源
入库。现在将可复用的**只读**比较器保存为 `scripts/container-runtime-guard.mjs`，
回归用例保存为 `tests/container-runtime-guard.test.ts`，由现有 `npm run check` 和
PR/main CI 自动执行。它不运行 Docker、不写文件、不重建或重启任何容器，
不替代维护锁、授权、ready、HTTP、稳定 PID 检查或失败回退。

比较规则限定为：

- 实际固定 image ID、环境值、启动参数、用户、健康配置、资源与安全限制保持不变；
  无关容器的 ID/PID/restart count 必须不变。未知配置字段保持严格比较。
- 仅 `Dns` / `DnsOptions` / `DnsSearch` 的 `null` 与空数组视为等价；真实覆盖值不忽略。
- 原网络 ID、自定义别名和网络配置保持不变；去重同名别名，目标容器的自动
  ID/hostname、endpoint/动态地址和两类 Compose 生成收据允许变化。
- 挂载顺序不影响比较；仅与有效卷精确匹配的简单 named-volume 绑定可排序。
  Redis 例外只允许选定 `jev-mvp/new-api-redis` 原有单一匿名卷 `/data:rw`
  变为显式绑定；卷名、来源、driver、权限和 propagation 均不能改变。
- 只有显式选择的目标容器允许变更日志设置，变更后必须精确为压缩 `json-file`
  `5m × 3`；可选 `--newapi-stdout` 只允许 Store NewAPI 的 log-dir 变为空，
  不丢弃其他命令参数。没有该开关则所有参数严格不变。

在**另外获准的**手工维护中，先持有项目锁并捕获完整 before/after inspect 到
同一操作者持有、权限 600 的常规文件；不能把原始 inspect 打印到聊天、上传 CI
或提交 Git。以下仅比较已捕获的文件，不执行维护：

```bash
node scripts/container-runtime-guard.mjs /root/approved-maintenance/before.json /root/approved-maintenance/after.json \
  --target /jev-mvp-new-api-1 --newapi-stdout
```

不传 `--target` 时只验证无日志策略、镜像引用或进程变更的运行等价性。输出仅含
通过/失败、容器数量和差异类别，不包含环境值、命令、路径或容器名；失败退出 2。
权限不合格、symlink、格式错误、不健康容器、缺失容器或未知开关均失败，不绕过。
合成快照测试同时验证可接受表示差异和真正配置变化，未在生产创建 canary 容器。

日志配置／工具／测试／脱敏实施记录统一保存在 JevHub 运维分支，并不是复制到
每个业务仓库。运行日志、原始 Docker 快照、root 收据和凭据只留服务器，不进 Git。
InboxRevamp 的 `LogNamespace=inbox-web` 现由 root 持有的主 service 文件持久化；
无需为逐字匹配模板重加 drop-in。后续发布同时核验磁盘配置、loaded 属性和实际
投递，不因 drop-in 位置不同错误覆盖另一发布流程的主配置。

收尾验证（2026-10-09 11:07–11:08 Asia/Shanghai）：从固定 HEAD 导出的干净副本
仅叠加本轮工具、测试与运维文档，排除原工作区页面修改；按锁文件 `npm ci`，
使用 Node 22 / Next 16.3.6，完整 `npm run check` 通过：lint、typecheck、232 tests、
production build（107 个生成页面），原有可选 DB integration test 跳过 1 项。
现有工作区 `node_modules` 实际为 Next 16.2.6，因此未复用它作为锁文件验收结果。
初次沙箱构建因本机端口权限失败，按原质量命令在正常权限下重跑成功，没有
改构建脚本、放宽测试或升级锁文件。Vite 的已有配置加载兼容提示仍存在。

11:08 的 SSH 只读验收：自动报告仅 105 秒，四项目 guard 通过，所有已配置
本机／公网检查通过（Bot 为预期 401），七容器均 running、无 OOM/restart，
无 failed 服务；Gmail 三类聚合计数为 0，运维／轮转／四类 Gmail timer 新鲜且
success/0，全局 logrotate dry-run 通过。Inbox Web 的 on-disk/loaded namespace
均为 `inbox-web`。root 使用率 48%，可用约 29.9 GiB；VIP 公网未配置与已停用
Arc 均为原已知非行动状态。本轮只做源码归档与只读验收，不部署、重启或清理。

## 后续发布和排错

部署应用继续遵守 PRODUCTION_OPERATIONS.md，保留上述 root-owned 日志映射
（drop-in 或已核实的主 service 指令）。
检查 LogNamespace 属性后，还应确认新进程的实际日志进入目标池；只改配置
或 daemon-reload 不会搬走已经启动的 stdout 连接。不要为迁移日志手工执行
邮件／支付／备份任务。正常 scheduled tasks 在原 timer 的下一次执行采用新配置。

```bash
sudo journalctl --namespace=inbox-web -u inboxrevamp.service --since '-30min'
sudo journalctl --namespace=inbox-jobs -u inboxrevamp-gmail-cron@revamp-apply.service --since '-30min'
sudo journalctl --namespace=ops -u jevhub-ops.service --since '-30min'
# 管理日志在默认池；需要所有池时显式使用 --namespace='*'。
sudo journalctl --namespace='*' -u jevhub.service --since '-30min'
sudo systemctl show logrotate.service -p Result -p ExecMainStatus
sudo systemctl show logrotate.timer -p ActiveState -p UnitFileState
```

诊断输出仍须脱敏，不向第三方发送日志，不打印环境变量、邮箱正文或原始
Docker 配置。配置／测试／门禁修复已推送 `codex/business-logging-20261008`，
PR #7；固定安装提交 fa7d9d1 的完整 CI 已通过，最终验收记录沿用同一 PR 提交。
未合并 main，不混入原有 next-env.d.ts、tsconfig.tsbuildinfo 或 social-assets/。

组件语义来源：[systemd 255 执行环境](https://github.com/systemd/systemd/blob/v255/man/systemd.exec.xml)、
[journald 配置](https://github.com/systemd/systemd/blob/v255/man/journald.conf.xml)、
[Ubuntu journald namespace / 安全 restart](https://manpages.ubuntu.com/manpages/noble/man8/systemd-journald.service.8.html)、
[Docker 配置生效范围](https://docs.docker.com/engine/logging/configure/)、
[logrotate 手册](https://github.com/logrotate/logrotate/blob/main/logrotate.8.in)。
