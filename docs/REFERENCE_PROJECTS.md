# Reference Projects and Reuse Boundaries

本文件记录 JevHub V0.1 允许参考的外部项目、具体参考位置、许可证、可复用内容和禁止事项。

审查时间：2026-09-21。

## 1. gijsverheijke/directorystarter

Repository: https://github.com/gijsverheijke/directorystarter  
Reviewed commit: `93c2f79a4721afdb1a84c6f6fe184dd372b17b10`  
License: MIT

### 为什么参考

它是 Next.js 目录/内容站，和 JevHub 的“静态内容 + 目录”信息结构接近。

### 重点看这些位置

- `app/layout.tsx`
  - 全站 layout/metadata 组织思路
- `app/sitemap.ts`
  - Next.js App Router sitemap 生成方式
- `app/blog/**`
  - MDX 内容路由组织
- `mdx-components.tsx`
  - MDX 元素统一渲染
- `app/listings/**`
  - listing/card/detail 信息层级
- `app/categories/**` / `app/tags/**`
  - 仅参考分类 UI 思路
- `app/page.tsx`
  - 首页如何把目录入口串起来

### V0.1 可以借鉴

- App Router 目录组织
- metadata / canonical / sitemap 的实现方式
- MDX typography
- Directory card 的信息密度
- SSR/static-first 思路

### 不要搬

- `app/auth/**`
- `app/login/**`
- `app/dashboard/**`
- `app/submit/**`
- Supabase
- `schema.sql`
- `supabase/**`
- full-text search 数据库实现
- Magic Link

原因：这些超出 V0.1。

### 执行原则

JevHub 不 fork 该仓库。只参考结构，并用自己的干净 Next.js 工程重写必要部分。

---

## 2. typesafe-ai/typesafe-sdk-js

Repository: https://github.com/typesafe-ai/typesafe-sdk-js  
Reviewed commit: `66880ccded6cb642dc1809620c2b108c33730214`（v0.6.0）  
License: MIT  
Status: **TypeSafe 官方 JavaScript/TypeScript SDK**

### 这是 Jev JS/TS 的事实源

V0.1 文档中的 SDK 安装、类名、调用形状，不要从博客或社区代码猜。

重点：

- `README.md`
- `src/client.ts`
- `src/types.ts`

### 官方 Quickstart 中可参考的最小案例

官方 README 使用了：

- state: `"I was charged twice. Please fix this ASAP."`
- question: ticket category
- choices: billing / technical / other
- `TypeSafeClient`
- `choice()`
- `client.systemOne()`

JevHub 的 Getting Started 页面应使用**同一类最小案例**，但页面说明和上下文由 JevHub 自己写。

### V0.1 使用边界

V0.1 本身不调用 Jev API，因此：

- 可以先不安装 SDK
- 代码示例必须与当前官方 SDK 对齐
- 当未来 V0.2 增加在线运行时，才正式加 SDK 依赖

---

## 3. TypeSafeAI/typesafe-playground

Repository: https://github.com/TypeSafeAI/typesafe-playground  
Reviewed commit: `7a76d6f3f3be903eaa7f5826a8c42c446df8cc13`  
License: MIT  
Status: **社区项目，不是 TypeSafe 官方组织**

必须在内部文档和页面引用中把它写成 Community Playground。

### 核心参考文件

#### `web/catalog.json`

这是 V0.1 Templates 最重要的案例参考源。

可参考的具体案例/结构：

1. `support-duplicate-charge`
   - title: “Charged twice for one order”
   - state 核心：同一个订单出现两笔扣款，用户要求 reverse one
   - 用于 JevHub `refund-detection`

2. Customer-support intent criteria
   - refund
   - access
   - troubleshooting
   - cancel
   - 用于 JevHub `support-routing`

3. `sales` pack — “Sales & partnerships”
   - inbound route 包含 sales / partnership / support / spam / clarify
   - sales 的定义是潜在客户正在评估购买
   - 用于 JevHub `lead-qualification`、`buying-intent`、`spam-detection`

4. Social & community pack
   - question / correction / joke / promotion / hostility / other
   - 用于 JevHub `content-moderation`

5. Agent completion question
   - id: `agent_task_complete`
   - 核心原则：必须看 tool evidence，不能只相信 assistant 自称完成
   - 用于 JevHub `task-completion`

### `docs/tool-router.md`

可参考：

- 每一步只允许从当前节点的有限 outgoing edges 中选择
- policy/authorization 和 model choice 分开
- uncertain 时允许 clarify
- “模型选择某个工具”不等于“授权执行”

用于 JevHub `agent-router`。

### V0.1 不搬

- Playground UI 全套
- 在线 API Key
- Browser Agent
- Clean-room rebuild
- Jev Chat
- LangChain runtime
- Workflow execution
- API proxy
- 大量 benchmark/challenge 功能

JevHub 只把它当成**案例库和设计参考**。

### 内容改写规则

不要整段复制社区案例文案。做法是：

1. 保留场景逻辑
2. 用 JevHub 自己的 state 文案
3. 用自己的问题说明
4. 在 source notes 标明灵感来源为 Community Playground
5. 不把结果写成“官方推荐做法”

---

## 4. hellogumbo/awesome-jev

Repository: https://github.com/hellogumbo/awesome-jev  
Reviewed commit: `75654a2cac94496a230925aa3c90660e161a01a4`  
License: CC0-1.0  
Status: Community directory

### 参考位置

- `README.md`
  - 大规模 Jev 项目分类
- `data/projects.json`
  - 项目发现源
- `data/exclude.json`
  - 了解目录维护者如何排除项目

### V0.1 使用方式

它只是**发现源**，不是我们的数据库。

流程：

1. 从 awesome-jev 找候选
2. 打开候选项目自己的 GitHub/官网
3. 核验它确实与 Jev 有关
4. JevHub 自己写一句描述
5. 记录原始 URL 与 `lastCheckedAt`
6. 只选 20–30 个最有代表性的条目

### 不做

- 不复制它的全部项目
- 不做自动同步
- 不照搬对方描述
- 不复制其排名/排序
- 不把“被 awesome-jev 收录”当作质量背书

---

# 5. 首版 8 个 Template 与来源映射

| JevHub Template | 主要参考 | 处理方式 |
|---|---|---|
| Refund Detection | 官方 SDK duplicate-charge quickstart + community `support-duplicate-charge` | 保留重复扣款场景，重写 state 和问题 |
| Support Routing | community customer-support criteria | 用 refund/access/troubleshooting/cancel/other 做封闭路由 |
| Lead Qualification | community `sales` pack | 原创 Noul/Score，判断是否是值得跟进的销售线索 |
| Buying Intent | community `sales` “potential customer evaluating a purchase” | 原创 Noul，用明确证据判断 purchase intent |
| Spam Detection | community `sales` spam/clarify + social promotion | 原创二级判断：spam probability + message type |
| Agent Router | community `docs/tool-router.md` | 做小型 research/support/ops closed routing example |
| Task Completion | community `agent_task_complete` | 保留“工具证据 > assistant 自述”原则，重写样例 |
| Content Moderation | community Social & community pack | 采用 question/correction/joke/promotion/hostility/other 类别思路 |

# 6. 第三方许可证规则

如果最终真正复制了外部 MIT 项目的非平凡代码：

- 保留其版权/许可证要求
- 在仓库添加 THIRD_PARTY_NOTICES 或对应 attribution
- 记录 copied/adapted file 来源

单纯“看过实现后独立重写”仍应在本文件保留参考记录，方便后续审计。

# 7. 官方与社区的标记规则

页面或源码注释中统一：

- TypeSafe official SDK/docs → `official`
- TypeSafeAI community org/playground → `community`
- awesome-jev → `community`
- JevHub 自己编写 → `original`

任何 UI 都不要把 community badge 写成 official。
