import type { Locale } from "@/i18n/config";
import type { EcosystemCategory, EcosystemItem } from "@/types/ecosystem";
import type {
  JevTemplate,
  TemplateQuestion,
} from "@/types/template";

type QuestionTranslation = {
  instruction: string;
  criteria?: TemplateQuestion["criteria"];
};

type TemplateTranslation = {
  title: string;
  description: string;
  useCases: string[];
  questions: Record<string, QuestionTranslation>;
  expectedOutput: string;
  whyItWorks: string[];
  limits: string[];
};

const zhTemplates: Record<string, TemplateTranslation> = {
  "refund-detection": {
    title: "退款请求识别",
    description:
      "识别客户是不是在请求退款，同时不把分类结果当成退款授权。",
    useCases: ["客服分流", "账单队列", "退款审核入口"],
    questions: {
      primary_request: {
        instruction: "客户的主要请求是什么？",
        criteria: {
          refund: "要求退款或撤销扣款",
          access: "账户或登录帮助",
          troubleshooting: "产品行为异常或故障排查",
          cancel: "取消订阅",
          other: "以上都不是",
        },
      },
      refund_request_supported: {
        instruction:
          "提供的消息和订单状态是否支持“客户正在请求退款或撤销扣款”这一判断？",
      },
    },
    expectedOutput: "一个 primary_request 分类结果，以及“客户确实在请求退款”的概率。",
    whyItWorks: [
      "可选类别提前定义好，每个结果都能直接用于后续分流。",
      "state 里把客户原话和订单事实分开，减少混淆。",
      "额外的 Noul 问题给出概率，不会把分类结果直接变成退款动作。",
    ],
    limits: [
      "识别退款请求不等于授权退款。",
      "是否真的能退款，仍要由明确的退款规则和支付记录决定。",
    ],
  },
  "support-routing": {
    title: "客服路由",
    description: "将收到的客服消息路由到一个主要队列，并评估需要多快处理。",
    useCases: ["工单路由", "队列优先级", "客服自动化"],
    questions: {
      queue: {
        instruction: "为这个案例选择主要客服队列。",
        criteria: {
          billing: "支付、发票或扣款问题",
          account: "账户、访问权限或权益问题",
          technical: "产品行为或技术故障",
          cancellation: "取消订阅",
          other: "无法明确判断主要类别",
        },
      },
      urgency: {
        instruction: "把处理紧急度评为 0 到 3。",
        criteria: [
          "0 — 常规，没有时间敏感影响",
          "1 — 影响较小",
          "2 — 正在影响客户",
          "3 — 严重或必须立即处理的客户影响",
        ],
      },
    },
    expectedOutput: "一个主要队列，以及紧急度评分。",
    whyItWorks: [
      "主要路由指令能处理一个案例可能同时符合多个队列的情况。",
      "紧急度等级提前定义好，不让模型自己发明评分标准。",
    ],
    limits: [
      "路由不应静默丢弃次要问题。",
      "紧急度只用于排队和分流，不等于 SLA 承诺。",
    ],
  },
  "lead-qualification": {
    title: "销售线索筛选",
    description: "把潜在销售机会与合作、客服、Spam 和目的不明的消息区分开。",
    useCases: ["销售线索", "CRM 分流", "销售提醒"],
    questions: {
      inbound_type: {
        instruction: "判断这条收到的消息应该进入哪一类。",
        criteria: {
          sales: "正在评估购买的潜在客户",
          partnership: "提出业务合作",
          support: "现有客户寻求帮助",
          spam: "群发广告或无关推广",
          unclear: "目的不明确",
        },
      },
      qualified: {
        instruction: "消息中是否有具体证据表明这是值得人工跟进的销售机会？",
      },
      priority: {
        instruction: "将跟进优先级评为 0 到 3。",
        criteria: [
          "0 — 不需要销售跟进",
          "1 — 兴趣较弱或仍处于早期",
          "2 — 有明确需求或正在评估",
          "3 — 有明确需求，并且正在推进近期采购",
        ],
      },
    },
    expectedOutput: "一个消息分类结果、值得销售跟进的概率，以及跟进优先级。",
    whyItWorks: [
      "先把销售机会和联系表单里的其他消息分开。",
      "是否值得销售跟进，要看消息里的实际信息，而不是只看对方像不像一家公司。",
      "把“值不值得跟进”和“优先级多高”分开，团队可以分别设置阈值。",
    ],
    limits: [
      "除非 state 里有明确信息，否则不要推断预算、决策权或公司规模。",
      "高分也不应绕过正常的用户同意和联系规则，自动触达某个人。",
    ],
  },
  "buying-intent": {
    title: "购买意向",
    description: "区分具体的购买行为与随口兴趣、赞美或模糊的未来意向。",
    useCases: ["意向评分", "产品驱动销售", "对话分流"],
    questions: {
      buying_intent: {
        instruction: "这条消息是否表现出具体的评估或购买意向，而不只是泛泛兴趣？",
      },
      readiness: {
        instruction: "把购买阶段评为 0 到 4。",
        criteria: [
          "0 — 没有购买信号",
          "1 — 随口表达兴趣",
          "2 — 正在主动评估",
          "3 — 询问具体购买约束",
          "4 — 询问近期商务下一步",
        ],
      },
    },
    expectedOutput: "一个购买意向概率，以及购买阶段评分。",
    whyItWorks: [
      "问题明确区分了具体评估与模糊兴趣。",
      "评分等级提前定义好，业务代码可以自己决定触发阈值。",
    ],
    limits: [
      "意向不等于身份、预算或决策权。",
      "把 CRM 中已知信息明确放进 state，不要让模型补猜缺失信息。",
    ],
  },
  "spam-detection": {
    title: "Spam 识别",
    description: "识别联系表单里的群发广告或无关推广，同时保留 unclear 选项。",
    useCases: ["联系表单", "收件箱分流", "社区入口"],
    questions: {
      message_type: {
        instruction: "判断这条收到的消息应该进入哪一类。",
        criteria: {
          sales: "正在评估我们产品的潜在客户",
          partnership: "具体的合作提议",
          support: "现有客户寻求帮助",
          spam: "群发广告或无关推广",
          unclear: "目的不明确",
        },
      },
      unsolicited_promotion: {
        instruction: "这条消息主要是群发广告或无关推广，而不是正常业务请求吗？",
      },
    },
    expectedOutput: "一个消息分类结果，以及 Spam 概率。",
    whyItWorks: [
      "保留 unclear 选项，可以避免把模糊消息强行判成 Spam。",
      "单独的概率让应用可以自行选择保守阈值。",
    ],
    limits: [
      "不要自动删除低置信度消息。",
      "这里只判断消息意图，不是完整的反滥用系统。",
    ],
  },
  "agent-router": {
    title: "Agent 路由",
    description: "从预先定义的流程中选择下一个 Agent 或 tool；选择结果不等于执行授权。",
    useCases: ["多 Agent 系统", "Tool 路由", "工作流分支"],
    questions: {
      next_node: {
        instruction: "只能从允许的下一个节点中选择。",
        criteria: {
          research_agent: "研究外部或背景信息",
          support_agent: "处理用户支持请求",
          ops_agent: "检查或提出运营配置变更",
          clarify: "信息不足，无法安全路由",
        },
      },
      enough_information: {
        instruction: "根据当前请求和 workflow 状态，信息是否足够选择下一个节点？",
      },
    },
    expectedOutput: "下一个节点，以及当前信息是否足够支持这个选择的概率。",
    whyItWorks: [
      "可选节点由程序提前提供，不让模型自己发明新的去向。",
      "真正的权限检查和执行仍然由应用负责。",
      "`clarify` 是正常选项，不是异常情况。",
    ],
    limits: [
      "路由到具体 tool 后，仍然要做明确的权限检查。",
      "绝不允许模型输出图中不存在的工具名称。",
    ],
  },
  "task-completion": {
    title: "任务完成检查",
    description: "根据 tool 结果和最终状态，判断 Agent 是否真的完成了任务。",
    useCases: ["Agent 质量检查", "stop hook", "工作流检查"],
    questions: {
      task_complete: {
        instruction:
          "tool 结果和最终状态是否证明任务确实完成？Agent 自己说“已完成”不能单独作为证据。",
      },
      review_route: {
        instruction: "选择下一步审核路由。",
        criteria: {
          close: "证据证明任务已完成",
          retry: "任务未完成，但可以安全重试",
          debug: "执行失败，或证据与完成声明矛盾",
          human_review: "证据或授权边界需要人工处理",
        },
      },
    },
    expectedOutput: "任务完成的概率，以及下一步应该 close、retry、debug 还是人工审核。",
    whyItWorks: [
      "state 里把 Agent 的声明和独立证据分开。",
      "判断时优先看 tool 结果和最终状态，而不是 Agent 自己的完成声明。",
      "下一步只有几个固定选项，业务代码可以直接处理。",
    ],
    limits: [
      "校验器只能判断你实际提供的证据。",
      "对高风险操作，还要配合明确的完成条件（post-condition）检查。",
    ],
  },
  "content-moderation": {
    title: "内容审核",
    description: "判断回复属于哪种类型，并单独判断是否需要人工审核。",
    useCases: ["社区路由", "评论分流", "人工审核队列"],
    questions: {
      reply_type: {
        instruction: "这条回复主要属于哪一类？",
        criteria: {
          question: "真实的信息请求",
          correction: "相关的事实纠正",
          joke: "幽默或玩笑式讽刺",
          promotion: "未经请求的推广或垃圾信息",
          hostility: "意图挑衅的人身攻击",
          other: "以上都不是",
        },
      },
      human_review: {
        instruction: "根据社区审核流程，这条回复是否应该由人工审核？",
      },
    },
    expectedOutput: "一个回复类型，以及需要人工审核的概率。",
    whyItWorks: [
      "内容类型和是否需要人工审核，是两个独立判断。",
      "类别集合将事实纠正与敌意表达区分开。",
    ],
    limits: [
      "实际审核政策必须定义删除、警告或升级的条件。",
      "这个示例不是通用安全政策，也不是法律合规系统。",
    ],
  },
};

const zhEcosystemDescriptions: Record<string, string> = {
  "TypeSafe JavaScript SDK":
    "官方 TypeScript/JavaScript 客户端，支持 System One 请求、Choice / Score / Noul builder 和类型推断。",
  "TypeSafe Python SDK":
    "TypeSafe System One API 的官方 Python 客户端，适合在 Python 服务或 data pipeline 中调用 Jev。",
  "System One Adapter (Python)":
    "官方 adapter，提供兼容 TypeSafeClient 的接口，用于把 System One 与 chat model workflow 做对比。",
  "TypeSafe Agent Skills":
    "官方 Agent Skills，介绍如何在 Codex、Claude Code 等 coding Agent 中使用 System One、Choice / Score / Noul 和评估模式。",
  advocaat: "一个轻量社区客户端，用类型友好的 API 封装 TypeSafe/Jev 调用。",
  "typesafe-ai (Rust)":
    "社区 Rust 客户端，提供 System One 的结构化请求和响应处理。",
  "typesafe-sdk-go":
    "面向 Go 服务的社区 SDK，支持 Choice / Score / Noul 问题和带概率的 System One 结果。",
  "typesafe-sdk-swift":
    "社区 Swift SDK，方便 Apple 平台应用直接调用 System One。",
  "Vercel Eve":
    "Vercel 的开放 Agent 框架，实验性评估流程可以把 Jev 作为决策或 evaluator。",
  "Vercel AI CLI": "Vercel Labs 的终端工具，其评估流程可以使用 Jev 作为评估器。",
  "zod-jev": "把本地 Zod schema 校验和 Jev 的语义判断组合起来，分别处理结构和含义。",
  "zio-typesafe-ai": "Scala 3 / ZIO 的 System One API 集成，支持一次提交多个 Choice / Score / Noul 问题。",
  "TypeSafeAI Community Playground":
    "大型社区 Playground，收录 Jev 工作流、路由、Browser Agent 和 evaluation 示例。",
  "Jev Playground": "社区 Playground，可直接尝试 Choice、Score、Noul 并查看返回结果。",
  "Awesome Jev":
    "社区维护的 Jev 项目目录；JevHub 只将其作为发现源，然后回到原项目进行核验。",
  "Jev Ultrafast":
    "Browser Use 实验：让 Jev 从允许的浏览器动作中选择下一步，文本生成仍交给其他模型。",
  Foreman: "用于 coding Agent 的监督工具，借助 Jev 判断是否跑偏、卡住或可以结束任务。",
  "jev-review": "社区代码审查 workflow 和本地 dashboard，使用 Jev 做代码审查判断。",
  "jev-mcp": "把 Jev 的判断能力提供给 coding Agent 和其他 MCP client 的 MCP 服务。",
  jevwire: "面向 Agent 的决策层，提供 MCP 接口、可嵌入库和人工升级处理。",
  "Agent Chaperone":
    "检查 Agent 的 tool calls 和结果，展示语义判断如何和明确的程序规则配合。",
  Canny: "开源的 Agent 任务完成检查工具，强调先看证据，再接受“任务已完成”的声明。",
  "jev-router":
    "开源 LLM Router，在 LiteLLM 之上使用 Jev 从预先定义的模型列表中选择模型。",
  SemIf: "探索 Jev 风格语义 if 语句的独立研究项目，使用开放模型验证该模式。",
};

export const ZH_PAGE_METADATA: Record<
  string,
  { title: string; description: string }
> = {
  "/": {
    title: "JevHub：学习、构建并探索 Jev",
    description:
      "独立的 Jev 中文指南、成本工具、决策模板和生态目录，帮助开发者理解并使用 TypeSafe AI 的 Jev 决策模型。",
  },
  "/what-is-jev": {
    title: "什么是 Jev？TypeSafe AI System One 介绍",
    description:
      "了解 Jev 如何根据 state 和 Choice、Score、Noul 问题返回固定格式的结果与概率，以及它适合什么场景。",
  },
  "/pricing": {
    title: "Jev 定价：输入 token 与成本计算器",
    description:
      "查看 Jev 当前输入 token 价格、输出计量方式和官方来源，并估算你的使用成本。",
  },
  "/getting-started": {
    title: "Jev JavaScript SDK 快速入门",
    description:
      "安装官方 TypeSafe JavaScript SDK，设置 API key，并发送第一个 Choice、Score 或 Noul 请求。",
  },
  "/jev-vs-chatgpt": {
    title: "Jev 与 ChatGPT：何时使用哪一个",
    description:
      "比较 Jev 和 ChatGPT 分别适合什么任务，以及如何在同一个 workflow 中组合使用。",
  },
  "/tools/jev-cost-calculator": {
    title: "Jev 成本计算器：估算 token 成本",
    description:
      "根据平均输入 token 数、请求量和当前官方价格，估算每次、每天、每月和每年的 Jev 成本。",
  },
  "/templates": {
    title: "Jev 决策模板：Choice、Score 与 Noul",
    description:
      "浏览客服、销售、Agent、审核等 8 个 Jev 模板，包含 TypeScript 示例、注意事项和来源。",
  },
  "/ecosystem": {
    title: "Jev 生态目录：SDK、集成与工具",
    description:
      "浏览经过人工核验的 Jev 生态目录，包括官方 SDK、社区客户端、集成、Agent 工具、Playground 和研究项目。",
  },
};

export const ZH_CATEGORY_LABELS = {
  support: "客服",
  sales: "销售",
  agents: "Agent",
  safety: "安全与社区",
} as const;

export const ZH_DIFFICULTY_LABELS = {
  basic: "基础",
  intermediate: "进阶",
} as const;

export const ZH_PRIMITIVE_LABELS = {
  choice: "Choice",
  score: "Score",
  noul: "Noul",
} as const;

export const ZH_SOURCE_KIND_LABELS = {
  official: "官方",
  community: "社区",
  original: "原创",
} as const;

export const ZH_ECOSYSTEM_CATEGORY_LABELS: Record<EcosystemCategory, string> = {
  Official: "官方",
  SDKs: "SDK",
  Integrations: "集成",
  Playgrounds: "Playground",
  "Agent / Tooling": "Agent / Tooling",
  "Open Source / Research": "开源 / 研究",
};

export function localizedTemplate(
  template: JevTemplate,
  locale: Locale,
): JevTemplate {
  if (locale === "en") return template;
  const translation = zhTemplates[template.slug];
  if (!translation) return template;

  return {
    ...template,
    title: translation.title,
    description: translation.description,
    useCases: translation.useCases,
    expectedOutput: translation.expectedOutput,
    whyItWorks: translation.whyItWorks,
    limits: translation.limits,
    questions: template.questions.map((question) => ({
      ...question,
      ...translation.questions[question.id],
    })),
  };
}

export function localizedEcosystemItem(
  item: EcosystemItem,
  locale: Locale,
): EcosystemItem {
  if (locale === "en") return item;
  return {
    ...item,
    description: zhEcosystemDescriptions[item.name] ?? item.description,
  };
}

export function localizedEcosystemCategory(
  category: EcosystemCategory,
  locale: Locale,
): string {
  return locale === "zh"
    ? ZH_ECOSYSTEM_CATEGORY_LABELS[category]
    : category;
}

export function localizedSourceKind(
  kind: "official" | "community" | "original",
  locale: Locale,
): string {
  return locale === "zh" ? ZH_SOURCE_KIND_LABELS[kind] : kind;
}

export function localizedPrimitive(primitive: string, locale: Locale): string {
  if (locale === "zh" && primitive in ZH_PRIMITIVE_LABELS) {
    return ZH_PRIMITIVE_LABELS[primitive as keyof typeof ZH_PRIMITIVE_LABELS];
  }
  return primitive;
}

export function localizedDifficulty(
  difficulty: JevTemplate["difficulty"],
  locale: Locale,
): string {
  return locale === "zh" ? ZH_DIFFICULTY_LABELS[difficulty] : difficulty;
}

export function localizedCategory(
  category: JevTemplate["category"],
  locale: Locale,
): string {
  return locale === "zh" ? ZH_CATEGORY_LABELS[category] : category;
}

export function getTemplateTranslation(slug: string) {
  return zhTemplates[slug];
}
