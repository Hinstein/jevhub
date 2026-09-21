# JevHub V0.1 Content Spec

本文件规定首版 17 个可索引页面具体写什么。2026-09-21 已批准新增 `/playground`；除此之外不要自行扩大页面数量。

## 内容总原则

- 默认英文
- 句子短，面向开发者
- 先回答问题，再解释背景
- 每页都有“Last reviewed”或适当的事实核验信息（尤其 Pricing）
- 易变数据必须来自统一 config
- 不写未经验证的绝对 benchmark
- 页面底部统一独立站声明

---

# 1. Home — `/`

## Search intent

- Jev
- Jev AI
- Jev tools
- Jev examples

## 必须包含

- H1: `Learn, build, and explore Jev.`
- 40–80 字简介
- 4 个主入口：
  - What is Jev?
  - Cost Calculator
  - Templates
  - Ecosystem
- 4 个 featured templates
- 6 个 ecosystem preview
- Store 外链 CTA
- independent disclaimer

## 不要包含

- 长篇新闻流
- 登录按钮
- 用户数/项目数等无法长期维护的夸张数字
- “official Jev hub”之类表述

---

# 2. Playground — `/playground`

## Search intent

- Jev playground
- try Jev
- Jev Choice Noul Score

## 页面结构

1. 简短 Hero：真实 Jev 决策、浏览器不暴露 API Key
2. Single question / Multiple questions 切换
3. 4 个可直接运行的预置案例
4. 左侧 Input：state、question、type、criteria
5. 右侧 Output：typed answer、probabilities、model、token usage
6. 服务端边界说明 + What is Jev / Templates 内链

## Runtime 边界

- 只允许受约束的 `/api/playground`
- 仅服务端读取 `TYPESAFE_API_KEY`
- state <= 8,000 chars
- 1–4 questions
- choice/score 2–10 criteria
- 基础每 IP 限流
- 不保存 state、不收集用户 API Key

---

# 3. What is Jev — `/what-is-jev`

## Search intent

- what is Jev
- Jev AI explained
- how Jev works

## 内容结构

1. 50 字直答
2. Jev 与普通生成式模型的核心差别
3. closed decision 的概念
4. Choice / Score / Noul
5. 适合的任务：
   - classification
   - routing
   - scoring
   - yes/no probability-style decisions
6. 不适合：
   - 长文生成
   - 自由文本回答
   - 没有明确候选空间的开放创作
7. 一个 10 行左右的小例子
8. Next steps → Getting Started / Templates

必须链接 TypeSafe 官方文档。

---

# 4. Pricing — `/pricing`

## Search intent

- Jev pricing
- Jev cost
- Jev API price

## 内容结构

1. 当前计价摘要（从统一 pricing config）
2. 价格单位解释
3. input / output 的当前计费状态
4. 3 个静态算例
5. Cost Calculator CTA
6. “Pricing can change” 提示
7. Official source
8. Last verified date
9. Store 外链 CTA（次要）

禁止在 MDX/JSX 中手写第二份数值。

---

# 5. Getting Started — `/getting-started`

## Search intent

- Jev tutorial
- Jev API example
- Jev TypeScript

## 内容结构

1. Prerequisites
2. `npm install @typesafe-ai/sdk`
3. API key 环境变量
4. 最小 TypeScript 示例
5. state 是什么
6. questions 是什么
7. 解释 Choice
8. 下一步：Score / Noul
9. 常见错误：
   - 把开放生成任务塞给 Jev
   - choice criteria 不清晰
   - 把 model decision 当成执行授权

## 样例

使用官方 SDK Quickstart 同类场景：

`"I was charged twice. Please fix this ASAP."`

目标是判断 ticket category。

示例 API 形状必须在开发时按官方 SDK 当前版本复核，不允许根据本计划硬抄过期代码。

---

# 6. Jev vs ChatGPT — `/jev-vs-chatgpt`

## Search intent

- Jev vs ChatGPT
- Jev vs LLM
- decision model vs generative model

## 页面定位

不是“谁更强”的营销文。

## 比较维度

- output type
- task shape
- open-ended generation
- structured decisions
- routing
- explanation generation
- ideal architecture

核心结论：

`Jev and generative LLMs solve different parts of a workflow and can be combined.`

提供架构：

`input → Jev decision/filter/router → GPT/Claude only when generation is needed`

未经独立验证的性能倍数不要写进主比较表。

---

# 7. Cost Calculator — `/tools/jev-cost-calculator`

## Search intent

- Jev cost calculator
- how much will Jev cost
- Jev API calculator

## UI

左侧/上方输入：

- Avg input tokens/request
- Requests/day OR requests/month

右侧/下方结果：

- Cost/request
- Daily tokens
- Daily cost
- Monthly cost
- Annual cost

## 交互

- 所有计算在浏览器本地完成
- 不发送输入到服务端
- 支持 URL query 初始化可选，但 V0.1 不要求
- 有 Reset
- 有 3 个 preset：small / medium / high volume
- 显示当前 price source 与 last verified

## 测试

- 0 requests
- 0 tokens
- 1 token
- 1M tokens
- very large but safe integer input
- day/month 切换
- rounding consistency

---

# 8. Templates Index — `/templates`

## Search intent

- Jev examples
- Jev templates
- Jev use cases

分 4 类：

- Support
- Sales
- Agents
- Safety & Community

每张卡：

- name
- 1-line description
- primitives used（Choice/Score/Noul）
- difficulty: basic/intermediate
- route

不做 search/filter；8 个模板直接全部展示。

---

# 9. Refund Detection — `/templates/refund-detection`

## 场景

客户同一订单出现两笔已结算扣款，并明确要求退回其中一笔。

## 参考

- official TypeSafe JS SDK duplicate-charge quickstart
- community `support-duplicate-charge`

## JevHub 自己的 state

包括：

- latest_message
- order_id
- settled_charges_count
- previous_refund

## Questions

- Choice: primary request
  - refund
  - access
  - troubleshooting
  - cancel
  - other
- Noul: does evidence support a refund request?

强调：识别请求 ≠ 自动授权退款。

---

# 10. Support Routing — `/templates/support-routing`

## 场景

把客服消息路由到 billing / account / technical / cancellation / other。

## 参考

community customer-support intent criteria。

## Questions

- Choice: support queue
- Score: urgency 0–3（JevHub 原创设计）

## 样例 state

`"My card was charged, but the upgrade never appeared."`

解释为什么 billing 和 access 都可能出现，criteria 必须定义 primary route。

---

# 11. Lead Qualification — `/templates/lead-qualification`

## 场景

SaaS inbound message：

`"We have 35 support agents and need SSO. Can we get a security review and pricing call this week?"`

## 参考

community `sales` pack 的 inbound route。

## Questions

- Choice: inbound type
  - sales
  - partnership
  - support
  - spam
  - unclear
- Noul: qualified sales lead?
- Score: follow-up priority 0–3

## 规则

不要把“看起来像公司”当成购买意图。必须依据 message 内实际需求、规模、采购动作等证据。

---

# 12. Buying Intent — `/templates/buying-intent`

## 场景

判断一段文本是否表现出具体购买意图，而不只是兴趣。

## 参考

community Sales & partnerships 中 “potential customer evaluating a purchase” 的定义。

## Positive example

`"Can you send annual pricing for 20 seats and tell me whether SSO is included?"`

## Negative example

`"Cool product. I might try it someday."`

## Questions

- Noul: concrete buying intent?
- Score: purchase readiness 0–4

---

# 13. Spam Detection — `/templates/spam-detection`

## 场景

处理网站 contact form。

## 参考

- community Sales pack 的 `spam` / `clarify`
- community Social pack 的 `promotion`

## Questions

- Choice: sales / partnership / support / spam / unclear
- Noul: unsolicited generic promotion?

强调 low-confidence 时不要自动丢弃。

---

# 14. Agent Router — `/templates/agent-router`

## 场景

当前节点只能选择有限下游：

`start → research_agent | support_agent | ops_agent`

ops 只允许：

- read_config
- request_change
- clarify

## 参考

community `docs/tool-router.md`

## 核心原则

- closed candidate set
- current-node constraints
- model selection != authorization
- uncertain → clarify

## Questions

- Choice: next allowed node
- Noul: enough information to route safely?

---

# 15. Task Completion — `/templates/task-completion`

## 场景

Agent 说“任务完成”，但我们要看工具证据。

## 参考

community catalog `agent_task_complete`。

## State

- requested_task
- assistant_claim
- tool_events
- final_observed_state

## Questions

- Noul: tool evidence establishes completion?
- Choice: close / retry / debug / human_review

强调 assistant 的自述不能作为唯一完成证据。

---

# 16. Content Moderation — `/templates/content-moderation`

## 场景

社区回复分类。

## 参考

community Social & community pack。

## Choice

- question
- correction
- joke
- promotion
- hostility
- other

再加一个 JevHub 原创：

- Noul: should a human moderator review this?

说明：它是演示性 routing，不是通用安全政策替代品。

---

# 17. Ecosystem — `/ecosystem`

## Search intent

- Jev tools
- Jev GitHub
- Jev SDK
- Jev ecosystem

## 首版条目数量

20–30。

## 首版优先选

1. TypeSafe official SDK/docs
2. 代表性 language SDK
3. 2–4 Playgrounds
4. 3–5 agent/router tools
5. 3–5 integrations
6. 3–5 open-source/research projects

## 选择标准

- 真实公开 URL
- 与 Jev 直接相关
- README 足够说明用途
- 非明显 clone/spam
- 最近可访问
- 描述可以独立核验

awesome-jev 只负责找候选；最终条目必须回到原项目核验。

---

# 全站 CTA

主 CTA：

- Learn → Getting Started
- Calculate → Cost Calculator
- Copy → Templates
- Explore → Ecosystem

商业 CTA：

- `Store ↗` → `/go/store`

不要让商业 CTA 压过内容入口。

# 内链

每个内容页至少包含 2 条相关内链，形成：

Home
→ Learn pages
→ Calculator / Templates
→ Ecosystem
→ Store（次要）

避免孤儿页面。
