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
      "识别客服案例是否主要在请求退款，同时不把分类结果当成退款授权。",
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
    expectedOutput: "一个类型化的 primary_request 标签，以及证据支持退款请求的概率。",
    whyItWorks: [
      "分类空间是封闭的，并且每个类别都能直接用于运营分流。",
      "state 将客户说了什么与订单事实分开保存。",
      "额外的 Noul 问题保留了不确定性，不会强迫每个案例直接变成执行动作。",
    ],
    limits: [
      "识别退款请求不等于授权退款。",
      "实际退款资格应由确定性政策和支付记录核验。",
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
        instruction: "将审核紧急程度评为 0 到 3。",
        criteria: [
          "0 — 常规，没有时间敏感影响",
          "1 — 影响较小",
          "2 — 正在影响客户",
          "3 — 严重或必须立即处理的客户影响",
        ],
      },
    },
    expectedOutput: "一个主要队列，以及按有序量表计算的预期紧急程度。",
    whyItWorks: [
      "主要路由指令能处理一个案例可能同时符合多个队列的情况。",
      "紧急程度量表是明确的，而不是让模型自行发明一个数字。",
    ],
    limits: [
      "路由不应静默丢弃次要问题。",
      "紧急程度是分诊信号，不是服务级别承诺。",
    ],
  },
  "lead-qualification": {
    title: "销售线索筛选",
    description: "将真实销售机会与合作、客服、垃圾信息和意图不明的消息区分开。",
    useCases: ["入站销售", "CRM 分流", "销售提醒"],
    questions: {
      inbound_type: {
        instruction: "为这条入站消息选择路由。",
        criteria: {
          sales: "正在评估购买的潜在客户",
          partnership: "提出业务合作",
          support: "现有客户寻求帮助",
          spam: "未经请求的泛化推广",
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
    expectedOutput: "一个入站路由、线索资格概率，以及有序的跟进优先级。",
    whyItWorks: [
      "路由将销售与联系表单中常见的其他流量区分开。",
      "资格判断绑定到消息中的证据，而不是只看像不像一家公司。",
      "将优先级从资格判断中拆开，团队可以分别设置跟进阈值。",
    ],
    limits: [
      "除非 state 提供证据，否则不要推断预算、决策权或公司规模。",
      "高模型分数不应绕过正常的同意规则，自动注册或联系某个人。",
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
        instruction: "将购买准备度评为 0 到 4。",
        criteria: [
          "0 — 没有购买信号",
          "1 — 随口表达兴趣",
          "2 — 正在主动评估",
          "3 — 询问具体购买约束",
          "4 — 询问近期商务下一步",
        ],
      },
    },
    expectedOutput: "一个购买意向概率，以及预期的购买准备度评分。",
    whyItWorks: [
      "问题明确区分了具体评估与模糊兴趣。",
      "评分量表让下游代码可以控制触发阈值。",
    ],
    limits: [
      "意向不等于身份、预算或决策权。",
      "将 CRM 事实作为明确 state 提供，不要让模型编造缺失的资格信息。",
    ],
  },
  "spam-detection": {
    title: "垃圾信息识别",
    description: "筛选联系表单中的泛化推广，同时保留一个明确的意图不明路由。",
    useCases: ["联系表单", "收件箱分流", "社区入口"],
    questions: {
      message_type: {
        instruction: "为这条入站消息选择最合适的路由。",
        criteria: {
          sales: "正在评估我们产品的潜在客户",
          partnership: "具体的合作提议",
          support: "现有客户寻求帮助",
          spam: "未经请求的泛化推广",
          unclear: "目的不明确",
        },
      },
      unsolicited_promotion: {
        instruction: "这条消息主要是未经请求的泛化推广，而不是相关请求吗？",
      },
    },
    expectedOutput: "一个路由，以及可以用保守阈值处理的垃圾信息概率。",
    whyItWorks: [
      "意图不明路由避免把模糊消息强行判成垃圾信息。",
      "单独的概率让应用可以自行选择保守阈值。",
    ],
    limits: [
      "不要自动删除低置信度消息。",
      "这是语义分诊模式，不是完整的反滥用系统。",
    ],
  },
  "agent-router": {
    title: "智能体路由",
    description: "从受约束的图中选择下一个允许的智能体或工具，不把模型选择当成授权。",
    useCases: ["多智能体系统", "工具路由", "工作流分支"],
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
        instruction: "根据请求和当前图状态，是否有足够信息安全地选择下一个节点？",
      },
    },
    expectedOutput: "受当前图约束的下一个节点选择，以及路由证据充分的概率。",
    whyItWorks: [
      "候选集合来自工作流图，而不是让模型无约束地发明。",
      "应用仍然负责权限校验和执行。",
      "澄清是一个一等结果，而不是异常情况。",
    ],
    limits: [
      "路由到的工具仍然需要确定性的授权检查。",
      "绝不允许模型输出图中不存在的工具名称。",
    ],
  },
  "task-completion": {
    title: "任务完成校验",
    description: "根据工具证据和观察到的最终状态，核验智能体声称的任务是否完成。",
    useCases: ["智能体质量检查", "停止钩子", "工作流校验"],
    questions: {
      task_complete: {
        instruction:
          "工具证据和最终观察状态是否证明请求的任务确实完成？智能体自己的声明不能单独作为证据。",
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
    expectedOutput: "基于证据的完成概率，以及一个可执行的审核路由。",
    whyItWorks: [
      "state 将声明与独立证据分成不同字段。",
      "完成问题明确让工具证据优先于自我报告。",
      "审核路由为外围程序提供了受约束的下一步。",
    ],
    limits: [
      "校验器只能判断你实际提供的证据。",
      "对高影响操作，应将语义校验与确定性的后置条件结合。",
    ],
  },
  "content-moderation": {
    title: "内容审核",
    description: "按回复的角色进行分类，并单独判断是否需要人工审核。",
    useCases: ["社区路由", "评论分流", "人工审核队列"],
    questions: {
      reply_type: {
        instruction: "判断这条回复的主要角色。",
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
    expectedOutput: "一个语义回复类别，以及需要人工审核的独立概率。",
    whyItWorks: [
      "分类与升级审核是两个独立的决定。",
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
    "官方 TypeScript/JavaScript 客户端，支持 System One 请求以及 Choice、Score、Noul 构建器和推导出的答案类型。",
  "TypeSafe Python SDK":
    "TypeSafe System One API 的官方 Python 客户端，适合在 Python 服务或数据管道中运行 Jev 决策。",
  "System One Adapter (Python)":
    "官方适配器，提供兼容 TypeSafeClient 的接口，并使用聊天模型提供方进行并行工作流比较。",
  "TypeSafe Agent Skills":
    "官方智能体技能资料，介绍如何在 Codex、Claude Code 等编码智能体中使用 System One 原语和评估模式。",
  advocaat: "一个紧凑的社区客户端，用面向类型的开发者 API 封装 TypeSafe/Jev 决策。",
  "typesafe-ai (Rust)":
    "社区 Rust 客户端，提供 System One 的类型化请求与响应处理。",
  "typesafe-sdk-go":
    "面向 Go 服务的社区 Go SDK，支持类型化问题和带概率的 System One 答案。",
  "typesafe-sdk-swift":
    "社区 Swift SDK，为 Apple 平台应用调用 System One 提供原生路径。",
  "Vercel Eve":
    "Vercel 的开放智能体框架，其实验性评估流程将 Jev 作为决策或评估模型选项。",
  "Vercel AI CLI": "Vercel Labs 的终端工具，其评估流程可以使用 Jev 作为评估器。",
  "zod-jev": "结合本地 Zod 结构校验与 Jev 语义判断，将结构与含义分开处理。",
  "zio-typesafe-ai": "Scala 3 / ZIO 的 System One API 集成，支持多问题类型化调用。",
  "TypeSafeAI Community Playground":
    "大型社区 playground，探索 Jev 模式、工作流、路由、浏览器智能体实验和面向评估的案例。",
  "Jev Playground": "专注于尝试 Jev 原语并查看结构化输出的社区 playground。",
  "Awesome Jev":
    "社区维护的 Jev 项目目录；JevHub 只将其作为发现源，然后回到原项目进行核验。",
  "Jev Ultrafast":
    "浏览器使用实验：让 Jev 在受约束的操作空间中选择浏览器动作和目标，同时将文本生成交给其他模型。",
  Foreman: "使用 Jev 风格的决策帮助编码智能体工作流保持在当前任务范围内的智能体监督工具。",
  "jev-review": "分阶段的社区代码审查工作流和本地仪表板，使用 Jev 进行受约束的审查判断。",
  "jev-mcp": "将 Jev 判断暴露给编码智能体和 MCP 客户端工作流的 MCP 服务。",
  jevwire: "面向智能体的决策层，结合 MCP 接口、可嵌入库和升级处理集成。",
  "Agent Chaperone":
    "在执行边界周围检查智能体工具调用与结果，展示语义检查如何配合确定性控制。",
  Canny: "面向智能体完成度的开源工具，强调在接受任务完成声明前先检查证据。",
  "jev-router":
    "开源 LLM 路由项目，在 LiteLLM 之上使用 Jev 从受约束的模型目录中选择模型。",
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
      "了解 Jev 如何通过类型化问题返回带概率的受约束决策，以及 Choice、Score 和 Noul 适合什么场景。",
  },
  "/pricing": {
    title: "Jev 定价：输入 token 与成本计算器",
    description:
      "查看 Jev 当前输入 token 价格、输出计量方式和官方来源，并估算你的使用成本。",
  },
  "/getting-started": {
    title: "Jev JavaScript SDK 快速入门",
    description:
      "安装官方 TypeSafe JavaScript SDK，设置 API key，并发送第一个包含 Choice、Score 和 Noul 的 System One 请求。",
  },
  "/jev-vs-chatgpt": {
    title: "Jev 与 ChatGPT：何时使用哪一个",
    description:
      "比较 Jev 的类型化受约束决策与 ChatGPT 风格生成模型，了解如何在同一个应用工作流中组合两者。",
  },
  "/tools/jev-cost-calculator": {
    title: "Jev 成本计算器：估算 token 成本",
    description:
      "根据平均输入 token 数、请求量和当前官方价格，估算每次、每天、每月和每年的 Jev 成本。",
  },
  "/templates": {
    title: "Jev 决策模板：Choice、Score 与 Noul",
    description:
      "浏览适用于客服、销售、智能体、审核等受约束决策的 8 个 Jev 模板，包含 TypeScript 示例和使用边界。",
  },
  "/ecosystem": {
    title: "Jev 生态目录：SDK、集成与工具",
    description:
      "浏览经过人工核验的 Jev 生态目录，包括官方 SDK、社区客户端、集成、智能体工具、playground 和研究项目。",
  },
};

export const ZH_CATEGORY_LABELS = {
  support: "客服",
  sales: "销售",
  agents: "智能体",
  safety: "安全与社区",
} as const;

export const ZH_DIFFICULTY_LABELS = {
  basic: "基础",
  intermediate: "进阶",
} as const;

export const ZH_PRIMITIVE_LABELS = {
  choice: "选择",
  score: "评分",
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
  "Agent / Tooling": "智能体 / 工具",
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
