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
    eyebrow: "Jev 的基本流程",
    title: "state（上下文）+ 问题 → 结果 + 概率",
    state: "State",
    stateBody: "“我被重复扣款了，请帮我处理。”",
    question: "问题",
    questionBody: "哪个团队应该处理这个请求？",
    result: "决策",
    resultBody: "账单",
    primitives: "三种提问方式",
    choice: "Choice",
    choiceBody: "从预先定义的选项里选一个。",
    choiceUse: "路由 · 分类 · 工具选择",
    noul: "Noul",
    noulBody: "判断一个 yes/no 结论成立的概率。",
    noulUse: "核验 · 资格判断 · 完成度",
    score: "Score",
    scoreBody: "按你定义的等级给 state 打分。",
    scoreUse: "紧急度 · 风险 · 质量 · 优先级",
    uncertainty: "概率让“难判断”变得可见",
    clear: "结果很明确",
    close: "结果很接近",
    clearNote: "当第一名明显领先时，可以按业务规则自动进入下一步。",
    closeNote: "当几个结果很接近时，更适合补充信息、走 fallback 或人工审核。",
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
              <i>{locale === "zh" ? "账单" : "Billing"}</i>
              <i>{locale === "zh" ? "技术" : "Technical"}</i>
              <i>{locale === "zh" ? "其他" : "Other"}</i>
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
            <StaticProbability label={locale === "zh" ? "账单" : "Billing"} value={96} />
            <StaticProbability label={locale === "zh" ? "技术" : "Technical"} value={3} />
            <StaticProbability label={locale === "zh" ? "其他" : "Other"} value={1} />
            <p>{copy.clearNote}</p>
          </div>
          <div className="uncertainty-card">
            <div className="eyebrow">{copy.close}</div>
            <StaticProbability label={locale === "zh" ? "账单" : "Billing"} value={44} />
            <StaticProbability label={locale === "zh" ? "技术" : "Technical"} value={39} />
            <StaticProbability label={locale === "zh" ? "其他" : "Other"} value={17} />
            <p>{copy.closeNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
