"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  PLAYGROUND_LIMITS,
  type PlaygroundDecisionType,
  type PlaygroundQuestionInput,
  validatePlaygroundRequest,
} from "@/lib/playground";
import type { Locale } from "@/i18n/config";

type ChoiceAnswer = {
  type: "choice";
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};

type NoulAnswer = {
  type: "noul";
  noul: number;
};

type ScoreAnswer = {
  type: "score";
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
  legend?: Record<string, unknown>;
};

type PlaygroundAnswer = ChoiceAnswer | NoulAnswer | ScoreAnswer;

type PlaygroundResponse = {
  model: string;
  answers: Record<string, PlaygroundAnswer>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

type Example = {
  name: string;
  typeLabel: string;
  state: string;
  question: PlaygroundQuestionInput;
};

const COPY = {
  en: {
    single: "Single question",
    multiple: "Multiple questions",
    chooseExample: "Choose an example — ready to run",
    input: "Input",
    output: "Output",
    state: "State",
    stateHelp: "The context Jev will read — a message, record, or report.",
    decision: "Decision",
    question: "Question",
    type: "Decision type",
    choice: "Choice",
    noul: "Noul",
    score: "Score",
    choices: "Choices",
    scale: "Score scale",
    addOption: "Add option",
    addQuestion: "Add question",
    removeQuestion: "Remove",
    run: "Run Jev",
    running: "Running Jev…",
    resultHint: "Results include the decision, confidence, and probability distribution.",
    flowInput: "State + Question",
    flowOutput: "Decision + Probability",
    invalidInput: "Check the state, question, and options, then try again.",
    emptyTitle: "Your Jev decision will appear here.",
    emptyBody:
      "Add context and a question, then run Jev to see the decision and probabilities.",
    result: "Decision result",
    confidence: "confidence",
    yes: "Yes",
    no: "No",
    expectedScore: "Expected score",
    usage: "Usage",
    inputTokens: "input tokens",
    outputTokens: "output tokens",
    requestFailed: "The request could not be completed.",
    questionLabel: "Decision",
  },
  zh: {
    single: "单个问题",
    multiple: "多个问题",
    chooseExample: "选择一个示例 — 可直接运行",
    input: "输入",
    output: "输出",
    state: "State（上下文）",
    stateHelp: "Jev 会读取的内容，例如消息、记录或报告。",
    decision: "决策",
    question: "问题",
    type: "决策类型",
    choice: "Choice",
    noul: "Noul",
    score: "Score",
    choices: "选项",
    scale: "评分量表",
    addOption: "添加选项",
    addQuestion: "添加问题",
    removeQuestion: "删除",
    run: "运行 Jev",
    running: "Jev 运行中…",
    resultHint: "结果会显示决策、置信度和概率分布。",
    flowInput: "上下文 + 问题",
    flowOutput: "决策 + 概率",
    invalidInput: "请检查上下文、问题和选项后再试。",
    emptyTitle: "Jev 的决策结果会显示在这里。",
    emptyBody: "填写上下文并选择问题类型，然后运行 Jev 查看决策与概率。",
    result: "决策结果",
    confidence: "置信度",
    yes: "是",
    no: "否",
    expectedScore: "期望评分",
    usage: "用量",
    inputTokens: "输入 token",
    outputTokens: "输出 token",
    requestFailed: "请求暂时无法完成。",
    questionLabel: "决策",
  },
  ja: {
    single: "単一の質問",
    multiple: "複数の質問",
    chooseExample: "例を選択 — すぐに実行できます",
    input: "入力",
    output: "出力",
    state: "State（コンテキスト）",
    stateHelp: "Jev が読むメッセージ、記録、レポートなどのコンテキストです。",
    decision: "判断",
    question: "質問",
    type: "判断の種類",
    choice: "Choice",
    noul: "Noul",
    score: "Score",
    choices: "選択肢",
    scale: "スコア尺度",
    addOption: "選択肢を追加",
    addQuestion: "質問を追加",
    removeQuestion: "削除",
    run: "Jev を実行",
    running: "Jev を実行中…",
    resultHint: "判断、確信度、確率分布を確認できます。",
    flowInput: "State + 質問",
    flowOutput: "判断 + 確率",
    invalidInput: "State、質問、選択肢を確認してもう一度お試しください。",
    emptyTitle: "Jev の判断結果がここに表示されます。",
    emptyBody: "コンテキストと質問を入力して実行すると、判断と確率を確認できます。",
    result: "判断結果",
    confidence: "確信度",
    yes: "はい",
    no: "いいえ",
    expectedScore: "期待スコア",
    usage: "使用量",
    inputTokens: "入力 token",
    outputTokens: "出力 token",
    requestFailed: "リクエストを完了できませんでした。",
    questionLabel: "判断",
  },
  fr: {
    single: "Question unique",
    multiple: "Questions multiples",
    chooseExample: "Choisir un exemple — prêt à exécuter",
    input: "Entrée",
    output: "Sortie",
    state: "State (contexte)",
    stateHelp: "Le contexte que Jev va lire : message, enregistrement ou rapport.",
    decision: "Décision",
    question: "Question",
    type: "Type de décision",
    choice: "Choice",
    noul: "Noul",
    score: "Score",
    choices: "Choix",
    scale: "Échelle de score",
    addOption: "Ajouter un choix",
    addQuestion: "Ajouter une question",
    removeQuestion: "Supprimer",
    run: "Exécuter Jev",
    running: "Jev s’exécute…",
    resultHint: "Les résultats incluent la décision, la confiance et la distribution des probabilités.",
    flowInput: "State + question",
    flowOutput: "Décision + probabilité",
    invalidInput: "Vérifiez le state, la question et les choix, puis réessayez.",
    emptyTitle: "Votre décision Jev apparaîtra ici.",
    emptyBody: "Ajoutez un contexte et une question, puis exécutez Jev pour voir la décision et les probabilités.",
    result: "Résultat de la décision",
    confidence: "confiance",
    yes: "Oui",
    no: "Non",
    expectedScore: "Score attendu",
    usage: "Utilisation",
    inputTokens: "tokens d’entrée",
    outputTokens: "tokens de sortie",
    requestFailed: "La requête n’a pas pu être terminée.",
    questionLabel: "Décision",
  },
  pl: {
    single: "Jedno pytanie",
    multiple: "Wiele pytań",
    chooseExample: "Wybierz przykład — gotowy do uruchomienia",
    input: "Wejście",
    output: "Wyjście",
    state: "State (kontekst)",
    stateHelp: "Kontekst odczytywany przez Jev: wiadomość, rekord lub raport.",
    decision: "Decyzja",
    question: "Pytanie",
    type: "Typ decyzji",
    choice: "Choice",
    noul: "Noul",
    score: "Score",
    choices: "Opcje",
    scale: "Skala oceny",
    addOption: "Dodaj opcję",
    addQuestion: "Dodaj pytanie",
    removeQuestion: "Usuń",
    run: "Uruchom Jev",
    running: "Jev działa…",
    resultHint: "Wynik zawiera decyzję, pewność i rozkład prawdopodobieństwa.",
    flowInput: "State + pytanie",
    flowOutput: "Decyzja + prawdopodobieństwo",
    invalidInput: "Sprawdź state, pytanie i opcje, a następnie spróbuj ponownie.",
    emptyTitle: "Decyzja Jev pojawi się tutaj.",
    emptyBody: "Dodaj kontekst i pytanie, a następnie uruchom Jev, aby zobaczyć decyzję i prawdopodobieństwa.",
    result: "Wynik decyzji",
    confidence: "pewność",
    yes: "Tak",
    no: "Nie",
    expectedScore: "Oczekiwana ocena",
    usage: "Zużycie",
    inputTokens: "tokeny wejściowe",
    outputTokens: "tokeny wyjściowe",
    requestFailed: "Nie udało się ukończyć żądania.",
    questionLabel: "Decyzja",
  },
} as const;

const EXAMPLES: Record<Locale, Example[]> = {
  en: [
    {
      name: "Support Routing",
      typeLabel: "CHOICE",
      state:
        'The customer says: "I was charged twice for my monthly subscription and I need one of the duplicate charges refunded."',
      question: {
        id: "support_route",
        type: "choice",
        instructions: "Which team should handle this customer request?",
        criteria: ["Billing", "Technical", "Account", "Other"],
      },
    },
    {
      name: "Refund Verification",
      typeLabel: "NOUL",
      state:
        "Order 1842 has two settled charges for the same subscription period. The customer asks to reverse one charge.",
      question: {
        id: "refund_supported",
        type: "noul",
        instructions:
          "Does the supplied evidence support that the customer is requesting a duplicate-charge refund?",
      },
    },
    {
      name: "Incident Urgency",
      typeLabel: "SCORE",
      state:
        "Checkout has failed for all customers for 18 minutes. The launch campaign is already live.",
      question: {
        id: "urgency",
        type: "score",
        instructions: "How urgent is this incident?",
        criteria: ["Low", "Moderate", "High", "Critical"],
      },
    },
    {
      name: "Agent Next Action",
      typeLabel: "CHOICE",
      state:
        "The agent needs the current rate-limit settings before it can safely propose a configuration change.",
      question: {
        id: "next_action",
        type: "choice",
        instructions: "What should the agent do next?",
        criteria: ["Read config", "Ask user", "Propose change", "Stop"],
      },
    },
  ],
  zh: [
    {
      name: "客服路由",
      typeLabel: "CHOICE",
      state: "客户表示：我的月度订阅被扣了两次，我需要退回其中一笔重复扣款。",
      question: {
        id: "support_route",
        type: "choice",
        instructions: "哪个团队应该处理这个客户请求？",
        criteria: ["账单", "技术", "账户", "其他"],
      },
    },
    {
      name: "退款核验",
      typeLabel: "NOUL",
      state:
        "订单 1842 在同一订阅周期出现两笔已结算扣款，客户要求撤销其中一笔。",
      question: {
        id: "refund_supported",
        type: "noul",
        instructions: "现有证据是否支持客户正在请求重复扣款退款？",
      },
    },
    {
      name: "事故紧急度",
      typeLabel: "SCORE",
      state: "所有客户的结账已经失败 18 分钟，发布活动正在进行。",
      question: {
        id: "urgency",
        type: "score",
        instructions: "这个事故有多紧急？",
        criteria: ["低", "中等", "高", "严重"],
      },
    },
    {
      name: "智能体下一步",
      typeLabel: "CHOICE",
      state: "智能体必须先读取当前限流设置，才能安全地提出配置变更。",
      question: {
        id: "next_action",
        type: "choice",
        instructions: "智能体下一步应该做什么？",
        criteria: ["读取配置", "询问用户", "提出变更", "停止"],
      },
    },
  ],
  ja: [],
  fr: [],
  pl: [],
};

EXAMPLES.ja = EXAMPLES.en;
EXAMPLES.fr = EXAMPLES.en;
EXAMPLES.pl = EXAMPLES.en;

function cloneQuestion(
  question: PlaygroundQuestionInput,
): PlaygroundQuestionInput {
  return {
    ...question,
    criteria: question.criteria ? [...question.criteria] : undefined,
  };
}
function newQuestion(index: number, locale: Locale): PlaygroundQuestionInput {
  return {
    id: "decision_" + index,
    type: "noul",
    instructions:
      locale === "zh"
        ? "现有上下文是否支持这个判断？"
        : "Is this condition supported by the supplied state?",
  };
}

function answerPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function ProbabilityRows({
  rows,
}: {
  rows: Array<{ label: string; probability: number }>;
}) {
  return (
    <div className="probability-list">
      {rows.map((row) => {
        const percent = answerPercent(row.probability);
        return (
          <div className="probability-row" key={row.label}>
            <div className="probability-meta">
              <span>{row.label}</span>
              <strong>{percent}%</strong>
            </div>
            <div className="probability-track" aria-hidden="true">
              <div
                className="probability-fill"
                style={{ width: String(percent) + "%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnswerCard({
  name,
  answer,
  locale,
}: {
  name: string;
  answer: PlaygroundAnswer;
  locale: Locale;
}) {
  const copy = COPY[locale];

  if (answer.type === "choice") {
    const rows = Object.entries(answer.probabilities ?? {})
      .map(([label, probability]) => ({ label, probability }))
      .sort((a, b) => b.probability - a.probability);

    return (
      <section className="answer-card">
        <div className="answer-kicker">{name}</div>
        <div className="answer-headline">{answer.choice}</div>
        <div className="answer-subtle">
          {answerPercent(answer.confidence)}% {copy.confidence}
        </div>
        <ProbabilityRows rows={rows} />
      </section>
    );
  }

  if (answer.type === "noul") {
    return (
      <section className="answer-card">
        <div className="answer-kicker">{name}</div>
        <div className="answer-headline">
          {answer.noul >= 0.5 ? copy.yes : copy.no}
        </div>
        <ProbabilityRows
          rows={[
            { label: copy.yes, probability: answer.noul },
            { label: copy.no, probability: 1 - answer.noul },
          ]}
        />
      </section>
    );
  }

  const rows = Object.entries(answer.probabilities ?? {})
    .map(([score, probability]) => {
      const legend = answer.legend?.[score];
      return {
        label:
          typeof legend === "string" && legend
            ? score + " — " + legend
            : score,
        probability,
      };
    })
    .sort((a, b) => b.probability - a.probability);

  return (
    <section className="answer-card">
      <div className="answer-kicker">{name}</div>
      <div className="answer-headline">
        {copy.expectedScore}: {answer.score.toFixed(2)}
      </div>
      <div className="answer-subtle">
        {answerPercent(answer.confidence)}% {copy.confidence}
      </div>
      <ProbabilityRows rows={rows} />
    </section>
  );
}

export function JevPlayground({ locale = "en" }: { locale?: Locale }) {
  const copy = COPY[locale];
  const examples = EXAMPLES[locale];
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [state, setState] = useState(examples[0].state);
  const [questions, setQuestions] = useState<PlaygroundQuestionInput[]>([
    cloneQuestion(examples[0].question),
  ]);
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const activeQuestions = useMemo(
    () => (mode === "single" ? questions.slice(0, 1) : questions),
    [mode, questions],
  );

  function loadExample(example: Example) {
    setMode("single");
    setState(example.state);
    setQuestions([cloneQuestion(example.question)]);
    setResult(null);
    setError("");
  }

  function changeMode(next: "single" | "multiple") {
    setMode(next);
    setResult(null);
    setError("");
    if (next === "multiple" && questions.length === 1) {
      setQuestions((current) => [
        current[0],
        {
          id: "supported",
          type: "noul",
          instructions:
            locale === "zh"
              ? "现有上下文是否足以支持这个决策？"
              : "Is the supplied state sufficient to support this decision?",
        },
      ]);
    }
  }

  function updateQuestion(
    index: number,
    patch: Partial<PlaygroundQuestionInput>,
  ) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  function changeType(index: number, type: PlaygroundDecisionType) {
    updateQuestion(index, {
      type,
      criteria:
        type === "choice"
          ? locale === "zh"
            ? ["选项 A", "选项 B", "其他"]
            : ["Option A", "Option B", "Other"]
          : type === "score"
            ? locale === "zh"
              ? ["低", "中等", "高"]
              : ["Low", "Moderate", "High"]
            : undefined,
    });
  }

  function updateCriterion(
    questionIndex: number,
    criterionIndex: number,
    value: string,
  ) {
    const question = questions[questionIndex];
    const criteria = [...(question.criteria ?? [])];
    criteria[criterionIndex] = value;
    updateQuestion(questionIndex, { criteria });
  }

  function addCriterion(questionIndex: number) {
    const question = questions[questionIndex];
    const criteria = [...(question.criteria ?? [])];
    if (criteria.length >= PLAYGROUND_LIMITS.maxCriteria) return;

    criteria.push(
      question.type === "score"
        ? locale === "zh"
          ? "等级 " + criteria.length
          : "Level " + criteria.length
        : locale === "zh"
          ? "选项 " + (criteria.length + 1)
          : "Option " + (criteria.length + 1),
    );
    updateQuestion(questionIndex, { criteria });
  }

  function removeCriterion(questionIndex: number, criterionIndex: number) {
    const question = questions[questionIndex];
    const criteria = [...(question.criteria ?? [])];
    if (criteria.length <= 2) return;
    criteria.splice(criterionIndex, 1);
    updateQuestion(questionIndex, { criteria });
  }

  function addQuestion() {
    if (questions.length >= PLAYGROUND_LIMITS.maxQuestions) return;
    const used = new Set(questions.map((question) => question.id));
    let number = 1;
    while (used.has("decision_" + number)) number += 1;
    setQuestions((current) => [...current, newQuestion(number, locale)]);
  }

  async function runJev() {
    const payload = { state, questions: activeQuestions };
    const validated = validatePlaygroundRequest(payload);
    if (!validated.ok) {
      setError(locale === "en" ? validated.error : copy.invalidInput);
      setResult(null);
      return;
    }

    setRunning(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.value),
      });
      const data = (await response.json().catch(() => ({}))) as
        | PlaygroundResponse
        | { error?: string };

      if (!response.ok || !("answers" in data)) {
        throw new Error(
          "error" in data && data.error ? data.error : copy.requestFailed,
        );
      }

      setResult(data);
      trackEvent("playground_run", {
        question_count: activeQuestions.length,
        mode,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : copy.requestFailed,
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="playground-workspace shell">
      <div className="playground-modebar">
        <div
          className="segmented-control"
          role="group"
          aria-label={copy.decision}
        >
          <button
            type="button"
            className={mode === "single" ? "segment-active" : ""}
            onClick={() => changeMode("single")}
          >
            {copy.single}
          </button>
          <button
            type="button"
            className={mode === "multiple" ? "segment-active" : ""}
            onClick={() => changeMode("multiple")}
          >
            {copy.multiple}
          </button>
        </div>
        <div className="playground-hint">{copy.resultHint}</div>
      </div>

      <div className="example-strip" aria-label={copy.chooseExample}>
        <span className="example-label">{copy.chooseExample}</span>
        <div className="example-list">
          {examples.map((example) => (
            <button
              type="button"
              className="example-chip"
              onClick={() => loadExample(example)}
              key={example.name}
            >
              <span>{example.name}</span>
              <small>{example.typeLabel}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="playground-grid">
        <div className="playground-panel playground-input-panel">
          <div className="panel-label">{copy.input}</div>

          <label className="playground-field">
            <span className="field-title">{copy.state}</span>
            <span className="field-help">{copy.stateHelp}</span>
            <textarea
              value={state}
              maxLength={PLAYGROUND_LIMITS.stateCharacters}
              onChange={(event) => setState(event.target.value)}
              rows={5}
            />
            <span className="character-count">
              {state.length.toLocaleString()} /{" "}
              {PLAYGROUND_LIMITS.stateCharacters.toLocaleString()}
            </span>
          </label>

          <div className="question-stack">
            {activeQuestions.map((question, index) => (
              <section className="question-editor" key={question.id}>
                <div className="question-editor-head">
                  <strong>
                    {copy.questionLabel} {index + 1}
                  </strong>
                  {mode === "multiple" && activeQuestions.length > 1 ? (
                    <button
                      className="text-button"
                      type="button"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter(
                            (_, questionIndex) => questionIndex !== index,
                          ),
                        )
                      }
                    >
                      {copy.removeQuestion}
                    </button>
                  ) : null}
                </div>

                <label className="playground-field">
                  <span className="field-title">{copy.question}</span>
                  <input
                    value={question.instructions}
                    maxLength={PLAYGROUND_LIMITS.questionCharacters}
                    onChange={(event) =>
                      updateQuestion(index, {
                        instructions: event.target.value,
                      })
                    }
                  />
                </label>

                <div className="playground-field">
                  <span className="field-title">{copy.type}</span>
                  <div className="segmented-control decision-types">
                    {(["choice", "noul", "score"] as const).map((type) => (
                      <button
                        type="button"
                        className={
                          question.type === type ? "segment-active" : ""
                        }
                        onClick={() => changeType(index, type)}
                        key={type}
                      >
                        {copy[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {question.type !== "noul" ? (
                  <div className="criteria-editor">
                    <div className="criteria-title">
                      <span className="field-title">
                        {question.type === "choice"
                          ? copy.choices
                          : copy.scale}
                      </span>
                      <span className="small">
                        {(question.criteria ?? []).length} /{" "}
                        {PLAYGROUND_LIMITS.maxCriteria}
                      </span>
                    </div>
                    {(question.criteria ?? []).map(
                      (criterion, criterionIndex) => (
                        <div
                          className="criterion-row"
                          key={String(criterionIndex)}
                        >
                          <span className="criterion-index">
                            {String(criterionIndex + 1).padStart(2, "0")}
                          </span>
                          <input
                            value={criterion}
                            maxLength={PLAYGROUND_LIMITS.criteriaCharacters}
                            onChange={(event) =>
                              updateCriterion(
                                index,
                                criterionIndex,
                                event.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            aria-label={
                              copy.removeQuestion + " " + criterion
                            }
                            disabled={
                              (question.criteria ?? []).length <= 2
                            }
                            onClick={() =>
                              removeCriterion(index, criterionIndex)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ),
                    )}
                    <button
                      className="button-secondary compact-button"
                      type="button"
                      onClick={() => addCriterion(index)}
                      disabled={
                        (question.criteria ?? []).length >=
                        PLAYGROUND_LIMITS.maxCriteria
                      }
                    >
                      + {copy.addOption}
                    </button>
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          {mode === "multiple" ? (
            <button
              className="button-secondary compact-button"
              type="button"
              onClick={addQuestion}
              disabled={
                questions.length >= PLAYGROUND_LIMITS.maxQuestions
              }
            >
              + {copy.addQuestion}
            </button>
          ) : null}

          {error ? (
            <div className="playground-error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            className="button-primary run-button"
            type="button"
            onClick={runJev}
            disabled={running}
          >
            {running ? copy.running : copy.run}
          </button>
        </div>

        <div
          className="playground-panel playground-output-panel"
          aria-live="polite"
        >
          <div className="panel-label">{copy.output}</div>
          {result ? (
            <div className="answer-stack">
              <div className="output-model">
                <span>{copy.result}</span>
                <strong>{result.model}</strong>
              </div>
              {Object.entries(result.answers).map(([name, answer]) => (
                <AnswerCard
                  name={name}
                  answer={answer}
                  locale={locale}
                  key={name}
                />
              ))}
              {result.usage ? (
                <div className="usage-row">
                  <strong>{copy.usage}</strong>
                  <span>
                    {result.usage.input_tokens ?? 0} {copy.inputTokens}
                  </span>
                  <span>
                    {result.usage.output_tokens ?? 0} {copy.outputTokens}
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="output-empty">
              <div className="output-glyph">[ · ]</div>
              <h2>{copy.emptyTitle}</h2>
              <p>{copy.emptyBody}</p>
              <div className="mini-flow" aria-hidden="true">
                <span>{copy.flowInput}</span>
                <b>→</b>
                <span>Jev</span>
                <b>→</b>
                <span>{copy.flowOutput}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
