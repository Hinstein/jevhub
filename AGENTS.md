# JevHub Agent Instructions

本文件是 Codex/自动化开发代理执行 JevHub V0.1 时的硬约束。

## 1. 单一目标

只实现 `docs/V0.1_PRODUCT_SPEC.md` 中定义的 JevHub V0.1。不要主动加入“以后可能有用”的功能。

## 2. 硬边界

V0.1 禁止引入：

- Supabase / PostgreSQL / SQLite / ORM
- 用户注册、登录、Session、Auth
- Dashboard / Admin
- 支付、订单、充值、兑换码、余额、账本
- Newsletter 后台
- 点赞、收藏、评论
- 用户提交项目
- Marketplace
- 用户 API Key 收集或保存
- 通用 Jev API Proxy（唯一允许的例外是受限的 `/api/playground`，使用服务端 `TYPESAFE_API_KEY`）
- 在浏览器暴露 TypeSafe API Key
- AI 自动生成内容
- 批量自动生成 SEO 页面

`jevhub.store` 属于另一个项目。JevHub 只允许通过 `/go/store` 跳转过去。

## 3. 参考项目不是基础仓库

不要 fork 或整体复制任何参考仓库。JevHub 应从干净的 Next.js 工程开始。

允许参考：

- Directory Starter：页面/SEO/MDX/目录卡片的组织思路
- 官方 TypeSafe JS SDK：Jev API 的唯一 JS/TS 事实源
- TypeSafeAI 社区 Playground：Jev 模板案例与展示方式
- awesome-jev：生态项目发现源

详见 `docs/REFERENCE_PROJECTS.md`。

## 4. 内容事实规则

- Jev 定价、API、模型能力、SDK 代码必须优先核对 TypeSafe 官方文档/官方 SDK。
- 不得把社区测试、个人 benchmark 写成官方结论。
- 不写“Jev 一定比 GPT 快/便宜 X 倍”之类缺少当前一手来源和时间戳的绝对结论。
- Pricing 页面必须显示“最近核验时间”和官方来源链接。
- Community Playground 的例子可以改写/重新组织，但页面中不得称其为官方示例。
- JevHub 必须有显眼的独立站说明：JevHub is an independent community resource and is not affiliated with or endorsed by TypeSafe AI.

## 5. SEO 规则

- V0.1 只有 17 个可索引英文页面；新增页面是 `/playground`。
- `/go/store` 必须 noindex，且不能出现在 sitemap。
- 每个可索引页面必须有唯一 title、description、canonical。
- 不制造空目录页、标签页、分页页、参数页进入索引。
- 不做 programmatic SEO 批量页面。
- 页面正文优先解决真实查询，不做关键词堆砌。

## 6. UI 规则

- 设计目标：简洁、可信、开发者工具感。
- 不模仿 TypeSafe 官方品牌到让用户误认为 JevHub 是官方站。
- 顶部主入口优先：Playground / What is Jev / Pricing / Templates / Ecosystem。
- “Store” 使用外链图标，并明确为外部购买站。
- 移动端优先，避免横向滚动。
- 代码块必须支持复制。

## 7. 测试规则

至少覆盖：

- unit：cost calculator 公式与边界值
- unit：模板 slug 唯一、必填字段完整
- unit：ecosystem 条目 URL/slug/分类基本校验
- unit：pricing config 格式与 lastVerifiedAt
- route/SEO：17 个可索引路由、canonical、metadata
- Playground：输入边界、问题数量、criteria、服务端密钥与限流
- route/SEO：`/go/store` noindex 且不在 sitemap
- build：production build 成功
- typecheck：通过
- lint：通过

如引入 Playwright，至少检查首页、Calculator、Template detail、Ecosystem 和移动端导航。

## 8. 开发顺序

严格按 `docs/IMPLEMENTATION_PLAN.md` 的 Phase 顺序开发。每一 Phase 先通过对应测试再进入下一 Phase。

## 9. 禁止提前做 V0.2

2026-09-21 已明确批准 `/zh-CN` 本地化和公开 Jev Playground；这两项不再属于 V0.2 禁止项。

除非用户明确批准，不得新增：

- 用户系统
- Submit project
- Featured listing
- Newsletter
- DecisionOps
- Marketplace
- Template 用户上传
- 任何 Store 内部业务

V0.1 上线并取得真实数据后再决定。
