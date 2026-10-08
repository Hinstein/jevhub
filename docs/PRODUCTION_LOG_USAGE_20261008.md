# 生产服务器日志容量只读统计 — 2026-10-08

本报告仅统计，不修改日志配置、不删除日志、不触发业务任务、不重启服务。

## 口径与共享预算

- “共享 1 GiB”指持久化日志的磁盘预算，不是程序运行内存。
- 用户希望共享日志池最多保留 14 天、合计约 1 GiB；这组新限制尚未安装。
- 全量 journal 快照：2026-10-08 18:24:40 Asia/Shanghai；扫描完毕，76/76 个文件、无重复记录。
- 当前 journal 物理分配：2.15 GiB。
- 当前可读记录最早为 2026-08-30，因此现有保留范围并不是 14 天。
- 所有现存日志正文合计：292.37 MiB / 4,136,554 条。
- 近 14 天正文合计：255.24 MiB / 3,721,815 条。
- 近 24 小时正文合计：23.21 MiB / 258,184 条。

项目表统计未压缩的 MESSAGE 正文大小，不包含完整索引、其他字段和分配开销。journal 文件混合存储、共享字段并可能压缩，不能把正文大小当成每个项目的精确物理磁盘占用，也不能按正文份额假定分摊 1 GiB。参考 [systemd Journal 文件格式](https://systemd.io/JOURNAL_FILE_FORMAT/)。

14 天是最长保留期，不是保证至少保留 14 天。共享池没有项目独立配额；达到容量限额时，更早的归档日志可能先被淘汰。限额/轮转也不是文件系统硬配额，活跃文件可造成短时偏差。参考 [Ubuntu journald.conf](https://manpages.ubuntu.com/manpages/noble/man5/journald.conf.5.html)。

## 逐项目 journal 正文统计

| 项目 / 日志来源 | 全部现存正文 | 其中近 14 天 | 近 24 小时 | 近 24 小时条数 |
|---|---:|---:|---:|---:|
| InboxRevamp Gmail / Apply 后台任务 | 129.28 MiB | 129.28 MiB | 21.35 MiB | 235,685 |
| Store 前端 | 97.37 MiB | 97.31 MiB | 0 B | 0 |
| 系统定时任务（cron / apt / logrotate 等） | 16.66 MiB | 5.92 MiB | 435.07 KiB | 5,861 |
| Goofish Bot | 6.04 MiB | 4.68 MiB | 10.91 KiB | 122 |
| Workflow Lens | 11.88 MiB | 3.93 MiB | 96.64 KiB | 488 |
| 其他系统 / 未能归属单元 | 7.42 MiB | 3.67 MiB | 443.08 KiB | 7,641 |
| Caddy | 3.88 MiB | 3.10 MiB | 78.66 KiB | 182 |
| 内核 | 7.00 MiB | 2.60 MiB | 185.28 KiB | 1,315 |
| SSH / 认证 / sudo | 6.83 MiB | 2.31 MiB | 286.25 KiB | 3,080 |
| X Telegram Push | 5.12 MiB | 1.69 MiB | 121.17 KiB | 1,596 |
| 服务器自动巡检 / 手动运维审计 | 234.71 KiB | 234.71 KiB | 234.71 KiB | 2,034 |
| InboxRevamp Web | 215.00 KiB | 215.00 KiB | 4.93 KiB | 94 |
| Bepusdt | 168.83 KiB | 168.83 KiB | 4.48 KiB | 54 |
| Docker / containerd 守护进程 | 118.81 KiB | 84.34 KiB | 0 B | 0 |
| JevHub Web | 40.15 KiB | 26.02 KiB | 356 B | 6 |
| 云服务器 TAT Agent | 25.96 KiB | 13.78 KiB | 1.55 KiB | 8 |
| 数据库备份任务 | 23.53 KiB | 8.86 KiB | 598 B | 8 |
| JevHub 保留期清理任务 | 6.82 KiB | 5.62 KiB | 411 B | 6 |
| Arc Observer 服务 | 2.30 KiB | 1.88 KiB | 317 B | 4 |
| 宿主机 PostgreSQL 服务单元 | 1.30 KiB | 1.08 KiB | 0 B | 0 |
| Umami Compose 启动服务单元（非容器应用日志） | 71.77 KiB | 1.06 KiB | 0 B | 0 |
| Jev VIP | 5.18 KiB | 710 B | 0 B | 0 |

零新增日志不等于服务故障。Store 大量旧日志包含之前的重启循环，不能把历史数量当成当前重启故障。Umami/Store 的容器应用日志与宿主机数据库文件日志另列；启动单元 journal 很少，不意味着这些项目全部日志都很少。Ordo 未检出所属已知服务单元的 journal 记录；此前获批清理的实验 run 数据不是日志池内容。

## InboxRevamp 后台任务细分

与上表同一近 24 小时窗口；仅统计四个已知任务单元，合计 235,661 条。总分组另有 24 条不属于这四个单元的记录，不算入下表。

| 任务 | 近 24 小时正文 | 总条数 | systemd 生命周期条数 | 应用自身条数 |
|---|---:|---:|---:|---:|
| revamp-apply | 9.61 MiB | 115,812 | 86,859 | 28,953 |
| gmail-process-jobs | 11.31 MiB | 115,400 | 86,550 | 28,850 |
| gmail-watch-renewal | 260.29 KiB | 2,828 | 2,121 | 707 |
| gmail-metrics | 186.07 KiB | 1,621 | 1,049 | 572 |

只读 systemctl 核实：Apply 与 Gmail Worker 均为 enabled/active，OnUnitInactiveUSec=2s，即一轮结束约 2 秒后再触发，不是固定每 2 秒一轮。Watch 为 2 分钟，Metrics 为 5 分钟。未访问任何 cron HTTP 接口。

InboxRevamp 后台任务占整个 journal 近 24 小时条数的 91.3%，占正文的 92.0%。四任务中约 74.9% 的记录是 systemd 生命周期消息，不能据此推断业务报错。建议优先减少高频任务的重复成功/空跑输出、采用汇总日志并保留异常；这是下一步建议，不代表本报告已修改日志级别、调度频率或业务逻辑。

## 共享 journal 池之外的日志

以下是同日后续只读文件元数据采样的物理分配，包含找到的轮转文件；不是近 14 天正文量。容器日志采样来自已验证的七个运行容器固定日志文件前缀，没有读取原始 Docker 配置、环境变量或日志内容。

| 日志来源 | 当前物理占用 | 文件数 |
|---|---:|---:|
| Store Docker | 13.46 MiB | 4 |
| Umami Docker | 968.00 KiB | 2 |
| Telegram forwarder Docker | 1.89 MiB | 3 |
| kern.log | 264.00 KiB | 5 |
| auth.log | 11.81 MiB | 5 |
| syslog | 442.61 MiB | 5 |

另外按已知日志目录的 du 物理分配：

| 项目 / 目录 | 当前物理占用 |
|---|---:|
| Goofish Bot 应用文件日志 | 3.87 MiB |
| X Telegram Push 应用文件目录 | 4.79 MiB |
| Bepusdt 应用文件日志 | 1.32 MiB |
| 宿主机 PostgreSQL 文件日志 | 348.00 KiB |
| pgBackRest 文件日志 | 2.41 MiB |

X Telegram Push 目录包含一个无扩展名文件，本统计包含目录现有内容，不把它自动视为可删除日志。syslog 等可能转存部分 journal 消息，二者容量独立但内容可能重复；不可简单相加正文量来当业务产生日志量。

Docker / 应用自写文件 / syslog 不会自动计入 journal 的 1 GiB。如果要全服务器所有日志合计约 1 GiB，应重新共同分配这些池的预算；仅设置 journald 不能实现这一目标。本报告未实施任何限制、截断、容器重建或清理。
