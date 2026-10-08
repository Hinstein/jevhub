# 单机多业务日志管理选型 — 2026-10-08

状态：调研归档。本文记录选择方案时的只读核验，不是当前实施状态。
2026-10-08 用户批准本地业务隔离、不加网页入口后，分阶段落地情况见
[本地日志实施记录](PRODUCTION_LOG_LOCAL_SETUP.md)；容器和部分原生文件日志仍待确认。

## 结论

推荐先使用服务器已有的 **systemd-journald 按业务 namespace 隔离 + logrotate 管已有文件日志 + Docker 自带容量轮转**。这是现成组件的配置，不开发新的日志数据库、网页后台或删除脚本。

如果用户明确需要统一网页检索、跨主机查询和告警，现成完整方案是 **Grafana Alloy + Grafana Loki + Grafana**，或者 **Alloy + Grafana Cloud Logs**。这些方案解决集中查询，但不能取代源头容量控制。托管方案会向第三方发送日志，须先获得授权、限定数据范围并配置凭据，不能默认启用。

本次 research 技能要求的后台调研未能完成；主代理继续直接核验一手资料，以下不使用未交付的子代理结论。

## 需求与服务器现状

- 一台 Ubuntu 24.04 主机同时运行多项目，既有 systemd Web/后台任务，也有 Docker 与原生文件日志。
- 用户要求按业务归档，避免一个高频任务挤掉其他业务的记录；最长 14 天，日常诊断日志总磁盘预算约 1 GiB。
- 实机 systemd 255.4，具备 LogNamespace；目前 JevHub/InboxRevamp 未设置 namespace，也未发现活动的命名 journald 实例。
- 实机总 RAM 3,904,786,432 B（约 3.64 GiB）；本次只读采样 available 约 1.98 GiB，另有已使用 swap。不能据此承诺大型日志栈不影响后续构建。
- 主 journald 的 MemoryCurrent 约 68.75 MiB，是 cgroup 统计而非纯进程 RSS，也不能直接乘以业务数估计新增成本。
- 现有日志量见 [逐项目统计](PRODUCTION_LOG_USAGE_20261008.md)。其中 journal 近一天 91.3% 的记录属于 InboxRevamp 后台任务；四类任务约 74.9% 是 systemd 生命周期消息，不是业务报错。

上面的主机指标来自 SSH 只读命令；资源选型判断为工程推断，不是软件厂商最低配置或压测结论。

## 单机可用的两种架构

1. **就地管理**：应用输出到 stdout/stderr 或必要的独立文件；宿主机日志服务按业务隔离数据，独立轮转与过期。适合本机排错和小型多项目服务器。
2. **集中管理**：采集器读取 systemd、容器和文件日志，附加固定 project/service/environment 标签，发送到日志后端，再通过查询界面检索。适合统一检索和多主机；源日志、本地缓存、后端存储仍须分别限额。

这两种是由官方支持功能组合出的可选架构，不声称存在唯一业界标准。应用运行身份/配置映射确定业务标签，不从用户输入、邮箱或 URL 参数生成项目名。项目标签不等于存储配额；查询隔离也不等于磁盘隔离。

## 现成组件比较

| 方案 | 按业务组织 | 自动保留 / 容量管理 | 主要边界 | 当前建议 |
|---|---|---|---|---|
| journald namespace | 同业务多个 systemd 服务进入独立日志存储 | 每个 namespace 独立配置容量、最长保留期、文件大小和轮转 | 多实例有额外资源开销；只接管应用日志，不能自动搬走 PID 1 管理日志或所有 Docker/自写文件 | 本机业务日志首选 |
| rsyslog + logrotate | 按固定规则输出项目文件 | logrotate 负责按时间/大小轮转、压缩、数量和 maxage | 非实时硬配额；需确认应用 reopen；转存 journal 可能重复占用 | 保留已有原生文件日志时使用 |
| Docker local 或有界 json-file | 每容器独立日志 | 按文件大小/数量轮转；local 默认压缩 | 不提供 14 天 TTL；多容器配额相加才是业务预算；改现存容器需要重建 | 发布时逐容器实施，不能当作完整天数保留方案 |
| Alloy + Loki + Grafana | 业务标签、查询；需要权限隔离时使用 tenant 与认证 | Loki Compactor 可按 tenant/stream 保留天数 | 本地 filesystem 后端不按剩余空间清旧数据，也不提供这里所需的业务保留字节硬上限 | 有明确统一查询需求再自建 |
| Alloy + Grafana Cloud Logs | 云端按业务标签检索 | 云端管理存储与保留；本机仍要限额 | 第三方数据发送、账号、套餐与共享摄入配额 | 需要界面又不想维护后端时优先考虑 |
| Vector | 可采集 journald、Docker，做路由和处理 | 为后端提供采集管道 | 不是完整日志数据库/查询网页；不会替所有源自动过期 | 已采用 Vector 时复用，不为容量治理单独安装 |
| Dozzle | 以 Docker 容器/分组展示实时日志 | 依赖 Docker 已保留的输出 | 不是 journal 全业务归档服务；不能靠它实现业务容量与 14 天期限 | 仅容器查看器，不解决本次主要问题 |

### 1. journald：本机现有日志服务可以按业务隔离

systemd 官方明确支持一个项目的多个服务共享独立 namespace；数据存储和接口与其他 namespace 分开。服务设置 LogNamespace，namespace 配置位于 journald@NAME.conf 或同名 drop-in，查询使用 journalctl --namespace=NAME。因此可以给 JevHub、InboxRevamp Web、InboxRevamp 后台任务、Store 前端等分别分配预算，而不是各自取走 1 GiB。来源：[Ubuntu 24.04 journald 手册](https://manpages.ubuntu.com/manpages/noble/man8/systemd-journald.service.8.html)。

每个实例可设置 SystemMaxUse、SystemMaxFileSize、MaxFileSec、MaxRetentionSec；需要细小的文件轮转粒度和总预算预留。限制通过归档文件淘汰实现，活跃文件可能让实际容量短时超过目标；14 天不是保证至少保留 14 天。来源：[systemd 255 journald 配置](https://github.com/systemd/systemd/blob/v255/man/journald.conf.xml)。

**重要反例：不能只加 namespace 就宣布高频问题已解决。** systemd 255 源码明确 PID 1 只写默认 journal；Started/Finished 等管理日志不会跟应用 stdout 一起迁移。它们仍可能在默认池中挤掉其他系统日志。来源：[journald-context.c，client_context_acquire_default](https://github.com/systemd/systemd/blob/v255/src/journal/journald-context.c)。

LogLevelMax 可过滤应用与 PID 1 关于该单元的日志，但不能简单把所有任务设为 warning：默认 stdout/stderr 级别为 info，未带规范优先级的错误也可能一起丢失。实施前应检查真实错误日志级别和任务失败仍可观测，再选择减少正常生命周期信息/成功输出的配置或应用现有 logger 配置；不更改 Gmail 执行频率、OAuth 状态或业务结果。来源：[systemd 255 执行环境，LogLevelMax / SyslogLevel](https://github.com/systemd/systemd/blob/v255/man/systemd.exec.xml)。

监控和人工排错也要读到新 namespace，不能仅保留 journalctl -u 的默认查法；迁移不自动重新归档已有旧日志。不要为统一配置把 Docker daemon 放进某业务 namespace，因为这可能把所有容器日志一起归入该业务。

### 2. 文件和容器：使用自带轮转，不写删除程序

logrotate 的 maxsize、rotate、compress、maxage 是现成能力。阈值在运行时检查，maxage 也只在该日志要轮转时检查；静止的归档不能因此获得精准 TTL 保证。copytruncate 有丢记录窗口，不默认用于支付/审计日志。来源：[logrotate 官方手册](https://github.com/logrotate/logrotate/blob/main/logrotate.8.in)。

rsyslog omfile 支持固定或动态输出路径，适合规则化分流；动态路径必须转义不可信片段。仅在已有 journal 之外又完整转存项目文件，会形成双份存储，不作为默认推荐。来源：[rsyslog omfile](https://docs.rsyslog.com/doc/configuration/modules/omfile.html)、[rsyslog dynaFile](https://docs.rsyslog.com/doc/reference/parameters/omfile-dynafile.html)。

Docker 官方建议一般非 Kubernetes 场景使用 local 驱动，具备默认轮转、压缩和 max-size/max-file 设置。保留现有 json-file 并补限额也可作为兼容优先的迁移方式。这两类没有按天过期选项，不能声称配置后全部容器已实现 14 天。来源：[Docker logging 配置](https://docs.docker.com/engine/logging/configure/)、[local 驱动](https://docs.docker.com/engine/logging/drivers/local/)。

Docker logging 变更不作用于现有容器，必须重建对应容器；不能为日志治理重启 Docker 或擅自重建数据库/Redis/支付/消息服务。标准 Docker journald 驱动提供容器标签，但没有所需的 per-business namespace 选项，因此换驱动不是自动获得业务独立池。来源：[Docker logging 配置](https://docs.docker.com/engine/logging/configure/)、[journald 驱动](https://docs.docker.com/engine/logging/drivers/journald/)。

若需要把容器也纳入 namespace 的天数保留，Docker syslog 支持指定 Unix socket，这提供了一个可验证的接入方向；但直接指向 namespace socket 的端到端兼容性、重启后的 socket 可达性仍需非业务 canary 验证。远程驱动的默认 dual logging 缓存还会另占本机空间，必须计入预算。没有验证前不将此方向写成已可部署方案。来源：[syslog 驱动](https://docs.docker.com/engine/logging/drivers/syslog/)、[Docker dual logging](https://docs.docker.com/engine/logging/dual-logging/)。

### 3. 完整集中日志服务：Alloy + Loki + Grafana

Alloy 的现成组件可分别读取 journal、Docker API、明确批准的文件，附加业务标签后发送。没有必要在每个项目中写一个日志采集客户端。来源：[loki.source.journal](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.journal/)、[loki.source.docker](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.docker/)、[loki.source.file](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.file/)。

Loki Compactor 支持 tenant/stream 级别的期限，需显式开启；默认不自动过期。删除异步运行，有配置的延迟，不能承诺到 14 天那一秒物理文件立即消失。来源：[Loki retention](https://grafana.com/docs/loki/latest/operations/storage/retention/)。

Loki filesystem 文档明确不按磁盘使用量或剩余空间自动删除 chunks；摄入速率限制、业务标签或 tenant 子目录不能替代按业务容量回收。要获得 1 GiB 总预算仍需外部存储策略、额外限制或不同后端，不能为解决日志挤占再偷偷写个删 chunk 脚本。来源：[Loki filesystem storage](https://grafana.com/docs/loki/latest/operations/storage/filesystem/)。

小流量可部署 monolithic 单二进制 Loki，不必建立集群；但自建方案仍要运行采集器、Loki 与网页查询层，管理数据、缓存和运维安全。对本机 3.64 GiB 多业务主机是否合适需压测，这里不引用大规模集群 sizing 当小实例最低内存，也不承诺固定额外 RAM。来源：[Loki deployment modes](https://grafana.com/docs/loki/latest/get-started/deployment-modes/)。

如需要真正的访问隔离，业务 label 不等于认证边界；需 tenant 与入口认证设计，不能开放未认证日志接口。来源：[Loki tenant isolation](https://grafana.com/docs/loki/latest/operations/multi-tenancy/)。新部署使用 Alloy，旧教程的 Promtail 已于 2026-03-02 EOL。来源：[Promtail 官方状态](https://grafana.com/docs/loki/latest/send-data/promtail/)。

### 4. 托管服务与查看器

Grafana Cloud 官方定价页在本次核验时列出 Free Logs 每月 50 GB 摄入与 14 天保留。它是共享云端额度，不是各项目 50 GB，也不是本机日志总量自动变为 1 GiB。必须按 account/region 实际可用项确认，选择免费方案前核查限流/丢弃、日志筛选和网络可达性；不把现有 journal 正文量直接当云端计费量。来源：[Grafana Cloud pricing](https://grafana.com/pricing/)。

Vector 的 journald 与 Docker source 是采集能力，不提供完整查询/归档服务；新增采集器仍需选择 sink 与存储。来源：[Vector journald](https://vector.dev/docs/reference/configuration/sources/journald/)、[Vector Docker logs](https://vector.dev/docs/reference/configuration/sources/docker_logs/)。

Dozzle 自我定位是容器日志查看器，能提供实时流与分组；对容器自写文件官方建议更改输出或 sidecar tail。给每个原生项目再加 tail 容器可能产生第二份日志，不能用它替代 journal 归档。来源：[What is Dozzle](https://dozzle.dev/guide/what-is-dozzle)、[Dozzle 文件日志边界](https://dozzle.dev/guide/log-files-on-disk)。

## 推荐落地边界

1. 将旧的“所有项目共享 1 GiB journal”草案改为“按业务独立预算”，并把系统/PID 1、容器缓存、已有文件日志一起纳入清单。不能一边分业务、一边给默认池再额外 1 GiB。
2. 一个业务可有 Web/后台任务两个池，防止同业务高频任务挤掉 Web 错误；不为每个 timer 建一个独立实例。
3. 容量与最长期限独立配置。必须接受小池写满时保留不足 14 天；如要求完整 14 天，则需要保证更少写入或更大的存储预算。
4. 只配置成熟组件；迁移、错误分级、PID 1 降噪和实际日志投递是验证工作，不开发日志产品。命名 namespace 不能解决全部管理日志洪水，因此该验证是实施前门禁。
5. 容器的天数 TTL 尚未完全解决。先由用户确认是否容量优先、容器不要求天数过期；若严格所有日志 14 天，先验证统一接入或选择集中/托管后端，不悄悄放宽要求。
6. 本轮只研究并保存方案，不修改服务器、安装依赖、调整日志级别、转存业务日志、创建外部账号或删除既有记录。下一步先决定“本地轻量管理”还是“统一网页集中查询”，再分阶段实施。
