# JevHub V0.1 Acceptance Criteria

只有以下所有 Must 项通过，才允许标记 `V0.1_COMPLETE`。

## A. Scope Gate

- [ ] 只有 17 个英文页面可索引；`/zh-CN/...` 中文本地化页面可访问但统一 noindex，不进入 sitemap
- [ ] 无数据库
- [ ] 无用户登录
- [ ] 无 Dashboard/Admin
- [ ] 无支付/订单/充值/兑换码逻辑
- [ ] `/playground` 是唯一在线 Jev runtime 页面，浏览器不暴露 API Key
- [ ] 无 API Key 输入/保存
- [ ] 无 Marketplace
- [ ] jevhub.store 只通过外部跳转连接

## B. Route Gate

以下全部可访问：

- [ ] `/`
- [ ] `/playground`
- [ ] `/what-is-jev`
- [ ] `/pricing`
- [ ] `/getting-started`
- [ ] `/jev-vs-chatgpt`
- [ ] `/tools/jev-cost-calculator`
- [ ] `/templates`
- [ ] `/templates/refund-detection`
- [ ] `/templates/support-routing`
- [ ] `/templates/lead-qualification`
- [ ] `/templates/buying-intent`
- [ ] `/templates/spam-detection`
- [ ] `/templates/agent-router`
- [ ] `/templates/task-completion`
- [ ] `/templates/content-moderation`
- [ ] `/ecosystem`

另外：

- [ ] `/go/store` 正确跳转
- [ ] `/go/store` noindex
- [ ] `/go/store` 不在 sitemap

## C. Content Truth Gate

- [ ] Pricing 数值只有一个代码数据源
- [ ] Pricing 显示 official source
- [ ] Pricing 显示 lastVerifiedAt
- [ ] Getting Started SDK 代码在开发时按 TypeSafe 官方 SDK 当前版本核验
- [ ] 社区 Playground 明确标记 Community
- [ ] 没把社区 benchmark 当官方 benchmark
- [ ] 没有无来源的“X times faster/cheaper”绝对宣传
- [ ] 全站有 independent / not affiliated disclaimer

## D. Playground Gate

- [ ] 浏览器不接触 `TYPESAFE_API_KEY`
- [ ] 不提供用户 API Key 输入/保存
- [ ] state 长度有硬上限
- [ ] questions 限制为 1–4
- [ ] Choice/Score criteria 有数量与长度限制
- [ ] 服务端有 timeout 与基础 per-IP rate limit
- [ ] 只允许转发到 TypeSafe System One，不是通用 API proxy
- [ ] API 错误不会向浏览器泄露上游认证信息
- [ ] Playground 在 375px 宽度下可用

## E. Calculator Gate

- [ ] per-request cost 正确
- [ ] daily cost 正确
- [ ] monthly cost 正确
- [ ] annual cost 正确
- [ ] 0 input 正常
- [ ] 大数输入不崩溃
- [ ] negative/invalid input 被阻止或规范化
- [ ] calculator 不发送用户输入到服务端
- [ ] pricing config 改动会自动影响 calculator 结果

## F. Template Gate

- [ ] Exactly 8 templates
- [ ] slug 全部唯一
- [ ] 4 个分类覆盖 Support / Sales / Agents / Safety
- [ ] 每个模板有 state example
- [ ] 每个模板有 question definitions
- [ ] 每个模板有 TypeScript code sample
- [ ] 每个模板有 limits/boundary
- [ ] 每个模板有 source notes
- [ ] Copy Code 可用
- [ ] 没把“model decision”写成“authorized action”

## G. Ecosystem Gate

- [ ] 20–30 个条目
- [ ] 每个条目已回原项目核验
- [ ] description 为 JevHub 自己撰写
- [ ] 记录 lastCheckedAt
- [ ] 无重复 URL
- [ ] 无明显失效链接
- [ ] 无虚假评分/排名
- [ ] 不自动复制 awesome-jev 全库

## H. SEO Gate

- [ ] 17 个页面 title 唯一
- [ ] description 唯一
- [ ] canonical 正确
- [ ] sitemap 只含允许索引的路由
- [ ] robots 正确
- [ ] OG 基础 metadata
- [ ] 每页至少 2 个内部链接（首页除外可特殊处理）
- [ ] 没有空 tag/category/search 参数页被索引
- [ ] external Store link 带外链提示

## I. UX / Accessibility Gate

- [ ] 375px 宽度无横向滚动
- [ ] Header mobile menu 可键盘操作
- [ ] Calculator label 明确
- [ ] Copy 按钮有 accessible name
- [ ] visible focus
- [ ] heading hierarchy 合理
- [ ] code blocks 在手机上可横向滚动而不破布局
- [ ] dark mode 若未完整实现则不在 V0.1 暴露 toggle

## J. Engineering Gate

必须全部通过：

- [ ] `npm run lint`
- [ ] `npm run typecheck`（若单独脚本）
- [ ] unit tests
- [ ] `npm run build`
- [ ] route/SEO tests
- [ ] 无 TypeScript errors
- [ ] 无未使用的 auth/payment/database dependency
- [ ] production build 中只有批准的 `/api/playground` runtime API route

## K. Analytics Gate

至少能看到：

- [ ] page views
- [ ] playground_run
- [ ] calculator_used
- [ ] template_code_copied
- [ ] ecosystem_outbound_clicked
- [ ] store_click

不要求自建后台。

## L. Release Gate

- [ ] Production domain 指向 jevhub.xyz
- [ ] HTTPS 正常
- [ ] sitemap 可访问
- [ ] robots.txt 可访问
- [ ] 404 正常
- [ ] Search Console 可提交
- [ ] Analytics production 数据可见
- [ ] jevhub.store 跳转在 production 验证过

通过后记录：

`MILESTONE_COMPLETE — JevHub V0.1`

然后停止开发新功能，进入数据观察期。
