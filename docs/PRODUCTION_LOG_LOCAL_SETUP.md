# 本机业务隔离日志 — 2026-10-08 实施记录

服务器：`ubuntu@43.135.155.97`。用户批准本地轻量管理，明确不需要网页入口。
使用现有 systemd-journald / logrotate；没有安装集中日志平台、采集器、
日志数据库或自定义常驻清理程序。配置源位于 `deploy/logging/`。

状态：**Web／后台任务／系统和选定文件日志已实施；容器及部分服务仍待停机窗口确认**。
不能把下面的完整预算表说成所有运行进程都已经迁移完毕。

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
| VIP | 16 MiB | 配置已装；未重启，仍用原日志流；公网验证仍未配置 |
| Workflow Lens | 24 MiB | Web 已验证；backup 下次执行采用新池 |
| Caddy | 24 MiB | 已验证；未开启全量 access log |
| Goofish Bot | 16 MiB | namespace 配置已装但未重启；文件轮转已生效 |
| X Telegram relay | 16 MiB | namespace 配置已装但未重启；原文件 logger 已限 5 MB × 4 |
| BEpusdt | 16 MiB | namespace 配置已装但未重启；支付文件日志暂未改 |
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

## 容器和剩余文件日志：未完成的部分

`docker-capacity-plan.json` **只是计划**，没有写入 daemon.json / Compose。
六个现存容器仍使用无容量选项的 json-file；Telegram Forwarder 原有
10 MiB × 3 的限制保留不变。新限额只有重建容器才会生效，普通 restart
不能替代重建。没有重启 Docker、DB、Redis、支付或消息程序。

后续容量计划：Store 四容器合计 60 MiB，Umami 两容器合计 30 MiB，
Telegram Forwarder 30 MiB，**容器合计 120 MiB**，不是各容器 120 MiB。
json-file 不提供按天 TTL；需要另行确认容量优先是否可接受。
重建时必须保留固定镜像、原卷（含 Redis 匿名卷）、网络和所有资源／安全
限制，并更新 Store root-only snapshot 与匹配检查；不修改数据卷内容。

X relay 原生文件 logger 的容量已有界，未实现天数 TTL；BEpusdt 和 Store
容器的自写文件也未完成独立容量治理。不要因此宣称全机日志已具备严格
1 GiB 总硬配额或严格 14 天逐行删除。

## 本轮验收及回退边界

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

## 后续发布和排错

部署应用继续遵守 PRODUCTION_OPERATIONS.md，保留上述 root-owned drop-in。
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
Docker 配置。日志设置源和回归测试本轮尚未提交／推送；没有宣称已经进入 main。

组件语义来源：[systemd 255 执行环境](https://github.com/systemd/systemd/blob/v255/man/systemd.exec.xml)、
[journald 配置](https://github.com/systemd/systemd/blob/v255/man/journald.conf.xml)、
[Ubuntu journald namespace / 安全 restart](https://manpages.ubuntu.com/manpages/noble/man8/systemd-journald.service.8.html)、
[Docker 配置生效范围](https://docs.docker.com/engine/logging/configure/)、
[logrotate 手册](https://github.com/logrotate/logrotate/blob/main/logrotate.8.in)。
