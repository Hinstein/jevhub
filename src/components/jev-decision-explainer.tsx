import type { Locale } from "@/i18n/config";

const COPY = {
  en: {
    eyebrow: "The basic shape",
    title: "State + typed question → decision + probability",
    state: "State",
    stateBody: "“I was charged twice for my subscription.”",
    question: "Typed question",
    questionBody: "Which team should handle this?",
    result: "Decision",
    resultBody: "Billing",
    distributionLabel: "Probability distribution",
    distributionBody:
      "Each allowed choice can carry a probability that your code can threshold or review.",
    illustrative: "Illustrative example flow — this is not a live Jev response.",
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
    stateBody: "“我的订阅被重复扣款了。”",
    question: "问题",
    questionBody: "哪个团队应该处理这个请求？",
    result: "决策",
    resultBody: "账单",
    distributionLabel: "概率分布",
    distributionBody: "每个允许的选项都可以带有概率，代码可以自行设置阈值或转人工审核。",
    illustrative: "示意流程——这不是实时 Jev 返回结果。",
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
  ja: {
    eyebrow: "基本の流れ",
    title: "State + 型付きの質問 → 判断 + 確率",
    state: "State",
    stateBody: "「サブスクリプションが二重請求されました。」",
    question: "型付きの質問",
    questionBody: "どのチームが対応すべきですか？",
    result: "判断",
    resultBody: "請求",
    distributionLabel: "確率分布",
    distributionBody: "許可された各選択肢に確率を付け、コードで閾値や人による確認を設定できます。",
    illustrative: "説明用の例です。実際の Jev の応答ではありません。",
    primitives: "Jev への 3 種類の質問",
    choice: "Choice",
    choiceBody: "限定された集合から 1 つのラベルを選びます。",
    choiceUse: "ルーティング · 分類 · ツール選択",
    noul: "Noul",
    noulBody: "yes/no の命題が成立する確率を推定します。",
    noulUse: "検証 · 適格性 · 完了確認",
    score: "Score",
    scoreBody: "定義した順序尺度に State を配置します。",
    scoreUse: "緊急度 · リスク · 品質 · 優先度",
    uncertainty: "確率で迷いの大きさを確認できます",
    clear: "明確な判断",
    close: "僅差の判断",
    clearNote: "差が大きい結果は、ポリシーが許せば自動で次の処理に進められます。",
    closeNote: "分布が拮抗している場合は、確認や fallback、人によるレビューの合図になります。",
  },
  fr: {
    eyebrow: "Le principe",
    title: "State + question typée → décision + probabilité",
    state: "State",
    stateBody: "« Mon abonnement a été débité deux fois. »",
    question: "Question typée",
    questionBody: "Quelle équipe doit traiter cette demande ?",
    result: "Décision",
    resultBody: "Facturation",
    distributionLabel: "Distribution des probabilités",
    distributionBody: "Chaque choix autorisé peut recevoir une probabilité que votre code peut seuiller ou faire vérifier. ",
    illustrative: "Flux illustratif — ce n’est pas une réponse Jev en direct.",
    primitives: "Trois façons d’interroger Jev",
    choice: "Choice",
    choiceBody: "Choisir un libellé dans un ensemble fermé.",
    choiceUse: "Routage · classification · choix d’outil",
    noul: "Noul",
    noulBody: "Estimer la probabilité d’une proposition oui/non.",
    noulUse: "Vérification · éligibilité · achèvement",
    score: "Score",
    scoreBody: "Placer le state sur une échelle ordonnée.",
    scoreUse: "Urgence · risque · qualité · priorité",
    uncertainty: "Les probabilités rendent les cas limites visibles",
    clear: "Décision claire",
    close: "Cas limite",
    clearNote: "Un résultat nettement dominant peut être routé automatiquement si votre politique l’autorise.",
    closeNote: "Une distribution proche invite à clarifier, utiliser un fallback ou demander une vérification.",
  },
  pl: {
    eyebrow: "Podstawowy schemat",
    title: "State + typowane pytanie → decyzja + prawdopodobieństwo",
    state: "State",
    stateBody: "„Moja subskrypcja została obciążona dwa razy.”",
    question: "Typowane pytanie",
    questionBody: "Który zespół powinien się tym zająć?",
    result: "Decyzja",
    resultBody: "Rozliczenia",
    distributionLabel: "Rozkład prawdopodobieństwa",
    distributionBody: "Każda dozwolona opcja może mieć prawdopodobieństwo, które kod może progować lub kierować do weryfikacji.",
    illustrative: "Przykładowy przepływ — to nie jest rzeczywista odpowiedź Jev.",
    primitives: "Trzy sposoby zadawania pytań Jev",
    choice: "Choice",
    choiceBody: "Wybierz jedną etykietę ze zbioru zamkniętego.",
    choiceUse: "Routing · klasyfikacja · wybór narzędzia",
    noul: "Noul",
    noulBody: "Oszacuj prawdopodobieństwo tezy tak/nie.",
    noulUse: "Weryfikacja · kwalifikacja · ukończenie",
    score: "Score",
    scoreBody: "Umieść state na uporządkowanej skali.",
    scoreUse: "Pilność · ryzyko · jakość · priorytet",
    uncertainty: "Prawdopodobieństwa pokazują niepewność",
    clear: "Jasna decyzja",
    close: "Wyrównany wynik",
    clearNote: "Wyraźny wynik może być obsłużony automatycznie, jeśli pozwalają na to zasady.",
    closeNote: "Zbliżony rozkład sygnalizuje potrzebę doprecyzowania, fallbacku lub weryfikacji.",
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
  compact = false,
}: {
  locale?: Locale;
  compact?: boolean;
}) {
  const copy = COPY[locale];

  return (
    <div
      className={
        compact ? "jev-explainer jev-explainer-compact" : "jev-explainer"
      }
    >
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
              <i>{
                locale === "zh"
                  ? "账单"
                  : locale === "ja"
                    ? "請求"
                    : locale === "fr"
                      ? "Facturation"
                      : locale === "pl"
                        ? "Rozliczenia"
                        : "Billing"
              }</i>
              <i>{
                locale === "zh"
                  ? "技术"
                  : locale === "ja"
                    ? "技術"
                    : locale === "fr"
                      ? "Technique"
                      : locale === "pl"
                        ? "Techniczne"
                        : "Technical"
              }</i>
              {compact ? (
                <i>{
                  locale === "zh"
                    ? "销售"
                    : locale === "ja"
                      ? "営業"
                      : locale === "fr"
                        ? "Ventes"
                        : locale === "pl"
                          ? "Sprzedaż"
                          : "Sales"
                }</i>
              ) : null}
              <i>{
                locale === "zh"
                  ? "其他"
                  : locale === "ja"
                    ? "その他"
                    : locale === "fr"
                      ? "Autre"
                      : locale === "pl"
                        ? "Inne"
                        : "Other"
              }</i>
            </div>
          </div>
          <div className="decision-flow-symbol">→</div>
          <div className="decision-flow-card decision-flow-result">
            <span>{copy.result}</span>
            <strong>{copy.resultBody}</strong>
            {compact ? (
              <div className="probability-concept">
                <span>{copy.distributionLabel}</span>
                <strong>{copy.distributionBody}</strong>
              </div>
            ) : (
              <StaticProbability label={copy.resultBody} value={94} />
            )}
          </div>
        </div>
        <p className="small">{copy.illustrative}</p>
      </section>

      {!compact ? (
        <>
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
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "账单"
                      : locale === "ja"
                        ? "請求"
                        : locale === "fr"
                          ? "Facturation"
                          : locale === "pl"
                            ? "Rozliczenia"
                            : "Billing"
                  }
                  value={96}
                />
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "技术"
                      : locale === "ja"
                        ? "技術"
                        : locale === "fr"
                          ? "Technique"
                          : locale === "pl"
                            ? "Techniczne"
                            : "Technical"
                  }
                  value={3}
                />
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "其他"
                      : locale === "ja"
                        ? "その他"
                        : locale === "fr"
                          ? "Autre"
                          : locale === "pl"
                            ? "Inne"
                            : "Other"
                  }
                  value={1}
                />
                <p>{copy.clearNote}</p>
              </div>
              <div className="uncertainty-card">
                <div className="eyebrow">{copy.close}</div>
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "账单"
                      : locale === "ja"
                        ? "請求"
                        : locale === "fr"
                          ? "Facturation"
                          : locale === "pl"
                            ? "Rozliczenia"
                            : "Billing"
                  }
                  value={44}
                />
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "技术"
                      : locale === "ja"
                        ? "技術"
                        : locale === "fr"
                          ? "Technique"
                          : locale === "pl"
                            ? "Techniczne"
                            : "Technical"
                  }
                  value={39}
                />
                <StaticProbability
                  label={
                    locale === "zh"
                      ? "其他"
                      : locale === "ja"
                        ? "その他"
                        : locale === "fr"
                          ? "Autre"
                          : locale === "pl"
                            ? "Inne"
                            : "Other"
                  }
                  value={17}
                />
                <p>{copy.closeNote}</p>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
