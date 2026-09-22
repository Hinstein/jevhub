# JevHub V0.1 Implementation Plan

原则：先搭最小可验证架构，再写内容，再上工具，最后做 SEO/性能审计。禁止边做边加入 V0.2 功能。

2026-09-21 scope amendment：批准公开 Jev Playground。2026-09-23 再批准 Startup Idea Validator。两者都是受限 runtime：服务端密钥、固定边界、基础限流、无用户内容持久化。

## Phase 0 — Bootstrap

创建干净项目：

- Next.js 16
- TypeScript strict
- Tailwind CSS 4
- ESLint
- 必要的 shadcn/ui 组件

建议 Node 版本用当前 Next.js 与依赖共同支持的稳定版本，并在 `.nvmrc` / `engines` 固定。

建立：

- `src/app`
- `src/components`
- `src/content`
- `src/data`
- `src/lib`
- `src/types`
- `tests`

不要安装：

- Supabase
- Prisma/Drizzle
- auth libs
- payment libs
- Jev SDK（V0.1 无 runtime API 调用时可不装）

Gate：

- dev server 起得来
- typecheck
- lint
- production build

---

## Phase 1 — Site shell + SEO foundation

实现：

- root layout
- header
- mobile nav
- footer
- independent disclaimer
- global typography
- site config
- metadata helper
- canonical helper
- sitemap
- robots
- 404
- Store external link component

建议集中：

`src/lib/site.ts`

包含：

- site name
- base URL
- description
- nav
- store target URL

Gate：

- 首页空壳可渲染
- canonical 正确
- `/go/store` 设计为 noindex
- sitemap 基础测试

参考 Directory Starter：

- `app/layout.tsx`
- `app/sitemap.ts`
- `mdx-components.tsx`

独立重写，不复制 Auth/Supabase。

---

## Phase 2 — Five core content pages

按顺序：

1. Home
2. What is Jev
3. Pricing
4. Getting Started
5. Jev vs ChatGPT

实现统一 Article/Layout 组件。

### Pricing config

建立单一数据源：

`src/data/jev-pricing.ts`

字段按 Product Spec。

开发时必须重新核对 TypeSafe 官方价格和官方 source URL，不能只使用聊天记录中的旧价格。

### Getting Started

开发时重新打开官方：

- `typesafe-ai/typesafe-sdk-js/README.md`
- `src/client.ts`
- `src/types.ts`

确认当前 SDK API 后再写代码示例。

Gate：

- 5 页 metadata 唯一
- 页面内链正确
- 官方/社区来源标签清楚
- build

---

## Phase 2.4 — Startup Idea Validator（approved amendment）

实现：

- `/apps/startup-idea-validator`
- `POST /api/idea-validator`
- 输入只允许 idea + goal
- 服务端固定 8 个 Score questions
- 本地加权、0–100 与 KILL/FIX/SHIP
- 无数据库、无登录、无结果详情页
- Analytics 只记录 funnel 元数据，不记录 idea 原文
- WebApplication + Breadcrumb structured data
- 首页第一 CTA 指向 Idea Validator
- 英文 sitemap 增加第 18 页
- locale pages 继续 noindex，并暂不生成 Idea Validator locale route

Gate：

- unit tests：validation / question count / goal variants / weighted score / thresholds
- API Key 不进入 client bundle
- rate limit / timeout / upstream error fail closed
- 375px 可用
- title / description / canonical 唯一
- idea 原文不出现在 analytics payload
- build / typecheck / lint

## Phase 2.5 — Public Jev Playground（approved amendment）

实现：

- `/playground` 宽布局交互页
- Single / Multiple questions
- Choice / Noul / Score 编辑
- 预置可运行案例
- `POST /api/playground` 服务端 TypeSafe 转发
- server-only `TYPESAFE_API_KEY`
- payload validation + timeout + best-effort per-IP rate limit
- 不保存 state、不接收用户 API Key

Gate：

- Playground validation unit tests
- 浏览器 bundle 不包含 TypeSafe API Key
- 429 / 503 / timeout 有可读错误
- mobile 单列布局
- build / typecheck / lint

---

## Phase 3 — Cost Calculator

实现纯前端交互组件，但公式逻辑抽成纯函数：

`src/lib/cost-calculator.ts`

UI：

`src/components/calculator/jev-cost-calculator.tsx`

纯函数至少：

- `costPerRequest`
- `dailyTokens`
- `dailyCost`
- `monthlyCost`
- `annualCost`

要求：

- pricing config 注入，不在组件里写价格
- 输入合法化
- 可读 rounding
- 内部计算尽量保留精度，最后显示再 round

Tests：

- 0
- tiny
- 1M tokens
- monthly mode
- yearly derivation
- invalid/negative input handling

Gate：

- unit 全过
- calculator mobile usable
- 无 network request

---

## Phase 4 — Template system, first 2 examples

先定义类型：

`src/types/template.ts`

内容：

`src/content/templates/*.ts` 或一个 typed data module

路由：

- `/templates`
- `/templates/[slug]`

先只写：

1. refund-detection
2. agent-router

目的是先验证通用模板页面设计，不要一开始填 8 个。

组件：

- TemplateCard
- PrimitiveBadge
- StatePreview
- QuestionPreview
- CodeBlock
- CopyButton
- SourceNote

Gate：

- static params 可构建
- slug unique test
- required fields test
- code copy works
- source notes 显示 official/community/original

---

## Phase 5 — Expand to all 8 Templates

补：

- support-routing
- lead-qualification
- buying-intent
- spam-detection
- task-completion
- content-moderation

严格按 `CONTENT_SPEC.md`。

每个模板必须：

- 有一个明确的 positive example
- 至少在需要时有 negative/ambiguous case
- 有“model decision != business authorization”类边界提示（适用时）
- 不整段复制 Community Playground 文案

Gate：

- 8 slugs exactly
- Templates index 显示 8 个
- 每页 metadata unique
- 每页至少两个内部链接

---

## Phase 6 — Ecosystem

建立：

`src/types/ecosystem.ts`
`src/content/ecosystem.ts`

流程：

1. awesome-jev 找候选
2. 回到候选项目原始 GitHub/官网核验
3. 选择 20–30 个
4. JevHub 自己写 description
5. 记录 source/lastCheckedAt

UI：

- 分类段落或小型 filter tabs（二选一）
- 每项显示 name / description / category / links
- 不显示假 ratings
- 不做 star 实时 API

Gate：

- 条目 20–30
- URL validation
- duplicate URL/name 检查
- 至少 official / SDK / integrations / playground / agent-tooling 五类有内容

---

## Phase 7 — Store redirect + analytics

实现：

`/go/store`

要求：

- 不在 sitemap
- noindex
- 非永久 redirect
- 添加 UTM
- 跳转前/点击时记录 `store_click`

如果使用 analytics provider，V0.1 只收必要事件：

- page_view（provider 默认）
- calculator_used
- template_code_copied
- ecosystem_outbound_clicked
- store_click

不要在 V0.1 建自有 analytics 数据库。

Gate：

- redirect test
- noindex test
- sitemap exclusion test
- UTM test

---

## Phase 8 — SEO / Accessibility / Performance audit

SEO：

- exactly 18 English indexable pages
- unique title/description
- canonical
- sitemap only contains allowed routes
- robots
- OG basics
- no accidental query/tag pages
- no store redirect page in index

Accessibility：

- headings hierarchical
- keyboard nav
- visible focus
- code copy button label
- form labels
- contrast
- external link indication

Performance：

- avoid client components except Calculator/Copy/Analytics
- no large UI libs beyond required shadcn pieces
- optimize fonts/images
- no third-party script bloat

Gate：

- lint
- typecheck
- unit tests
- production build
- route audit
- optional Playwright smoke
- Lighthouse/manual performance review

---

# Git/commit strategy

建议按 Phase 分 commit：

1. `chore: bootstrap JevHub V0.1`
2. `feat: add site shell and SEO foundation`
3. `feat: add core Jev guides`
4. `feat: add Jev cost calculator`
5. `feat: add template framework`
6. `content: add V0.1 Jev templates`
7. `content: add curated Jev ecosystem`
8. `feat: add store referral tracking`
9. `test: complete V0.1 release audit`

不要把所有内容压成一个无法 review 的巨大 commit。

# 上线前停止条件

当 18 个英文页面和验收 Gate 全过：

**STOP.**

不要继续做 V0.2。先部署、提交 Search Console、收集真实数据。
