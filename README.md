# JevHub

JevHub 是一个独立的 Jev 学习、工具、模板与生态入口站，目标域名为 **jevhub.xyz**。

> 重要边界：JevHub 与购买/充值站 **jevhub.store** 是两个独立项目。JevHub 不承载支付、订单、兑换码、余额、账本、用户购买后台等交易逻辑，只保留一个可追踪的外部跳转入口。

## V0.1 目标

V0.1 只做一个轻量、可快速上线、SEO 友好的内容/工具站：

- 16 个可索引页面
- 5 个基础学习/SEO 页面
- 1 个 Jev Cost Calculator
- 1 个 Templates 索引页 + 8 个模板详情页
- 1 个精选 Ecosystem 页面
- 1 个指向 jevhub.store 的非索引跳转入口
- 无数据库、无登录、无后台、无支付、无 Marketplace、无 Jev 在线 Playground

## 文档

开发前必须按顺序阅读：

1. [V0.1 产品范围](docs/V0.1_PRODUCT_SPEC.md)
2. [参考项目与复用边界](docs/REFERENCE_PROJECTS.md)
3. [首版内容规格](docs/CONTENT_SPEC.md)
4. [开发执行顺序](docs/IMPLEMENTATION_PLAN.md)
5. [验收标准](docs/ACCEPTANCE_CRITERIA.md)
6. [Codex / Agent 开发规则](AGENTS.md)

## V0.1 技术原则

- Next.js 16 + TypeScript
- Tailwind CSS 4
- shadcn/ui（只用必要组件）
- 内容和静态数据优先，不引入数据库
- 页面尽量服务端渲染/静态生成
- SEO 信息集中管理
- Jev 价格等易变事实必须单一数据源，并记录来源与最近核验时间
- 任何 Jev 能力描述、价格、SDK 用法都优先引用 TypeSafe 官方来源
- 社区项目只作为示例/灵感来源，必须标记为社区项目，不得写成官方能力

## V0.1 完成定义

只有在 [docs/ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md) 中全部 Gate 通过后，V0.1 才算完成。完成后停止扩功能，先上线并观察 Search Console、Analytics 和 Store 跳转数据，再决定 V0.2。
