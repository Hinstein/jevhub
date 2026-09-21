import { notFound } from "next/navigation";
import { ArticleShell } from "@/components/article-shell";
import { CodeBlock } from "@/components/code-block";
import { EcosystemCard } from "@/components/ecosystem-card";
import { LocaleLink } from "@/components/locale-link";
import { JevCostCalculator } from "@/components/calculator/jev-cost-calculator";
import { StoreLink } from "@/components/store-link";
import { TemplateCard } from "@/components/template-card";
import { ecosystem, ecosystemCategories } from "@/content/ecosystem";
import { templates, templateBySlug } from "@/content/templates";
import { JEV_PRICING } from "@/data/jev-pricing";
import {
  localizedCategory,
  localizedDifficulty,
  localizedPrimitive,
  localizedSourceKind,
  localizedTemplate,
  ZH_CATEGORY_LABELS,
  ZH_ECOSYSTEM_CATEGORY_LABELS,
} from "@/i18n/zh-content";

const locale = "zh" as const;

const featuredTemplates = [
  "refund-detection",
  "agent-router",
  "task-completion",
  "lead-qualification",
];

const example = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const result = await client.systemOne({
  state: { message: "I was charged twice. Please fix this ASAP." },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null, technical: null, other: null,
    }),
  },
});`;

const install = `npm install @typesafe-ai/sdk`;

const quickstart = `import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const response = await client.systemOne({
  state: {
    document: "I was charged twice. Please fix this ASAP.",
  },
  questions: {
    category: choice("What is this ticket about?", {
      billing: null,
      technical: null,
      other: null,
    }),
  },
});

console.log(response.answers.category.choice);`;

const multi = `import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();

const response = await client.systemOne({
  state: {
    message: "Our checkout failed twice and launch is tomorrow.",
  },
  questions: {
    route: choice("Which queue should own this?", {
      billing: "Payment and charge issues",
      technical: "Product or integration failures",
      other: "Everything else",
    }),
    urgent: noul("Is this time-sensitive?"),
    severity: score("How severe is the impact?", [
      "Low",
      "Moderate",
      "High",
      "Critical",
    ]),
  },
});`;

export function ChineseHomePage() {
  const featured = templates.filter((template) =>
    featuredTemplates.includes(template.slug),
  );

  return (
    <>
      <section className="hero">
        <div className="shell">
          <div className="eyebrow">独立 Jev 资源</div>
          <h1>Jev 学习、工具与案例，一站看懂。</h1>
          <p className="hero-copy">
            这里整理 Jev 的入门说明、成本计算器、可复用模板和精选生态项目，帮助你快速理解并上手 TypeSafe AI 的 Jev。
          </p>
          <div className="actions">
            <LocaleLink className="button-primary" href="/getting-started" locale={locale}>
              从 Jev 开始
            </LocaleLink>
            <LocaleLink
              className="button-secondary"
              href="/tools/jev-cost-calculator"
              locale={locale}
            >
              打开成本计算器
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">从这里开始</div>
            <h2>你现在想做什么？</h2>
            <p>了解 Jev、估算成本、直接套用模板，或者看看生态里大家在做什么。</p>
          </div>
          <div className="grid grid-4">
            <LocaleLink className="card card-link" href="/what-is-jev" locale={locale}>
              <div className="eyebrow">了解</div>
              <h3>什么是 Jev？</h3>
              <p>看懂 Jev 的输入、输出和概率，以及它适合解决什么问题。</p>
            </LocaleLink>
            <LocaleLink
              className="card card-link"
              href="/tools/jev-cost-calculator"
              locale={locale}
            >
              <div className="eyebrow">计算</div>
              <h3>估算使用成本</h3>
              <p>将 token 数量和请求量转换为每月成本。</p>
            </LocaleLink>
            <LocaleLink className="card card-link" href="/templates" locale={locale}>
              <div className="eyebrow">构建</div>
              <h3>复制决策模板</h3>
              <p>从 Choice、Score 和 Noul 的现成示例开始。</p>
            </LocaleLink>
            <LocaleLink className="card card-link" href="/ecosystem" locale={locale}>
              <div className="eyebrow">探索</div>
              <h3>浏览生态目录</h3>
              <p>寻找 SDK、集成、Agent 工具和社区项目。</p>
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">Jev 擅长什么</div>
            <h2>让程序直接拿结果继续执行。</h2>
            <p>
              Jev 更适合答案范围明确的问题：分类、路由、评分，或者判断一个 yes/no 结论有多大概率成立。它不是用来写长文本的。
            </p>
          </div>
          <div className="grid grid-4">
            {[
              ["分类", "从预先定义的选项里选一个。"],
              ["路由", "从允许的下一步中选择一个去向。"],
              ["评分", "按你定义的等级给出分数。"],
              ["判断", "给出某个 yes/no 结论成立的概率。"],
            ].map(([title, text]) => (
              <div className="card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">精选模板</div>
            <h2>先从现成场景开始，不用从空白 prompt 写起。</h2>
          </div>
          <div className="grid grid-2">
            {featured.map((template) => (
              <TemplateCard key={template.slug} template={template} locale={locale} />
            ))}
          </div>
          <div className="actions">
            <LocaleLink className="button-secondary" href="/templates" locale={locale}>
              查看全部 8 个模板
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div className="eyebrow">生态预览</div>
            <h2>Jev 已经出现在真实的开发者工具中。</h2>
            <p>
              JevHub 只收录一小批值得看的项目，并会打开原始仓库确认信息。
            </p>
          </div>
          <div className="grid grid-3">
            {ecosystem.slice(0, 6).map((item) => (
              <EcosystemCard item={item} key={item.repoUrl} locale={locale} />
            ))}
          </div>
          <div className="actions">
            <LocaleLink className="button-secondary" href="/ecosystem" locale={locale}>
              探索生态目录
            </LocaleLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="card">
            <div className="eyebrow">JevHub Store</div>
            <h2>Store 与本站分开运行。</h2>
            <p>
              购买相关内容会跳转到独立的 JevHub Store；这里继续专注于指南、模板和生态内容。
            </p>
            <div className="actions">
              <StoreLink locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ChineseWhatIsJevPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/what-is-jev"
      title="什么是 Jev？"
      description="Jev 是 TypeSafe AI 的第一个公开 System One 模型：它接收 state（上下文）和 Choice、Score、Noul 问题，返回固定格式的结果和概率，而不是自由文本。"
    >
      <div className="callout">
        可以把 Jev 理解为给软件做分类、判断和评分的结构化决策模型，而不是聊天助手。
      </div>

      <h2>同样的逻辑，用 TypeScript 表达</h2>
      <p>
        官方 JavaScript SDK 也是把 state 和问题一起发给 Jev，再读取固定格式的结果。
      </p>
      <CodeBlock code={example} locale={locale} />

      <h2>三种提问方式</h2>
      <h3>Choice</h3>
      <p>
        Choice 从预先定义的选项里选一个。它适合分类、路由、工具选择，或任何互斥分支。
      </p>
      <h3>Score</h3>
      <p>
        Score 按你定义的等级给 state 打分。官方 JavaScript SDK 用一个至少包含两个评分等级的列表表示量表，索引从零开始。
      </p>
      <h3>Noul</h3>
      <p>
        Noul 是 yes/no 问题。返回的 <code>noul</code> 值代表 yes 结果的概率。它适合判断证据是否证明任务完成，或消息是否是合格线索。
      </p>

      <h2>Jev 适合的场景</h2>
      <ul>
        <li>对客服、销售、审核或文档状态进行分类。</li>
        <li>在预先定义好的工作流中路由请求。</li>
        <li>按明确的严重程度或优先级规则评分。</li>
        <li>先过滤大批量输入，再把少量结果交给 LLM。</li>
        <li>根据已有信息，判断某个结论或 Agent 是否真的完成了任务。</li>
      </ul>

      <h2>Jev 不适合的场景</h2>
      <ul>
        <li>写邮件、文章、程序或自由形式的解释。</li>
        <li>需要自由发挥的创意生成。</li>
        <li>无法提前定义可能答案范围的任务。</li>
        <li>没有明确的权限和业务规则，就直接授权高风险操作。</li>
      </ul>

      <h2>Jev 可以与 LLM 组合使用</h2>
      <p>
        一种常见架构是先让 Jev 分类、路由或过滤，只有真正需要生成语言时才调用生成式模型。这样可以让前置判断更可控，同时在真正需要生成内容时保留 GPT、Claude 或其他 LLM 的灵活性。
      </p>

      <h2>一手来源</h2>
      <p>
        TypeSafe 的发布文章把 Jev 概括为 “structured state in, typed probabilistic decisions out”。官方 JavaScript SDK
        暴露了 <code>choice</code>、<code>score</code>、<code>noul</code> 和 <code>systemOne</code>。
      </p>
      <ul>
        <li>
          <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" target="_blank" rel="noreferrer">
            TypeSafe：Introducing System One Models &amp; Jev ↗
          </a>
        </li>
        <li>
          <a href="https://github.com/typesafe-ai/typesafe-sdk-js" target="_blank" rel="noreferrer">
            官方 TypeSafe JavaScript SDK ↗
          </a>
        </li>
      </ul>

      <h2>下一步</h2>
      <p>
        继续阅读
        <LocaleLink href="/getting-started" locale={locale}>快速入门</LocaleLink>，在
        <LocaleLink href="/tools/jev-cost-calculator" locale={locale}>成本计算器</LocaleLink>中估算用量，或浏览
        <LocaleLink href="/templates" locale={locale}>实用模板</LocaleLink>。
      </p>
    </ArticleShell>
  );
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 3 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

const pricingExamples = [
  { label: "100 万输入 token", tokens: 1_000_000 },
  { label: "1 亿输入 token", tokens: 100_000_000 },
  { label: "10 亿输入 token", tokens: 1_000_000_000 },
];

export function ChinesePricingPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/pricing"
      title="Jev 定价"
      description={`截至 ${JEV_PRICING.lastVerifiedAt} 最近核验，TypeSafe 列出的 Jev 输入价格是每 100 万 token ${JEV_PRICING.pricePerMillionInputTokens}。当前输出 token 不计费。`}
    >
      <div className="callout">
        价格可能变化。JevHub 全站只使用一份定价配置，并在下方链接回 TypeSafe 官方来源。
      </div>

      <h2>当前列出的价格</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>用量</th>
              <th>价格</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>输入</td>
              <td>{formatUsd(JEV_PRICING.pricePerMillionInputTokens)} / 100 万 token</td>
            </tr>
            <tr>
              <td>输出</td>
              <td>{JEV_PRICING.pricePerMillionOutputTokens === 0 ? "当前不计费" : formatUsd(JEV_PRICING.pricePerMillionOutputTokens)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>三个简单例子</h2>
      <div className="grid grid-3">
        {pricingExamples.map((example) => {
          const cost =
            (example.tokens / 1_000_000) *
            JEV_PRICING.pricePerMillionInputTokens;
          return (
            <div className="card" key={example.label}>
              <div className="eyebrow">{example.label}</div>
              <h3>{formatUsd(cost)}</h3>
              <p>按当前列出的价格计算输入 token 成本。</p>
            </div>
          );
        })}
      </div>

      <h2>只看请求数是不够的</h2>
      <p>
        Jev 按输入 token 计价。同样是 100 万次请求，state 很短和 state 很长，成本会差很多。估算时要同时看每次请求的平均输入大小和请求量。
      </p>

      <div className="actions">
        <LocaleLink className="button-primary" href="/tools/jev-cost-calculator" locale={locale}>
          打开 Jev 成本计算器
        </LocaleLink>
        <LocaleLink className="button-secondary" href="/getting-started" locale={locale}>
          阅读快速入门
        </LocaleLink>
      </div>

      <h2>官方来源</h2>
      <p>最近核验：<strong>{JEV_PRICING.lastVerifiedAt}</strong>。</p>
      <p>
        <a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">
          TypeSafe 发布文章与定价 ↗
        </a>
      </p>

      <h2>关于 JevHub Store</h2>
      <p>
        JevHub Store 是独立站点，不是 TypeSafe 官方商店。点击后会离开 JevHub 内容站。
      </p>
      <div className="actions">
        <StoreLink locale={locale} />
      </div>
      <p>
        你也可以查看
        <LocaleLink href="/what-is-jev" locale={locale}>Jev 是什么</LocaleLink>，或在
        <LocaleLink href="/jev-vs-chatgpt" locale={locale}>Jev 与 ChatGPT</LocaleLink>中比较两者适合的场景。
      </p>
    </ArticleShell>
  );
}

export function ChineseGettingStartedPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/getting-started"
      title="Jev 快速入门"
      description="最短路径是：安装官方 SDK，设置 TypeSafe API key，发送 state 和 Choice、Score、Noul 问题，然后在代码中读取返回结果。"
    >
      <h2>1. 前置条件</h2>
      <p>当前官方 JavaScript SDK 要求 Node.js 20 或更高版本，以及一个 TypeSafe API key。</p>

      <h2>2. 安装官方 SDK</h2>
      <CodeBlock code={install} locale={locale} />
      <p>
        把 <code>TYPESAFE_API_KEY</code> 放在服务端环境变量里，不要写进前端代码。官方客户端也会阻止在浏览器中直接使用它。
      </p>

      <h2>3. 发送第一个决策</h2>
      <CodeBlock code={quickstart} locale={locale} />
      <p>这个示例沿用官方 JavaScript SDK quickstart 的基本写法：让 Jev 从几个固定类别中判断这条客服消息属于哪一类。</p>

      <h2>4. state 是什么</h2>
      <p>
        <code>state</code> 是模型需要判断的信息，可以是文本，也可以是 JSON 兼容的结构化数据。如果应用已经知道支付状态、用户角色、tool 调用结果或允许的 route 等事实，优先用明确字段传入。
      </p>

      <h2>5. questions 怎么写</h2>
      <p>
        每个 question 都会返回固定格式的结果。Choice 从固定选项中选一个；Noul 返回 yes 的概率；Score 按你定义的等级给出分数和概率分布。
      </p>
      <CodeBlock code={multi} locale={locale} />

      <h2>常见错误</h2>
      <ul>
        <li>答案范围根本无法提前定义，却要求 Jev 生成长文本。</li>
        <li>Choice 标签含义模糊，没有定义区分标准。</li>
        <li>把 Jev 的结果直接当成高风险操作的执行授权。</li>
        <li>把秘密 API key 放在浏览器中调用，而不是放在服务端环境。</li>
      </ul>

      <h2>一手来源</h2>
      <p>本页在 2026-09-21 根据官方 JavaScript SDK v0.6.0 源码和 README 核验。</p>
      <p>
        <a href="https://github.com/typesafe-ai/typesafe-sdk-js" target="_blank" rel="noreferrer">
          官方 TypeSafe JavaScript SDK ↗
        </a>
      </p>

      <h2>下一步</h2>
      <p>
        在<LocaleLink href="/templates" locale={locale}>模板</LocaleLink>中尝试具体模式，在
        <LocaleLink href="/tools/jev-cost-calculator" locale={locale}>成本计算器</LocaleLink>中估算生产用量，或阅读
        <LocaleLink href="/jev-vs-chatgpt" locale={locale}>Jev 与 ChatGPT</LocaleLink>了解两者分别适合什么场景。
      </p>
    </ArticleShell>
  );
}

export function ChineseJevVsChatGPTPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/jev-vs-chatgpt"
      title="Jev 与 ChatGPT"
      description="Jev 和生成式 LLM 解决工作流中的不同部分。Jev 更适合固定选项、评分和概率判断；ChatGPT 更适合生成文本、代码和处理开放式任务。"
    >
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>维度</th>
              <th>Jev</th>
              <th>ChatGPT 风格 LLM</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["主要输出", "Choice / Score / Noul 这类固定结构结果", "生成文本、代码、结构化输出和 tool calls"],
              ["开放式写作", "不擅长", "核心优势"],
              ["路由", "候选项事先定义好时很适合", "可以做到，但通常需要额外 prompt 或 schema 约束"],
              ["评分", "按预先定义的等级评分", "通常通过 prompt 或 schema 约束"],
              ["解释", "不输出自由文本解释", "可以解释、总结和写散文"],
              ["程序流程", "结果可以直接进入 if / switch 等程序逻辑", "通常在生成内容本身就是任务时使用"],
            ].map(([dimension, jev, llm]) => (
              <tr key={dimension}>
                <td>{dimension}</td>
                <td>{jev}</td>
                <td>{llm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>有用的问题不是“谁更强？”</h2>
      <p>
        有用的问题是：工作流里哪些步骤的答案范围可以提前定义，哪些步骤真的需要生成内容。客服系统可以用 Jev 路由工单，再用生成式模型起草回复；research pipeline 也可以先用 Jev 过滤大量候选，再让生成式模型总结少量结果。
      </p>

      <h2>一种实用的组合架构</h2>
      <div className="callout">输入 → Jev 过滤 / 路由 / 评分 → 只有需要文本或开放式推理时才调用生成式 LLM</div>

      <h2>关于速度和成本宣传</h2>
      <p>
        TypeSafe 发布过 System One 的 benchmark 和工作流结果。这些数据来自 TypeSafe 自己的测量，而且会受任务类型、模型选择、state 大小和网络条件影响。因此 JevHub 不会把某个宣传倍数直接写成“Jev 一定快 X 倍”。
      </p>
      <p>
        对自己的真实请求，请从<LocaleLink href="/tools/jev-cost-calculator" locale={locale}>成本计算器</LocaleLink>开始，并用有代表性的样本测试，不要直接拿 demo 结果外推。
      </p>

      <h2>Jev 更适合的情况</h2>
      <ul>
        <li>你已经知道允许的标签或路由。</li>
        <li>你需要按明确规则打分。</li>
        <li>你需要在更昂贵的模型之前先做低成本过滤。</li>
        <li>你需要概率，而不只是一个硬标签，让代码可以据此设置阈值。</li>
      </ul>

      <h2>生成式 LLM 更适合的情况</h2>
      <ul>
        <li>输出本身是散文、代码、计划或总结。</li>
        <li>答案无法提前列成固定选项。</li>
        <li>用户需要解释、对话或创意回应。</li>
      </ul>

      <p>
        下一步：阅读<LocaleLink href="/what-is-jev" locale={locale}>什么是 Jev？</LocaleLink>，跟随
        <LocaleLink href="/getting-started" locale={locale}>快速入门</LocaleLink>，或浏览
        <LocaleLink href="/templates" locale={locale}>决策模板</LocaleLink>。
      </p>
    </ArticleShell>
  );
}

export function ChineseCostCalculatorPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/tools/jev-cost-calculator"
      eyebrow="免费工具"
      title="Jev 成本计算器"
      description="估算 Jev 输入 token 的每次、每天、每月和每年成本。所有计算器输入都留在浏览器中。"
    >
      <JevCostCalculator locale={locale} />

      <h2>估算如何计算</h2>
      <p>
        计算器将每次请求的平均输入 token 数乘以请求量，然后应用当前每百万输入 token ${JEV_PRICING.pricePerMillionInputTokens} 的价格。每天模式使用 365.25 / 12 作为平均月长度。
      </p>

      <h2>它不会估算什么</h2>
      <ul>
        <li>你自己的数据库、日志、队列或托管成本。</li>
        <li>围绕 Jev 的任何独立生成式模型调用。</li>
        <li>最近核验日期之后可能发生的未来价格变化。</li>
      </ul>

      <p>
        阅读<LocaleLink href="/pricing" locale={locale}>定价说明</LocaleLink>，查看
        <LocaleLink href="/getting-started" locale={locale}>如何发出第一个请求</LocaleLink>，或浏览
        <LocaleLink href="/templates" locale={locale}>Jev 模板</LocaleLink>。
      </p>

      <p className="small">
        官方价格来源：<a href={JEV_PRICING.sourceUrl} target="_blank" rel="noreferrer">TypeSafe ↗</a>。最近核验 {JEV_PRICING.lastVerifiedAt}。
      </p>
    </ArticleShell>
  );
}

const zhTemplateCategories = [
  { key: "support", label: ZH_CATEGORY_LABELS.support },
  { key: "sales", label: ZH_CATEGORY_LABELS.sales },
  { key: "agents", label: ZH_CATEGORY_LABELS.agents },
  { key: "safety", label: ZH_CATEGORY_LABELS.safety },
] as const;

export function ChineseTemplatesPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/templates"
      eyebrow="模板库"
      title="Jev 决策模板"
      description="8 个常见场景的 Jev 示例。每个模板都包含示例 state、问题设计、TypeScript、注意事项和来源。"
    >
      <div className="callout">
        这些页面是可复制的代码示例。接入自己的项目时，请按业务规则调整选项和阈值。
      </div>

      {zhTemplateCategories.map((category) => {
        const items = templates.filter((template) => template.category === category.key);
        return (
          <section key={category.key}>
            <h2>{category.label}</h2>
            <div className="grid grid-2">
              {items.map((template) => (
                <TemplateCard key={template.slug} template={template} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}
    </ArticleShell>
  );
}

function renderCriteria(criteria: Record<string, string | null> | string[] | undefined) {
  if (!criteria) return null;
  if (Array.isArray(criteria)) {
    return (
      <ol>
        {criteria.map((criterion) => (
          <li key={criterion}>{criterion}</li>
        ))}
      </ol>
    );
  }
  return (
    <ul>
      {Object.entries(criteria).map(([key, value]) => (
        <li key={key}>
          <code>{key}</code>
          {value ? ` — ${value}` : ""}
        </li>
      ))}
    </ul>
  );
}

export function ChineseTemplateDetailPage({ slug }: { slug: string }) {
  const sourceTemplate = templateBySlug.get(slug);
  if (!sourceTemplate) notFound();
  const template = localizedTemplate(sourceTemplate, locale);

  return (
    <ArticleShell
      locale={locale}
      path={`/templates/${template.slug}`}
      breadcrumbParent={{ name: "模板", path: "/templates" }}
      eyebrow={`${localizedCategory(template.category, locale)} · ${localizedDifficulty(template.difficulty, locale)}`}
      title={template.title}
      description={template.description}
    >
      <div className="badges">
        {template.primitives.map((primitive) => (
          <span className="badge" key={primitive}>
            {localizedPrimitive(primitive, locale)}
          </span>
        ))}
      </div>

      <h2>适合什么时候使用</h2>
      <ul>
        {template.useCases.map((useCase) => (
          <li key={useCase}>{useCase}</li>
        ))}
      </ul>

      <h2>示例 state</h2>
      <CodeBlock code={JSON.stringify(template.stateExample, null, 2)} locale={locale} />

      <h2>决策问题</h2>
      {template.questions.map((question) => (
        <section className="card" key={question.id}>
          <div className="badges">
            <span className="badge">{localizedPrimitive(question.type, locale)}</span>
            <span className="badge">{question.id}</span>
          </div>
          <h3>{question.instruction}</h3>
          {renderCriteria(question.criteria)}
        </section>
      ))}

      <h2>预期输出</h2>
      <p>{template.expectedOutput}</p>

      <h2>TypeScript 示例</h2>
      <CodeBlock code={template.typescriptExample} templateSlug={template.slug} locale={locale} />

      <h2>为什么这样设计</h2>
      <ul>
        {template.whyItWorks.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2>注意事项</h2>
      <ul>
        {template.limits.map((limit) => (
          <li key={limit}>{limit}</li>
        ))}
      </ul>

      <h2>来源与参考</h2>
      <div className="source-list">
        {template.sourceNotes.map((source) => (
          <div className="source-row" key={`${source.kind}-${source.url}`}>
            <span className="source-kind">{localizedSourceKind(source.kind, locale)}</span>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label} ↗
            </a>
          </div>
        ))}
      </div>

      <h2>继续浏览</h2>
      <p>
        浏览<LocaleLink href="/templates" locale={locale}>全部模板</LocaleLink>，了解
        <LocaleLink href="/getting-started" locale={locale}>官方 SDK 用法</LocaleLink>，或使用
        <LocaleLink href="/tools/jev-cost-calculator" locale={locale}>成本计算器</LocaleLink>估算实际使用成本。
      </p>
    </ArticleShell>
  );
}

export function ChineseEcosystemPage() {
  return (
    <ArticleShell
      locale={locale}
      path="/ecosystem"
      eyebrow="精选目录"
      title="Jev 生态"
      description="一个小而精的 Jev 项目目录。每个项目都会回到原始仓库核验；JevHub 不做排名，收录也不代表背书。"
    >
      <div className="callout">
        发现项目时会参考 Awesome Jev 等公开来源，但正式收录前都会再检查原始仓库或官网。
      </div>

      {ecosystemCategories.map((category) => {
        const items = ecosystem.filter((item) => item.category === category);
        return (
          <section className="ecosystem-section" key={category}>
            <h2>{ZH_ECOSYSTEM_CATEGORY_LABELS[category]}</h2>
            <div className="ecosystem-grid">
              {items.map((item) => (
                <EcosystemCard item={item} key={item.repoUrl} locale={locale} />
              ))}
            </div>
          </section>
        );
      })}

      <h2>这个目录如何维护</h2>
      <ul>
        <li>条目必须有公开、可以直接核验的项目链接。</li>
        <li>描述由 JevHub 自己撰写，不直接复制列表内容。</li>
        <li>V0.1 不按 GitHub Stars、评分或“最佳项目”做排名。</li>
        <li>V0.1 采用人工精选，不会自动搬运其他目录。</li>
      </ul>

      <p>
        想先了解 Jev 怎么做决策？阅读<LocaleLink href="/what-is-jev" locale={locale}>什么是 Jev？</LocaleLink>，或从
        <LocaleLink href="/templates" locale={locale}>8 个实用模板</LocaleLink>开始。
      </p>
    </ArticleShell>
  );
}

export function ChinesePage({ path }: { path: string }) {
  if (path === "/") return <ChineseHomePage />;
  if (path === "/what-is-jev") return <ChineseWhatIsJevPage />;
  if (path === "/pricing") return <ChinesePricingPage />;
  if (path === "/getting-started") return <ChineseGettingStartedPage />;
  if (path === "/jev-vs-chatgpt") return <ChineseJevVsChatGPTPage />;
  if (path === "/tools/jev-cost-calculator") return <ChineseCostCalculatorPage />;
  if (path === "/templates") return <ChineseTemplatesPage />;
  if (path === "/ecosystem") return <ChineseEcosystemPage />;
  if (path.startsWith("/templates/")) {
    return <ChineseTemplateDetailPage slug={path.slice("/templates/".length)} />;
  }
  notFound();
}
