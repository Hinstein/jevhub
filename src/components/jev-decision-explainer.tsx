import type { Locale } from "@/i18n/config";

const COPY = {
  en: {
    eyebrow: "The basic shape",
    title: "State + typed question → decision + probability",
    state: "State",
    stateBody: "“I was charged twice. Please fix this.”",
    question: "Typed question",
    questionBody: "Which team should handle this?",
    result: "Decision",
    resultBody: "Billing",
    primitives: "Three ways to ask Jev",
    choice: "Choice",
    choiceBody: "Pick one label from a closed set.",
    choiceUse: "Routing · classification · tool selection",
    noul: "Noul",
    noulBody: "Estimate the probability of a yes/no proposition.",
    noulUse: "Verification · eligibility · completion",
    score: "Score",
    scoreBody: "Place the state on an ordered rubric.",
    scoreUse: "Urgency · risk · quality · priority",
    uncertainty: "Probabilities make close calls visible",
    clear: "Clear decision",
    close: "Close call",
    clearNote:
      "A high-margin result can be routed automatically if your policy allows it.",
    closeNote:
      "A close distribution is a signal to clarify, fall back, or ask for review.",
  },
  zh: {
    eyebrow: "最基本的形状",
    title: "State + 类型化问题 → 决策 + 概率",
    state: "State",
    stateBody: "“我被重复扣款了，请帮我处理。”",
    question: "类型化问题",
    questionBody: "哪个团队应该处理这个请求？",
    result: "决策",
    resultBody: "账单",
    primitives: "三种提问方式",
    choice: "Choice",
    choiceBody: "从封闭集合中选择一个标签。",
    choiceUse: "路由 · 分类 · 工具选择",
    noul: "Noul",
    noulBody: "估算一个 yes/no 命题成立的概率。",
    noulUse: "核验 · 资格判断 · 完成度",
    score: "Score",
    scoreBody: "把 state 放到一个有序量表上。",
    scoreUse: "紧急度 · 风险 · 质量 · 优先级",
    uncertainty: "概率让“难判断”变得可见",
    clear: "清晰决策",
    close: "接近的结果",
    clearNote: "如果业务政策允许，高差距结果可以进入自动路由。",
    closeNote: "接近的概率分布更适合澄清、回退或人工审核。",
  },
} as const;

function StaticProbability({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="probability-row">
      <div className="probability-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="probability-track" aria-hidden="true">
        <div
          className="probability-fill"
          style={{ width: String(value) + "%" }}
        />
      </div>
    </div>
  );
}

export function JevDecisionExplainer({
  locale = "en",
}: {
  locale?: Locale;
}) {
  const copy = COPY[locale];

  return (
    <div className="jev-explainer">
      <section>
        <div className="eyebrow">{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <div className="decision-flow">
          <div className="decision-flow-card">
            <span>{copy.state}</span>
            <strong>{copy.stateBody}</strong>
          </div>
          <div className="decision-flow-symbol">+</div>
          <div className="decision-flow-card">
            <span>{copy.question}</span>
            <strong>{copy.questionBody}</strong>
            <div className="mini-options">
              <i>Billing</i>
              <i>Technical</i>
              <i>Other</i>
            </div>
          </div>
          <div className="decision-flow-symbol">→</div>
          <div className="decision-flow-card decision-flow-result">
            <span>{copy.result}</span>
            <strong>{copy.resultBody}</strong>
            <StaticProbability label={copy.resultBody} value={94} />
          </div>
        </div>
      </section>

      <section>
        <h2>{copy.primitives}</h2>
        <div className="primitive-grid">
          <div className="primitive-card">
            <div className="primitive-type">{copy.choice}</div>
            <h3>{copy.choiceBody}</h3>
            <p>{copy.choiceUse}</p>
          </div>
          <div className="primitive-card">
            <div className="primitive-type">{copy.noul}</div>
            <h3>{copy.noulBody}</h3>
            <p>{copy.noulUse}</p>
          </div>
          <div className="primitive-card">
            <div className="primitive-type">{copy.score}</div>
            <h3>{copy.scoreBody}</h3>
            <p>{copy.scoreUse}</p>
          </div>
        </div>
      </section>

      <section>
        <h2>{copy.uncertainty}</h2>
        <div className="uncertainty-grid">
          <div className="uncertainty-card">
            <div className="eyebrow">{copy.clear}</div>
            <StaticProbability label="Billing" value={96} />
            <StaticProbability label="Technical" value={3} />
            <StaticProbability label="Other" value={1} />
            <p>{copy.clearNote}</p>
          </div>
          <div className="uncertainty-card">
            <div className="eyebrow">{copy.close}</div>
            <StaticProbability label="Billing" value={44} />
            <StaticProbability label="Technical" value={39} />
            <StaticProbability label="Other" value={17} />
            <p>{copy.closeNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
