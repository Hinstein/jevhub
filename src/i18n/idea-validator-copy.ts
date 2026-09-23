import type { Locale } from "@/i18n/config";
import type { IdeaDimensionId, IdeaGoal, IdeaVerdict } from "@/lib/idea-validator";

type GoalCopy = Record<IdeaGoal, { title: string; body: string }>;

export type IdeaValidatorCopy = {
  appLabel: string;
  title: string;
  description: string;
  meta: [string, string, string];
  inputLabel: string;
  placeholder: string;
  characters: string;
  goalLegend: string;
  goals: GoalCopy;
  minError: (min: number) => string;
  genericError: string;
  running: string;
  submit: string;
  privacy: string;
  scoreEyebrow: string;
  verdict: Record<IdeaVerdict, string>;
  bestSignal: string;
  biggestRisk: string;
  tryAnother: string;
  share: string;
  emptyTitle: string;
  emptyBody: string;
  dimensionLabels: Record<IdeaDimensionId, string>;
  howEyebrow: string;
  howTitle: string;
  howBody: string;
  dimensionCards: Array<[string, string]>;
  verdictGuide: Array<[string, IdeaVerdict, string]>;
  limitTitle: string;
  limitBody: string;
  whyTitle: string;
  whyBodyPrefix: string;
  playgroundLink: string;
  buildTitle: string;
  buildBodyPrefix: string;
  templatesLink: string;
  buildBodyMiddle: string;
  quickstartLink: string;
  buildBodySuffix: string;
  shareText: (result: {
    overall: number;
    verdict: IdeaVerdict;
    bestLabel: string;
    bestScore: number;
    riskLabel: string;
    riskScore: number;
  }) => string;
};

export const IDEA_VALIDATOR_COPY: Record<Locale, IdeaValidatorCopy> = {
  en: {
    appLabel: "Free Jev app · No signup",
    title: "Startup Idea Validator",
    description:
      "Describe a startup, SaaS, developer tool, or product idea. Choose what you want from it, then let Jev score eight practical dimensions in one structured decision request.",
    meta: ["8 structured scores", "1 Jev request", "No saved idea history"],
    inputLabel: "Describe your startup or product idea",
    placeholder:
      "Example: A tool that monitors public Reddit discussions for repeated workflow complaints, groups similar pain points, and helps indie developers find product ideas worth researching.",
    characters: "characters",
    goalLegend: "What is your goal?",
    goals: {
      money: { title: "Make money", body: "Score the idea as a product or business." },
      open_source: { title: "Open source", body: "Score adoption, usefulness, and developer appeal." },
      fun: { title: "Just for fun", body: "Score immediate appeal, fun, and shareability." },
    },
    minError: (min) => `Describe the idea in at least ${min} characters.`,
    genericError: "The idea could not be scored right now.",
    running: "Jev is scoring your idea…",
    submit: "Score my idea",
    privacy:
      "No signup. The idea is sent only to the Jev scoring endpoint for this request and is not included in analytics events.",
    scoreEyebrow: "Jev idea score",
    verdict: {
      SHIP: "The description has a strong enough shape to justify a small first build or test.",
      FIX: "There is something here, but the weakest dimensions need a clearer answer first.",
      KILL: "The idea description is missing too many strong signals right now. Rework it before investing much time.",
    },
    bestSignal: "Best signal",
    biggestRisk: "Biggest risk",
    tryAnother: "Try another idea",
    share: "Share result on X",
    emptyTitle: "Eight bounded decisions, one result.",
    emptyBody:
      "Jev scores the idea across eight dimensions, then JevHub computes the weighted total and verdict in normal application code.",
    dimensionLabels: {
      problem: "Problem",
      customer: "Customer",
      demand: "Demand",
      value: "Value",
      reach: "Reach",
      different: "Different",
      buildable: "Buildable",
      shareable: "Shareable",
    },
    howEyebrow: "How the score works",
    howTitle: "Eight questions, then normal application logic.",
    howBody:
      "Jev does not write the final verdict. It scores a fixed set of dimensions from 0 to 4. JevHub converts those scores to 0–100, applies the weights, and computes the final result.",
    dimensionCards: [
      ["Real problem", "Is there a concrete problem or immediate appeal?"],
      ["Clear customer", "Is the intended user specific enough?"],
      ["Demand", "Does the description show existing effort or attention?"],
      ["Value", "Money, adoption, or fun depending on your goal."],
      ["Reach", "Can a small team realistically find the audience?"],
      ["Different", "Is the approach meaningfully distinct?"],
      ["Buildable", "Can one or two developers ship a useful first version?"],
      ["Shareable", "Can users easily explain or recommend the value?"],
    ],
    verdictGuide: [
      ["0–49", "KILL", "Too many important signals are weak in the current description."],
      ["50–64", "FIX", "The shape is plausible, but the weakest dimensions need work."],
      ["65–100", "SHIP", "The description is strong enough to justify a small build or validation test."],
    ],
    limitTitle: "This is an idea evaluation, not market research.",
    limitBody:
      "The tool judges the idea as you describe it. It does not independently verify demand, competitors, regulation, pricing, customer interviews, or willingness to pay.",
    whyTitle: "Why use Jev for this?",
    whyBodyPrefix:
      "This is a bounded scoring problem: the dimensions and score levels are known before the request runs. That makes it a natural example of Jev's structured decision model. If you want to inspect raw Choice, Score, and Noul outputs yourself, open the",
    playgroundLink: "Jev Playground",
    buildTitle: "Build the same pattern",
    buildBodyPrefix:
      "The product layer stays separate from the decision layer: define fixed questions, let Jev return typed scores and probabilities, then keep thresholds and business rules in ordinary code. Browse the",
    templatesLink: "Jev examples and templates",
    buildBodyMiddle: "or read the",
    quickstartLink: "Jev API quickstart",
    buildBodySuffix: "to build your own version.",
    shareText: ({ overall, verdict, bestLabel, bestScore, riskLabel, riskScore }) =>
      `My idea scored ${overall}/100 — ${verdict} on JevHub's Startup Idea Validator.\n\nBest signal: ${bestLabel} ${bestScore}\nBiggest risk: ${riskLabel} ${riskScore}\n\nTry yours:\nhttps://jevhub.xyz/apps/startup-idea-validator`,
  },
  zh: {
    appLabel: "免费 Jev 应用 · 无需注册",
    title: "创业点子评分器",
    description:
      "输入你的创业、SaaS、开发者工具或产品想法，选择目标，让 Jev 在一次结构化决策请求中从 8 个维度进行评分。",
    meta: ["8 个结构化评分", "1 次 Jev 请求", "不保存点子历史"],
    inputLabel: "描述你的创业或产品想法",
    placeholder:
      "例如：监控 Reddit 公开讨论里的重复工作流抱怨，把相似痛点聚类，帮助独立开发者找到值得研究的产品机会。",
    characters: "字符",
    goalLegend: "你的目标是什么？",
    goals: {
      money: { title: "赚钱", body: "按产品或商业项目来评分。" },
      open_source: { title: "开源", body: "重点评估采用价值、实用性和开发者吸引力。" },
      fun: { title: "兴趣项目", body: "重点评估即时吸引力、趣味性和传播性。" },
    },
    minError: (min) => `请至少用 ${min} 个字符描述你的想法。`,
    genericError: "暂时无法完成评分，请稍后再试。",
    running: "Jev 正在评分…",
    submit: "给我的点子评分",
    privacy:
      "无需注册。你的点子只会在本次请求中发送到 Jev 评分接口，不会写入 Analytics 事件。",
    scoreEyebrow: "Jev 点子评分",
    verdict: {
      SHIP: "当前描述已经足够完整，可以考虑做一个小版本或开始验证。",
      FIX: "这个方向有一定基础，但最弱的几个维度需要先说清楚。",
      KILL: "当前描述缺少太多关键证据，建议先重构想法，再投入更多时间。",
    },
    bestSignal: "最强信号",
    biggestRisk: "最大风险",
    tryAnother: "再测一个点子",
    share: "分享到 X",
    emptyTitle: "8 个有边界的判断，得到一个结果。",
    emptyBody:
      "Jev 从 8 个维度评分，JevHub 再用普通程序代码计算加权总分和最终结论。",
    dimensionLabels: {
      problem: "问题",
      customer: "用户",
      demand: "需求",
      value: "价值",
      reach: "触达",
      different: "差异",
      buildable: "可实现",
      shareable: "传播",
    },
    howEyebrow: "评分方式",
    howTitle: "8 个问题，最终结论由普通程序逻辑计算。",
    howBody:
      "Jev 不直接决定最终结论。它只对固定的 8 个维度按 0–4 评分，JevHub 再转换成 0–100、应用权重并计算最终结果。",
    dimensionCards: [
      ["真实问题", "是否存在具体问题，或足够明确的即时吸引力？"],
      ["明确用户", "目标用户是否足够具体？"],
      ["需求", "描述中是否体现用户正在投入时间、金钱或精力解决它？"],
      ["价值", "根据目标评估赚钱、采用价值或趣味性。"],
      ["触达", "小团队是否现实地能找到这些用户？"],
      ["差异", "与明显替代方案相比是否有清晰区别？"],
      ["可实现", "一两名开发者能否做出有用的第一版？"],
      ["传播", "用户是否容易向别人解释或分享它的价值？"],
    ],
    verdictGuide: [
      ["0–49", "KILL", "当前描述里太多关键维度偏弱。"],
      ["50–64", "FIX", "方向有可能成立，但需要先补最弱的部分。"],
      ["65–100", "SHIP", "当前描述足以支持做一个小版本或验证实验。"],
    ],
    limitTitle: "这是点子评估，不是市场调查。",
    limitBody:
      "工具只根据你提供的描述进行判断，不会独立核验市场需求、竞争对手、法规、定价、客户访谈或真实付费意愿。",
    whyTitle: "为什么适合用 Jev？",
    whyBodyPrefix:
      "这是一个边界明确的评分问题：维度和评分等级在请求前已经定义，因此很适合展示 Jev 的结构化决策能力。如果你想直接查看 Choice、Score 和 Noul 的原始输出，可以打开",
    playgroundLink: "Jev Playground",
    buildTitle: "自己也可以用同样模式开发",
    buildBodyPrefix:
      "产品层和决策层分开：先定义固定问题，让 Jev 返回结构化评分和概率，再由普通代码掌握阈值和业务规则。可以查看",
    templatesLink: "Jev 示例与模板",
    buildBodyMiddle: "或阅读",
    quickstartLink: "Jev API 快速入门",
    buildBodySuffix: "来做自己的版本。",
    shareText: ({ overall, verdict, bestLabel, bestScore, riskLabel, riskScore }) =>
      `我的点子在 JevHub Startup Idea Validator 得到 ${overall}/100 — ${verdict}。\n\n最强信号：${bestLabel} ${bestScore}\n最大风险：${riskLabel} ${riskScore}\n\n试试你的：\nhttps://jevhub.xyz/zh-CN/apps/startup-idea-validator`,
  },
  ja: {
    appLabel: "無料 Jev アプリ · 登録不要",
    title: "スタートアップアイデア評価",
    description:
      "スタートアップ、SaaS、開発者ツール、製品アイデアを入力し、目的を選ぶと、Jev が 1 回の構造化リクエストで 8 つの観点を評価します。",
    meta: ["8 つの構造化スコア", "Jev リクエスト 1 回", "アイデア履歴は保存しません"],
    inputLabel: "スタートアップまたは製品アイデアを説明してください",
    placeholder: "例：Reddit の公開投稿から繰り返し出る業務上の不満を集め、似た課題をまとめ、個人開発者が調査すべき製品アイデアを見つけるツール。",
    characters: "文字",
    goalLegend: "目的は何ですか？",
    goals: {
      money: { title: "収益化", body: "製品・ビジネスとして評価します。" },
      open_source: { title: "オープンソース", body: "採用価値、実用性、開発者への魅力を評価します。" },
      fun: { title: "趣味", body: "即時の魅力、楽しさ、共有しやすさを評価します。" },
    },
    minError: (min) => `少なくとも ${min} 文字で説明してください。`,
    genericError: "現在評価できません。もう一度お試しください。",
    running: "Jev が評価しています…",
    submit: "アイデアを評価",
    privacy: "登録不要。入力内容はこの評価リクエストにのみ使用され、Analytics には送信されません。",
    scoreEyebrow: "Jev アイデアスコア",
    verdict: { SHIP: "小さな初期版や検証を進める価値がある形です。", FIX: "可能性はありますが、弱い観点を先に明確にする必要があります。", KILL: "現状の説明では重要な根拠が不足しています。大きく投資する前に見直してください。" },
    bestSignal: "最も強い点",
    biggestRisk: "最大のリスク",
    tryAnother: "別のアイデアを試す",
    share: "X で共有",
    emptyTitle: "8 つの限定された判断から、1 つの結果へ。",
    emptyBody: "Jev が 8 つの観点を評価し、JevHub が通常のコードで加重合計と判定を計算します。",
    dimensionLabels: { problem: "課題", customer: "顧客", demand: "需要", value: "価値", reach: "到達", different: "差別化", buildable: "実現性", shareable: "共有性" },
    howEyebrow: "評価の仕組み",
    howTitle: "8 つの質問、最終判定は通常のアプリロジック。",
    howBody: "Jev は最終判定を書きません。固定された 8 項目を 0〜4 で評価し、JevHub が 0〜100 に変換して重み付けと最終判定を計算します。",
    dimensionCards: [["実在する課題","具体的な課題や即時の魅力があるか。"],["明確な顧客","対象ユーザーが十分具体的か。"],["需要","既に時間・お金・労力を使っている兆候があるか。"],["価値","目的に応じて収益、採用、楽しさを評価。"],["到達","小規模チームが対象に届くか。"],["差別化","既存の代替手段との差が明確か。"],["実現性","1〜2 人で有用な初期版を作れるか。"],["共有性","価値を他人に説明・共有しやすいか。"]],
    verdictGuide: [["0–49","KILL","重要なシグナルが弱すぎます。"],["50–64","FIX","形はありますが弱点を改善する必要があります。"],["65–100","SHIP","小さく作る、または検証する価値があります。"]],
    limitTitle: "これはアイデア評価であり、市場調査ではありません。",
    limitBody: "入力された説明だけを評価し、市場需要、競合、規制、価格、顧客インタビュー、支払い意思を独自に検証しません。",
    whyTitle: "なぜ Jev を使うのか？",
    whyBodyPrefix: "評価軸とスコア段階が事前に定義された限定問題だからです。生の Choice / Score / Noul を確認したい場合は",
    playgroundLink: "Jev Playground",
    buildTitle: "同じパターンを自分で作る",
    buildBodyPrefix: "固定質問を定義し、Jev の型付きスコアと確率を受け取り、しきい値とルールは通常のコードに残します。",
    templatesLink: "Jev の例とテンプレート",
    buildBodyMiddle: "または",
    quickstartLink: "Jev API クイックスタート",
    buildBodySuffix: "を参照してください。",
    shareText: ({ overall, verdict, bestLabel, bestScore, riskLabel, riskScore }) => `JevHub の Idea Validator で ${overall}/100 — ${verdict}。\n\n強み: ${bestLabel} ${bestScore}\nリスク: ${riskLabel} ${riskScore}\n\nhttps://jevhub.xyz/ja-JP/apps/startup-idea-validator`,
  },
  fr: {
    appLabel: "Application Jev gratuite · Sans inscription",
    title: "Validateur d’idée de startup",
    description: "Décrivez une idée de startup, SaaS, outil développeur ou produit. Choisissez votre objectif et Jev évalue huit dimensions en une seule requête structurée.",
    meta: ["8 scores structurés", "1 requête Jev", "Aucun historique enregistré"],
    inputLabel: "Décrivez votre idée de startup ou de produit",
    placeholder: "Exemple : un outil qui repère les plaintes récurrentes dans les discussions Reddit publiques, regroupe les problèmes similaires et aide les indépendants à trouver des idées de produit à étudier.",
    characters: "caractères",
    goalLegend: "Quel est votre objectif ?",
    goals: { money: { title: "Gagner de l’argent", body: "Évaluer l’idée comme produit ou activité." }, open_source: { title: "Open source", body: "Évaluer l’adoption, l’utilité et l’attrait pour les développeurs." }, fun: { title: "Pour le plaisir", body: "Évaluer l’attrait immédiat, le plaisir et le partage." } },
    minError: (min) => `Décrivez l’idée avec au moins ${min} caractères.`,
    genericError: "Impossible d’évaluer l’idée pour le moment.",
    running: "Jev évalue votre idée…",
    submit: "Évaluer mon idée",
    privacy: "Sans inscription. L’idée est envoyée uniquement au point d’évaluation Jev pour cette requête et n’est pas incluse dans les événements Analytics.",
    scoreEyebrow: "Score Jev de l’idée",
    verdict: { SHIP: "La description est assez solide pour justifier une petite première version ou un test.", FIX: "Il y a quelque chose d’intéressant, mais les dimensions les plus faibles doivent être clarifiées.", KILL: "La description manque de signaux importants. Retravaillez l’idée avant d’investir davantage." },
    bestSignal: "Meilleur signal",
    biggestRisk: "Risque principal",
    tryAnother: "Tester une autre idée",
    share: "Partager sur X",
    emptyTitle: "Huit décisions bornées, un résultat.",
    emptyBody: "Jev évalue huit dimensions, puis JevHub calcule le total pondéré et le verdict dans le code de l’application.",
    dimensionLabels: { problem: "Problème", customer: "Client", demand: "Demande", value: "Valeur", reach: "Accès", different: "Différence", buildable: "Faisabilité", shareable: "Partage" },
    howEyebrow: "Comment fonctionne le score",
    howTitle: "Huit questions, puis une logique applicative normale.",
    howBody: "Jev ne rédige pas le verdict final. Il note huit dimensions de 0 à 4 ; JevHub convertit les scores en 0–100, applique les pondérations et calcule le résultat final.",
    dimensionCards: [["Problème réel","Existe-t-il un problème concret ou un attrait immédiat ?"],["Client clair","L’utilisateur visé est-il assez précis ?"],["Demande","La description montre-t-elle déjà des efforts ou de l’attention ?"],["Valeur","Argent, adoption ou plaisir selon l’objectif."],["Accès","Une petite équipe peut-elle atteindre cette audience ?"],["Différence","L’approche est-elle réellement distincte ?"],["Faisabilité","Une ou deux personnes peuvent-elles livrer une première version utile ?"],["Partage","La valeur est-elle facile à expliquer ou recommander ?"]],
    verdictGuide: [["0–49","KILL","Trop de signaux importants sont faibles."],["50–64","FIX","L’idée est plausible, mais ses faiblesses doivent être corrigées."],["65–100","SHIP","La description justifie une petite construction ou un test de validation."]],
    limitTitle: "C’est une évaluation d’idée, pas une étude de marché.",
    limitBody: "L’outil juge l’idée telle que vous la décrivez. Il ne vérifie pas indépendamment la demande, les concurrents, la réglementation, les prix, les entretiens clients ou la volonté de payer.",
    whyTitle: "Pourquoi utiliser Jev ici ?",
    whyBodyPrefix: "Les dimensions et niveaux de score sont définis avant la requête : c’est un problème borné, adapté au modèle de décision structuré de Jev. Pour voir les sorties Choice, Score et Noul, ouvrez le",
    playgroundLink: "Jev Playground",
    buildTitle: "Construire le même modèle",
    buildBodyPrefix: "Définissez des questions fixes, laissez Jev retourner des scores et probabilités typés, puis gardez les seuils et règles métier dans le code. Consultez les",
    templatesLink: "exemples et modèles Jev",
    buildBodyMiddle: "ou le",
    quickstartLink: "démarrage rapide de l’API Jev",
    buildBodySuffix: "pour créer votre propre version.",
    shareText: ({ overall, verdict, bestLabel, bestScore, riskLabel, riskScore }) => `Mon idée a obtenu ${overall}/100 — ${verdict} sur JevHub.\n\nPoint fort : ${bestLabel} ${bestScore}\nRisque : ${riskLabel} ${riskScore}\n\nhttps://jevhub.xyz/fr-FR/apps/startup-idea-validator`,
  },
  pl: {
    appLabel: "Darmowa aplikacja Jev · Bez rejestracji",
    title: "Walidator pomysłu na startup",
    description: "Opisz pomysł na startup, SaaS, narzędzie dla deweloperów lub produkt. Wybierz cel, a Jev oceni osiem wymiarów w jednym ustrukturyzowanym żądaniu.",
    meta: ["8 ustrukturyzowanych ocen", "1 żądanie Jev", "Brak zapisywanej historii"],
    inputLabel: "Opisz pomysł na startup lub produkt",
    placeholder: "Przykład: narzędzie, które śledzi powtarzające się skargi dotyczące pracy w publicznych dyskusjach Reddit, grupuje podobne problemy i pomaga niezależnym twórcom znaleźć pomysły warte zbadania.",
    characters: "znaków",
    goalLegend: "Jaki jest Twój cel?",
    goals: { money: { title: "Zarabiać", body: "Oceń pomysł jako produkt lub biznes." }, open_source: { title: "Open source", body: "Oceń adopcję, użyteczność i atrakcyjność dla deweloperów." }, fun: { title: "Dla zabawy", body: "Oceń natychmiastową atrakcyjność, frajdę i łatwość udostępniania." } },
    minError: (min) => `Opisz pomysł w co najmniej ${min} znakach.`,
    genericError: "Nie można teraz ocenić pomysłu.",
    running: "Jev ocenia pomysł…",
    submit: "Oceń mój pomysł",
    privacy: "Bez rejestracji. Pomysł jest wysyłany tylko do endpointu oceny Jev dla tego żądania i nie trafia do zdarzeń Analytics.",
    scoreEyebrow: "Ocena pomysłu Jev",
    verdict: { SHIP: "Opis jest wystarczająco mocny, aby uzasadnić małą pierwszą wersję lub test.", FIX: "Pomysł ma potencjał, ale najsłabsze wymiary wymagają doprecyzowania.", KILL: "W obecnym opisie brakuje zbyt wielu ważnych sygnałów. Popraw pomysł przed większą inwestycją." },
    bestSignal: "Najmocniejszy sygnał",
    biggestRisk: "Największe ryzyko",
    tryAnother: "Sprawdź inny pomysł",
    share: "Udostępnij na X",
    emptyTitle: "Osiem ograniczonych decyzji, jeden wynik.",
    emptyBody: "Jev ocenia pomysł w ośmiu wymiarach, a JevHub oblicza ważony wynik i werdykt w zwykłym kodzie aplikacji.",
    dimensionLabels: { problem: "Problem", customer: "Klient", demand: "Popyt", value: "Wartość", reach: "Dotarcie", different: "Różnica", buildable: "Wykonalność", shareable: "Udostępnianie" },
    howEyebrow: "Jak działa ocena",
    howTitle: "Osiem pytań, a potem zwykła logika aplikacji.",
    howBody: "Jev nie pisze końcowego werdyktu. Ocenia osiem wymiarów od 0 do 4, a JevHub przelicza wynik na 0–100, stosuje wagi i wylicza rezultat.",
    dimensionCards: [["Rzeczywisty problem","Czy istnieje konkretny problem lub natychmiastowa atrakcyjność?"],["Jasny klient","Czy docelowy użytkownik jest wystarczająco konkretny?"],["Popyt","Czy opis pokazuje istniejący wysiłek, wydatki lub uwagę?"],["Wartość","Pieniądze, adopcja lub zabawa zależnie od celu."],["Dotarcie","Czy mały zespół może realistycznie dotrzeć do odbiorców?"],["Różnica","Czy podejście wyraźnie różni się od alternatyw?"],["Wykonalność","Czy 1–2 osoby mogą zbudować użyteczną pierwszą wersję?"],["Udostępnianie","Czy wartość łatwo wyjaśnić i polecić innym?"]],
    verdictGuide: [["0–49","KILL","Zbyt wiele ważnych sygnałów jest słabych."],["50–64","FIX","Pomysł jest wiarygodny, ale wymaga poprawy najsłabszych wymiarów."],["65–100","SHIP","Opis uzasadnia małą wersję lub test walidacyjny."]],
    limitTitle: "To ocena pomysłu, a nie badanie rynku.",
    limitBody: "Narzędzie ocenia opisany pomysł i nie weryfikuje niezależnie popytu, konkurencji, regulacji, cen, wywiadów z klientami ani gotowości do zapłaty.",
    whyTitle: "Dlaczego Jev?",
    whyBodyPrefix: "Wymiary i poziomy ocen są zdefiniowane przed żądaniem, więc jest to problem ograniczony. Aby zobaczyć surowe wyniki Choice, Score i Noul, otwórz",
    playgroundLink: "Jev Playground",
    buildTitle: "Zbuduj ten sam wzorzec",
    buildBodyPrefix: "Zdefiniuj stałe pytania, odbierz z Jev typowane wyniki i prawdopodobieństwa, a progi i reguły biznesowe trzymaj w zwykłym kodzie. Zobacz",
    templatesLink: "przykłady i szablony Jev",
    buildBodyMiddle: "lub",
    quickstartLink: "szybki start API Jev",
    buildBodySuffix: "aby stworzyć własną wersję.",
    shareText: ({ overall, verdict, bestLabel, bestScore, riskLabel, riskScore }) => `Mój pomysł uzyskał ${overall}/100 — ${verdict} w JevHub.\n\nMocna strona: ${bestLabel} ${bestScore}\nRyzyko: ${riskLabel} ${riskScore}\n\nhttps://jevhub.xyz/pl-PL/apps/startup-idea-validator`,
  },
};
