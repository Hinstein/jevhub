import type { Locale } from "@/i18n/config";
import type { JevTemplate } from "@/types/template";

export type AddedLocale = Exclude<Locale, "en" | "zh">;

type HomeCard = {
  kicker: string;
  title: string;
  description: string;
};

type Faq = {
  question: string;
  answer: string;
};

type PageIntro = {
  eyebrow: string;
  title: string;
  description: string;
};

type IntlCopy = {
  home: {
    intro: PageIntro;
    primaryCta: string;
    secondaryCta: string;
    flowCta: string;
    startEyebrow: string;
    startTitle: string;
    startDescription: string;
    cards: HomeCard[];
    useCasesIntro: PageIntro;
    useCases: Array<[string, string]>;
    examplesIntro: PageIntro;
    seeAllExamples: string;
    pricingIntro: PageIntro;
    inputLabel: string;
    inputDescription: string;
    outputLabel: string;
    outputFree: string;
    outputDescription: string;
    verifiedLabel: string;
    verifiedDescription: string;
    source: string;
    pricingButton: string;
    calculatorButton: string;
    ecosystemIntro: PageIntro;
    ecosystemButton: string;
    faqIntro: PageIntro;
    faq: Faq[];
  };
  playground: {
    intro: PageIntro;
    meta: string[];
    howTitle: string;
    howBody: string;
    continueTitle: string;
    continueBody: string;
    whatLink: string;
    templatesLink: string;
  };
  what: {
    intro: PageIntro;
    callout: string;
    firstHeading: string;
    firstBody: string;
    sdkHeading: string;
    sdkBody: string;
    choiceHeading: string;
    choiceBody: string;
    scoreHeading: string;
    scoreBody: string;
    noulHeading: string;
    noulBody: string;
    useHeading: string;
    useItems: string[];
    avoidHeading: string;
    avoidItems: string[];
    nextHeading: string;
    nextBody: string;
  };
  pricing: {
    intro: PageIntro;
    callout: string;
    currentHeading: string;
    input: string;
    output: string;
    examplesHeading: string;
    examples: string[];
    exampleNote: string;
    tokenHeading: string;
    tokenBody: string;
    sourceHeading: string;
    storeHeading: string;
    storeBody: string;
    calculatorButton: string;
    quickstartButton: string;
  };
  gettingStarted: {
    intro: PageIntro;
    headings: string[];
    paragraphs: string[];
    nextBody: string;
  };
  comparison: {
    intro: PageIntro;
    headers: [string, string, string];
    rows: Array<[string, string, string]>;
    questionHeading: string;
    questionBody: string;
    architectureHeading: string;
    architectureBody: string;
    limitsHeading: string;
    limitsBody: string;
    nextBody: string;
  };
  calculator: {
    intro: PageIntro;
    howHeading: string;
    howBody: string;
    notHeading: string;
    notItems: string[];
    nextBody: string;
  };
  templates: {
    intro: PageIntro;
    callout: string;
    sourceNote: string;
  };
  ecosystem: {
    intro: PageIntro;
    callout: string;
    maintenanceHeading: string;
    maintenanceItems: string[];
    nextBody: string;
  };
  common: {
    playground: string;
    whatIsJev: string;
    quickstart: string;
    pricing: string;
    calculator: string;
    templates: string;
    ecosystem: string;
    storeHeading: string;
    storeBody: string;
    sourceHeading: string;
    nextHeading: string;
    allTemplates: string;
    officialSource: string;
    communitySource: string;
    originalSource: string;
    basic: string;
    intermediate: string;
  };
};

export const INTL_COPY: Record<AddedLocale, IntlCopy> = {
  ja: {
    home: {
      intro: {
        eyebrow: "独立した Jev AI リソース",
        title: "Jev AI — TypeSafe の System One Model",
        description:
          "Jev は構造化された判断のための TypeSafe AI の System One モデルです。自由な文章ではなく、ソフトウェアが直接扱える Choice、Score、Noul と確率を返します。",
      },
      primaryCta: "Jev Playground を試す",
      secondaryCta: "Jev とは？",
      flowCta: "Jev Playground で試す →",
      startEyebrow: "質問から始める",
      startTitle: "次に何を知りたいですか？",
      startDescription: "理解、実験、API 接続、料金確認、実例の中から選べます。",
      cards: [
        { kicker: "理解", title: "Jev AI とは？", description: "System One、型付きの判断、確率、Choice・Score・Noul を理解します。" },
        { kicker: "試す", title: "Jev Playground", description: "構造化された判断をオンラインで実行し、結果と確率分布を確認します。" },
        { kicker: "構築", title: "Jev API クイックスタート", description: "JavaScript SDK をインストールし、API key をサーバーに置いて最初のリクエストを送ります。" },
        { kicker: "料金", title: "Jev 料金と計算機", description: "現在の入力 token 料金を確認し、利用量を見積もります。" },
        { kicker: "実例", title: "Jev の例とテンプレート", description: "限定された判断を作る Choice・Score・Noul の実例をコピーします。" },
      ],
      useCasesIntro: { eyebrow: "Jev AI の用途", title: "Jev AI で何ができますか？", description: "答えの範囲を定義できる判断に向いています。" },
      useCases: [["分類", "定義済みのラベルから 1 つを選ぶ。"], ["ルーティング", "適切なキュー、ツール、ワークフロー分岐へ送る。"], ["スコアリング", "定義した尺度で状態を評価する。"], ["検証", "証拠が yes/no の条件を支えるか推定する。"]],
      examplesIntro: { eyebrow: "Jev の例", title: "空の prompt ではなく、限定された課題から始める。", description: "アプリケーションが結果を使う前に、質問と基準を定義する例です。" },
      seeAllExamples: "8 個の Jev の例を見る",
      pricingIntro: { eyebrow: "Jev の料金", title: "Jev の料金はいくらですか？", description: "共有の料金設定と公式 TypeSafe ソースに基づく現在の情報です。" },
      inputLabel: "入力", inputDescription: "現在の課金単位は入力 token です。", outputLabel: "出力", outputFree: "メーター無料", outputDescription: "詳細と注意点は料金ページをご覧ください。", verifiedLabel: "最終確認", verifiedDescription: "料金は変わる可能性があります。", source: "公式 TypeSafe 料金ソース ↗", pricingButton: "Jev の料金を見る", calculatorButton: "コスト計算機を開く",
      ecosystemIntro: { eyebrow: "エコシステム", title: "Jev のツールと連携を探す。", description: "JevHub は確認したプロジェクトを少数掲載しています。" },
      ecosystemButton: "Jev エコシステムを見る",
      faqIntro: { eyebrow: "Jev AI FAQ", title: "Jev を試す前に開発者がよく聞く質問", description: "" },
      faq: [
        { question: "Jev AI とは？", answer: "Jev は構造化された判断のための TypeSafe AI の System One Model です。型付きの答えと確率を返します。" },
        { question: "Jev は LLM ですか？", answer: "従来の生成型 LLM という意味ではありません。TypeSafe は Jev を、自由な文章生成ではなく型付きの判断のための別のモデルクラスとして説明しています。" },
        { question: "Jev は何に使いますか？", answer: "選択肢を事前に定義できる分類、ルーティング、スコアリング、検証に使えます。" },
        { question: "Jev の料金はいくらですか？", answer: "入力 token の現在の料金は料金ページで確認できます。コスト計算機で利用量も見積もれます。" },
        { question: "Jev API はどう使いますか？", answer: "公式 JavaScript SDK をインストールし、TypeSafe API key をサーバーに置いて型付きリクエストを送ります。" },
        { question: "オンラインで Jev を試せますか？", answer: "はい。Jev Playground で例を実行し、結果を確認できます。" },
      ],
    },
    playground: { intro: { eyebrow: "構造化された判断と確率", title: "Jev Playground", description: "ブラウザーで Jev を試します。コンテキストを入力し、Choice、Noul、Score を選んで結果を確認できます。" }, meta: ["すぐ実行できる例", "単一または複数の質問", "確率分布を確認"], howTitle: "状況を説明し、判断方法を選んで Jev を実行します。", howBody: "例を使うことも、自分の State を入力することもできます。", continueTitle: "Jev の判断方法を理解して、実用的なパターンを選びます。", continueBody: "Jev の仕組みを理解してから、テンプレートを実際の用途に合わせて調整します。", whatLink: "Jev とは？", templatesLink: "テンプレート" },
    what: { intro: { eyebrow: "Jev の基本", title: "Jev とは？", description: "Jev は構造化された判断のための System One Model です。State と型付きの質問を受け取り、固定形式の結果と確率を返します。" }, callout: "Jev はチャットアシスタントではなく、ソフトウェアが分類、判断、スコアリングに使うモデルです。", firstHeading: "まず 1 回実行する", firstBody: "Playground で State、Choice、Noul、Score を編集し、結果と確率を確認できます。", sdkHeading: "同じ考え方を TypeScript で書く", sdkBody: "公式 SDK は State と質問を Jev に送り、固定形式の答えを返します。", choiceHeading: "Choice", choiceBody: "定義済みの選択肢から 1 つを選びます。分類、ルーティング、ツール選択に向いています。", scoreHeading: "Score", scoreBody: "定義した順序尺度で State を評価します。", noulHeading: "Noul", noulBody: "yes/no の命題が成立する確率を返します。", useHeading: "Jev に向いている用途", useItems: ["客服、販売、審査、文書状態の分類。", "定義済みワークフローでのルーティング。", "明確な基準による緊急度や優先度の評価。", "大量の入力を先に絞り込む処理。"], avoidHeading: "Jev に向いていない用途", avoidItems: ["メール、記事、コードなど自由な文章を書くこと。", "自由な発想が必要な生成。", "答えの範囲を事前に定義できない課題。", "権限と業務ルールなしで高リスク操作を承認すること。"], nextHeading: "次のステップ", nextBody: "Playground、API クイックスタート、料金、テンプレートを順に確認できます。" },
    pricing: { intro: { eyebrow: "Jev の料金", title: "Jev の料金", description: "現在の入力 token 料金、出力の扱い、公式ソースを確認できます。" }, callout: "料金は変わる可能性があります。JevHub はサイト全体で 1 つの料金設定を使い、公式ソースへリンクしています。", currentHeading: "現在の料金", input: "入力", output: "出力", examplesHeading: "簡単な例", examples: ["100 万入力 token", "1 億入力 token", "10 億入力 token"], exampleNote: "現在の入力料金で計算した例です。", tokenHeading: "リクエスト数だけでは不十分", tokenBody: "Jev は入力 token で課金されます。State の長さとリクエスト量を合わせて見積もってください。", sourceHeading: "公式ソース", storeHeading: "JevHub Store について", storeBody: "Store は独立した外部サイトです。クリックすると JevHub の情報サイトを離れます。", calculatorButton: "Jev コスト計算機を開く", quickstartButton: "クイックスタートを読む" },
    gettingStarted: { intro: { eyebrow: "Jev API", title: "Jev API クイックスタート", description: "公式 JavaScript SDK をサーバーで使い、TypeSafe API key を設定して最初の型付きリクエストを送ります。" }, headings: ["1. 始める前に", "2. 公式 SDK をインストール", "3. 最初の判断を送る", "4. State とは？", "5. 質問の設計", "よくある間違い", "公式ソース"], paragraphs: ["Node.js 20 以上と TypeSafe API key が必要です。API key はブラウザーではなくサーバーから使います。", "この例では固定されたカテゴリーから問い合わせを分類します。", "State はモデルが判断する情報です。既知の事実は明示的なフィールドで渡します。", "Choice は選択肢、Noul は yes の確率、Score は定義済みの尺度を返します。", "答えを事前に定義できない課題で長文を生成させないでください。API key をブラウザーに置かないでください。"], nextBody: "Playground、テンプレート、コスト計算機、Jev と ChatGPT の比較も確認できます。" },
    comparison: { intro: { eyebrow: "比較", title: "Jev と ChatGPT", description: "Jev は固定された判断を、生成型 LLM は文章やコードを扱います。" }, headers: ["項目", "Jev", "ChatGPT 型 LLM"], rows: [["主な出力", "Choice / Score / Noul の固定形式", "文章、コード、構造化出力、tool calls"], ["自由な文章", "得意ではない", "主な強み"], ["ルーティング", "候補が事前定義されている場合に適する", "prompt や schema の制約が必要なことが多い"], ["説明", "自由な説明文は返さない", "説明、要約、文章を生成できる"], ["プログラム処理", "if / switch に直接つなげやすい", "生成内容そのものが目的のときに使う" ]], questionHeading: "重要なのはどちらが強いかではありません", questionBody: "ワークフローのどの段階で答えを定義でき、どの段階で文章生成が必要かを分けて考えます。", architectureHeading: "実用的な組み合わせ", architectureBody: "入力 → Jev でフィルター / ルーティング / スコアリング → 必要なときだけ生成型 LLM", limitsHeading: "速度と料金について", limitsBody: "ベンチマークはタスク、モデル、State、ネットワーク条件で変わります。単一の数字をすべての用途に外挿しないでください。", nextBody: "Jev の説明、クイックスタート、テンプレートを確認してください。" },
    calculator: { intro: { eyebrow: "無料ツール", title: "Jev コスト計算機", description: "平均入力 token 数とリクエスト量から、Jev の日次、月次、年次コストを見積もります。入力はブラウザー内で処理されます。" }, howHeading: "計算方法", howBody: "平均入力 token 数とリクエスト量を掛け、現在の入力 token 料金を適用します。", notHeading: "計算しないもの", notItems: ["データベース、ログ、キュー、ホスティング費用。", "Jev の周辺で使う生成型モデルの呼び出し。", "将来変更される可能性のある料金。"], nextBody: "Playground、料金説明、API クイックスタート、テンプレートも確認できます。" },
    templates: { intro: { eyebrow: "例とテンプレート", title: "Jev の例と判断テンプレート", description: "Choice、Score、Noul を使った 8 つの実用的な例を確認し、自分のアプリケーションに合わせて調整します。" }, callout: "これらはコピーできるコード例です。まず Playground で試し、実際の業務ルールに合わせて選択肢と閾値を調整してください。", sourceNote: "例とソースの最終確認" },
    ecosystem: { intro: { eyebrow: "エコシステム", title: "Jev エコシステム", description: "公式 SDK、コミュニティクライアント、連携、Agent ツール、Playground を確認した小さなディレクトリです。" }, callout: "プロジェクトを見つけるときは公開リストも参照しますが、掲載前に元のリポジトリやサイトを確認します。", maintenanceHeading: "このディレクトリの維持方法", maintenanceItems: ["公開され、直接確認できるリンクが必要です。", "説明は JevHub が作成し、リストからそのままコピーしません。", "V0.1 では Stars や評価によるランキングを行いません。", "自動転載ではなく、手動で選定します。"], nextBody: "Jev の仕組みを理解するか、8 つの実用テンプレートから始めてください。" },
    common: { playground: "Jev Playground", whatIsJev: "Jev とは？", quickstart: "API クイックスタート", pricing: "料金", calculator: "コスト計算機", templates: "テンプレート", ecosystem: "エコシステム", storeHeading: "JevHub Store", storeBody: "Store は TypeSafe の公式サイトではない独立した外部サイトです。", sourceHeading: "公式ソース", nextHeading: "次のステップ", allTemplates: "すべてのテンプレート", officialSource: "公式", communitySource: "コミュニティ", originalSource: "オリジナル", basic: "基本", intermediate: "応用" },
  },
  fr: {
    home: {
      intro: { eyebrow: "Ressource Jev AI indépendante", title: "Jev AI — le System One Model de TypeSafe", description: "Jev est le modèle System One de TypeSafe AI pour les décisions structurées. Il renvoie des décisions Choice, Score et Noul typées avec des probabilités que les logiciels peuvent utiliser directement." },
      primaryCta: "Essayer Jev Playground", secondaryCta: "Qu’est-ce que Jev ?", flowCta: "Essayer dans Jev Playground →", startEyebrow: "Commencer par sa question", startTitle: "Que voulez-vous faire ensuite ?", startDescription: "Comprendre Jev, l’essayer, connecter l’API, vérifier les tarifs ou parcourir des exemples.",
      cards: [
        { kicker: "Comprendre", title: "Qu’est-ce que Jev AI ?", description: "Découvrez System One, les décisions typées, les probabilités et les primitives Choice, Score et Noul." },
        { kicker: "Essayer", title: "Jev Playground", description: "Exécutez une décision structurée en ligne et inspectez le résultat et sa distribution de probabilités." },
        { kicker: "Construire", title: "Démarrage de l’API Jev", description: "Installez le SDK JavaScript, gardez la clé API côté serveur et envoyez une première requête." },
        { kicker: "Tarifs", title: "Tarifs et calculateur Jev", description: "Consultez le prix actuel des tokens d’entrée et estimez votre utilisation." },
        { kicker: "Exemples", title: "Exemples et modèles Jev", description: "Copiez des modèles Choice, Score et Noul pour des décisions bornées." },
      ],
      useCasesIntro: { eyebrow: "Cas d’usage de Jev AI", title: "Que peut faire Jev AI ?", description: "Jev convient aux décisions dont l’espace de réponse est défini." },
      useCases: [["Classification", "Choisir une étiquette dans un ensemble défini."], ["Routage", "Envoyer une demande vers la bonne file, le bon outil ou la bonne branche."], ["Scoring", "Évaluer un état selon une grille ordonnée."], ["Vérification", "Estimer si les éléments fournis soutiennent une condition oui/non."]],
      examplesIntro: { eyebrow: "Exemples Jev", title: "Commencer par une tâche bornée, pas par un prompt vide.", description: "Ces exemples montrent comment définir les questions et les critères avant d’agir sur un résultat." }, seeAllExamples: "Voir les 8 exemples Jev",
      pricingIntro: { eyebrow: "Tarifs Jev", title: "Combien coûte Jev ?", description: "Le tarif actuel vient d’une configuration partagée et d’une source TypeSafe officielle." }, inputLabel: "Entrée", inputDescription: "Les tokens d’entrée sont l’unité actuellement facturée.", outputLabel: "Sortie", outputFree: "Non facturée au compteur", outputDescription: "Consultez la page des tarifs pour les détails.", verifiedLabel: "Dernière vérification", verifiedDescription: "Les tarifs peuvent évoluer.", source: "Source officielle des tarifs TypeSafe ↗", pricingButton: "Voir les tarifs Jev", calculatorButton: "Ouvrir le calculateur",
      ecosystemIntro: { eyebrow: "Écosystème", title: "Explorer les outils et intégrations Jev.", description: "JevHub sélectionne un petit nombre de projets vérifiés." }, ecosystemButton: "Parcourir l’écosystème Jev",
      faqIntro: { eyebrow: "FAQ Jev AI", title: "Questions fréquentes avant d’essayer Jev", description: "" }, faq: [
        { question: "Qu’est-ce que Jev AI ?", answer: "Jev est le System One Model de TypeSafe AI pour les décisions structurées. Il renvoie des réponses typées et des probabilités." },
        { question: "Jev est-il un LLM ?", answer: "Pas au sens d’un LLM génératif classique. TypeSafe présente Jev comme une autre classe de modèles conçue pour les décisions typées plutôt que pour la génération de texte libre." },
        { question: "À quoi sert Jev ?", answer: "À classifier, router, noter et vérifier des entrées lorsque les résultats possibles sont connus à l’avance." },
        { question: "Combien coûte Jev ?", answer: "Le prix des tokens d’entrée et l’état de la facturation de sortie sont indiqués sur la page des tarifs." },
        { question: "Comment utiliser l’API Jev ?", answer: "Installez le SDK JavaScript officiel, gardez la clé API TypeSafe sur le serveur et envoyez une requête typée." },
        { question: "Puis-je essayer Jev en ligne ?", answer: "Oui. Ouvrez Jev Playground pour exécuter un exemple dans le navigateur." },
      ],
    },
    playground: { intro: { eyebrow: "Décisions structurées, probabilités visibles", title: "Jev Playground", description: "Essayez Jev dans le navigateur. Ajoutez du contexte, choisissez Choice, Noul ou Score, puis inspectez le résultat." }, meta: ["Exemples prêts à l’emploi", "Une ou plusieurs questions", "Distributions visibles"], howTitle: "Décrivez la situation, choisissez le type de décision, puis exécutez Jev.", howBody: "Utilisez un exemple ou écrivez votre propre state. Jev affiche la décision, la confiance et la distribution complète.", continueTitle: "Comprendre les décisions de Jev, puis choisir un modèle pratique.", continueBody: "Lisez ce qu’est Jev, puis adaptez un exemple à votre cas d’usage.", whatLink: "Qu’est-ce que Jev ?", templatesLink: "modèles" },
    what: { intro: { eyebrow: "Le principe de Jev", title: "Qu’est-ce que Jev ?", description: "Jev est un System One Model pour les décisions structurées. Il reçoit un state et des questions typées, puis renvoie un résultat fixe et des probabilités." }, callout: "Jev est un modèle de décision pour les logiciels, pas un assistant de conversation libre.", firstHeading: "Exécuter une première décision", firstBody: "Utilisez Playground pour modifier le state, choisir Choice, Noul ou Score et inspecter le résultat.", sdkHeading: "Exprimer la même logique en TypeScript", sdkBody: "Le SDK officiel envoie le state et les questions à Jev, puis lit une réponse typée.", choiceHeading: "Choice", choiceBody: "Choisir une option dans un ensemble fermé pour classifier, router ou sélectionner un outil.", scoreHeading: "Score", scoreBody: "Évaluer un state selon une échelle définie par votre application.", noulHeading: "Noul", noulBody: "Retourner la probabilité qu’une proposition oui/non soit vraie.", useHeading: "Cas adaptés à Jev", useItems: ["Classer des demandes de support, de vente ou de modération.", "Router une demande dans un workflow défini.", "Noter une urgence ou une priorité selon une grille claire.", "Filtrer un grand volume avant de solliciter un LLM."], avoidHeading: "Cas moins adaptés", avoidItems: ["Écrire des emails, articles, programmes ou explications libres.", "Générer des idées sans espace de réponses défini.", "Traiter une tâche dont les issues ne peuvent pas être définies à l’avance.", "Autoriser une action à risque sans règles ni contrôles d’accès explicites."], nextHeading: "Étape suivante", nextBody: "Essayez Playground, consultez le démarrage de l’API, les tarifs et les modèles." },
    pricing: { intro: { eyebrow: "Tarifs Jev", title: "Tarifs Jev", description: "Consultez le prix actuel des tokens d’entrée, le traitement de la sortie et la source officielle." }, callout: "Les tarifs peuvent évoluer. JevHub utilise une configuration unique et renvoie vers la source TypeSafe officielle.", currentHeading: "Tarifs actuels", input: "Entrée", output: "Sortie", examplesHeading: "Trois exemples", examples: ["1 million de tokens d’entrée", "100 millions de tokens d’entrée", "1 milliard de tokens d’entrée"], exampleNote: "Calculé avec le tarif actuel des tokens d’entrée.", tokenHeading: "Le nombre de requêtes ne suffit pas", tokenBody: "Jev facture les tokens d’entrée. Tenez compte de la longueur moyenne du state et du volume de requêtes.", sourceHeading: "Source officielle", storeHeading: "À propos du JevHub Store", storeBody: "Le Store est un site externe indépendant. Vous quittez le site d’information JevHub en cliquant dessus.", calculatorButton: "Ouvrir le calculateur Jev", quickstartButton: "Lire le démarrage rapide" },
    gettingStarted: { intro: { eyebrow: "API Jev", title: "Démarrage de l’API Jev", description: "Utilisez le SDK JavaScript officiel côté serveur, configurez une clé API TypeSafe et envoyez votre première requête typée." }, headings: ["1. Avant de commencer", "2. Installer le SDK officiel", "3. Envoyer une première décision", "4. Qu’est-ce que le state ?", "5. Concevoir les questions", "Erreurs fréquentes", "Source officielle"], paragraphs: ["Il vous faut Node.js 20 ou plus et une clé API TypeSafe. La clé doit rester côté serveur.", "Cet exemple classe un message dans un ensemble de catégories fermé.", "Le state contient les informations que le modèle doit juger. Passez les faits connus dans des champs explicites.", "Choice sélectionne, Noul renvoie une probabilité oui et Score utilise une échelle définie.", "Ne demandez pas à Jev de générer du texte libre quand les réponses ne sont pas définies. Ne mettez jamais la clé API dans le navigateur."], nextBody: "Continuez avec Playground, les exemples, le calculateur ou la comparaison Jev / ChatGPT." },
    comparison: { intro: { eyebrow: "Comparaison", title: "Jev et ChatGPT", description: "Jev traite des décisions bornées ; un LLM génératif traite le texte, le code et les tâches ouvertes." }, headers: ["Dimension", "Jev", "LLM de type ChatGPT"], rows: [["Sortie principale", "Résultat fixe Choice / Score / Noul", "Texte, code, sortie structurée et tool calls"], ["Écriture libre", "Pas son point fort", "Point fort principal"], ["Routage", "Très adapté avec des candidats définis", "Demande souvent des contraintes de prompt ou de schéma"], ["Explication", "Ne génère pas d’explication libre", "Peut expliquer, résumer et rédiger"], ["Flux logiciel", "Se branche directement sur if / switch", "Utile quand le contenu généré est le livrable"]], questionHeading: "La bonne question n’est pas « lequel est le plus fort ? »", questionBody: "Séparez les étapes dont les réponses sont définissables de celles qui ont vraiment besoin de génération de texte.", architectureHeading: "Une architecture combinée", architectureBody: "Entrée → filtre / routage / scoring Jev → LLM génératif uniquement quand du texte ouvert est nécessaire", limitsHeading: "À propos de la vitesse et du coût", limitsBody: "Les benchmarks dépendent de la tâche, du modèle, de la taille du state et du réseau. N’extrapolez pas un chiffre unique à tous les usages.", nextBody: "Consultez la présentation de Jev, le démarrage de l’API et les modèles." },
    calculator: { intro: { eyebrow: "Outil gratuit", title: "Calculateur de coût Jev", description: "Estimez le coût quotidien, mensuel et annuel de Jev à partir des tokens d’entrée et du volume de requêtes. Les entrées restent dans le navigateur." }, howHeading: "Méthode de calcul", howBody: "Le calculateur multiplie les tokens moyens par requête par le volume, puis applique le tarif actuel des tokens d’entrée.", notHeading: "Ce qui n’est pas estimé", notItems: ["Les coûts de base de données, de logs, de file ou d’hébergement.", "Les appels à des modèles génératifs autour de Jev.", "Les changements de prix futurs après la date de vérification."], nextBody: "Essayez Playground, lisez les tarifs et le démarrage de l’API, puis parcourez les modèles." },
    templates: { intro: { eyebrow: "Exemples et modèles", title: "Exemples et modèles de décision Jev", description: "Parcourez huit exemples pratiques Choice, Score et Noul, puis adaptez-les à votre application." }, callout: "Ces pages sont des exemples de code copiables. Essayez-les dans Playground et adaptez les choix et seuils à vos règles.", sourceNote: "Dernière vérification des exemples et sources" },
    ecosystem: { intro: { eyebrow: "Écosystème", title: "Écosystème Jev", description: "Un petit répertoire de SDK officiels, clients communautaires, intégrations, outils d’agents et Playgrounds vérifiés." }, callout: "Les listes publiques peuvent aider à découvrir des projets, mais chaque entrée est vérifiée sur son dépôt ou son site d’origine.", maintenanceHeading: "Comment le répertoire est maintenu", maintenanceItems: ["Chaque entrée doit avoir un lien public vérifiable.", "Les descriptions sont écrites par JevHub, sans copier une autre liste.", "V0.1 ne classe pas les projets par étoiles ou popularité.", "La sélection est manuelle, sans importation automatique."], nextBody: "Découvrez comment Jev prend des décisions ou commencez avec les huit modèles." },
    common: { playground: "Jev Playground", whatIsJev: "Qu’est-ce que Jev ?", quickstart: "Démarrage de l’API", pricing: "Tarifs", calculator: "Calculateur de coût", templates: "Modèles", ecosystem: "Écosystème", storeHeading: "JevHub Store", storeBody: "Le Store est un site externe indépendant et n’est pas la boutique officielle de TypeSafe.", sourceHeading: "Source officielle", nextHeading: "Étape suivante", allTemplates: "Tous les modèles", officialSource: "Officiel", communitySource: "Communauté", originalSource: "Original", basic: "Débutant", intermediate: "Intermédiaire" },
  },
  pl: {
    home: {
      intro: { eyebrow: "Niezależne źródło Jev AI", title: "Jev AI — System One Model firmy TypeSafe", description: "Jev to model System One firmy TypeSafe AI do ustrukturyzowanych decyzji. Zwraca typowane decyzje Choice, Score i Noul oraz prawdopodobieństwa, które aplikacja może wykorzystać bezpośrednio." },
      primaryCta: "Wypróbuj Jev Playground", secondaryCta: "Czym jest Jev?", flowCta: "Wypróbuj w Jev Playground →", startEyebrow: "Zacznij od swojego pytania", startTitle: "Co chcesz zrobić dalej?", startDescription: "Poznaj Jev, uruchom przykład, podłącz API, sprawdź ceny lub przejrzyj wzorce.",
      cards: [
        { kicker: "Poznaj", title: "Czym jest Jev AI?", description: "Poznaj System One, typowane decyzje, prawdopodobieństwa oraz Choice, Score i Noul." },
        { kicker: "Wypróbuj", title: "Jev Playground", description: "Uruchom ustrukturyzowaną decyzję online i zobacz wynik oraz rozkład prawdopodobieństwa." },
        { kicker: "Zbuduj", title: "Szybki start Jev API", description: "Zainstaluj SDK JavaScript, trzymaj klucz API na serwerze i wyślij pierwsze żądanie." },
        { kicker: "Cena", title: "Cennik i kalkulator Jev", description: "Sprawdź bieżącą cenę tokenów wejściowych i oszacuj użycie." },
        { kicker: "Przykłady", title: "Przykłady i wzorce Jev", description: "Skopiuj wzorce Choice, Score i Noul dla ograniczonych decyzji." },
      ],
      useCasesIntro: { eyebrow: "Zastosowania Jev AI", title: "Co potrafi Jev AI?", description: "Jev nadaje się do decyzji, dla których można zdefiniować przestrzeń odpowiedzi." },
      useCases: [["Klasyfikacja", "Wybierz etykietę ze zdefiniowanego zbioru."], ["Routing", "Wyślij żądanie do właściwej kolejki, narzędzia lub gałęzi procesu."], ["Ocena", "Oceń stan według uporządkowanej skali."], ["Weryfikacja", "Oszacuj, czy dowody wspierają warunek tak/nie."]],
      examplesIntro: { eyebrow: "Przykłady Jev", title: "Zacznij od ograniczonego zadania, nie od pustego promptu.", description: "Przykłady pokazują, jak zdefiniować pytania i kryteria przed użyciem wyniku przez aplikację." }, seeAllExamples: "Zobacz wszystkie 8 przykładów",
      pricingIntro: { eyebrow: "Cennik Jev", title: "Ile kosztuje Jev?", description: "Bieżąca stawka pochodzi ze wspólnej konfiguracji i oficjalnego źródła TypeSafe." }, inputLabel: "Wejście", inputDescription: "Tokeny wejściowe są obecnie rozliczaną jednostką.", outputLabel: "Wyjście", outputFree: "Bez opłaty za licznik", outputDescription: "Szczegóły i ograniczenia znajdziesz na stronie cennika.", verifiedLabel: "Ostatnia weryfikacja", verifiedDescription: "Ceny mogą się zmienić.", source: "Oficjalne źródło cen TypeSafe ↗", pricingButton: "Zobacz cennik Jev", calculatorButton: "Otwórz kalkulator",
      ecosystemIntro: { eyebrow: "Ekosystem", title: "Poznaj narzędzia i integracje Jev.", description: "JevHub prezentuje niewielki zestaw sprawdzonych projektów." }, ecosystemButton: "Przeglądaj ekosystem Jev",
      faqIntro: { eyebrow: "Jev AI FAQ", title: "Pytania przed wypróbowaniem Jev", description: "" }, faq: [
        { question: "Czym jest Jev AI?", answer: "Jev to System One Model firmy TypeSafe AI do ustrukturyzowanych decyzji. Zwraca typowane odpowiedzi i prawdopodobieństwa." },
        { question: "Czy Jev jest LLM-em?", answer: "Nie w konwencjonalnym, generatywnym sensie. TypeSafe opisuje Jev jako inną klasę modeli przeznaczoną do typowanych decyzji, a nie otwartego generowania tekstu." },
        { question: "Do czego służy Jev?", answer: "Do klasyfikacji, routingu, oceniania i weryfikacji, gdy możliwe wyniki są znane z góry." },
        { question: "Ile kosztuje Jev?", answer: "Bieżącą cenę tokenów wejściowych i sposób rozliczania wyjścia znajdziesz na stronie cennika." },
        { question: "Jak używać Jev API?", answer: "Zainstaluj oficjalne SDK JavaScript, trzymaj klucz API TypeSafe na serwerze i wyślij typowane żądanie." },
        { question: "Czy mogę wypróbować Jev online?", answer: "Tak. Otwórz Jev Playground i uruchom przykład w przeglądarce." },
      ],
    },
    playground: { intro: { eyebrow: "Ustrukturyzowane decyzje, widoczne prawdopodobieństwa", title: "Jev Playground", description: "Wypróbuj Jev w przeglądarce. Dodaj kontekst, wybierz Choice, Noul lub Score i sprawdź wynik." }, meta: ["Gotowe przykłady", "Jedno lub wiele pytań", "Widoczne rozkłady prawdopodobieństwa"], howTitle: "Opisz sytuację, wybierz typ decyzji i uruchom Jev.", howBody: "Użyj gotowego przykładu albo wpisz własny state. Jev pokaże decyzję, pewność i pełny rozkład.", continueTitle: "Poznaj sposób podejmowania decyzji przez Jev, a potem wybierz wzorzec.", continueBody: "Przeczytaj, czym jest Jev, i dopasuj przykład do swojego przypadku.", whatLink: "Czym jest Jev?", templatesLink: "wzorce" },
    what: { intro: { eyebrow: "Podstawy Jev", title: "Czym jest Jev?", description: "Jev to System One Model do ustrukturyzowanych decyzji. Otrzymuje State i typowane pytania, a zwraca stały format odpowiedzi i prawdopodobieństwa." }, callout: "Jev jest modelem decyzji dla oprogramowania, a nie otwartym asystentem konwersacyjnym.", firstHeading: "Uruchom pierwszą decyzję", firstBody: "W Playground edytuj State, wybierz Choice, Noul lub Score i zobacz wynik.", sdkHeading: "Zapisz tę samą logikę w TypeScript", sdkBody: "Oficjalne SDK wysyła State i pytania do Jev, a następnie odczytuje typowaną odpowiedź.", choiceHeading: "Choice", choiceBody: "Wybierz jedną opcję ze zbioru zamkniętego do klasyfikacji, routingu lub wyboru narzędzia.", scoreHeading: "Score", scoreBody: "Oceń State według skali zdefiniowanej przez aplikację.", noulHeading: "Noul", noulBody: "Zwróć prawdopodobieństwo prawdziwości tezy tak/nie.", useHeading: "Do czego pasuje Jev", useItems: ["Klasyfikowanie spraw obsługi, sprzedaży i moderacji.", "Routing żądań w zdefiniowanym workflow.", "Ocena pilności i priorytetu według jasnej skali.", "Filtrowanie dużej liczby danych przed użyciem LLM."], avoidHeading: "Do czego Jev nie pasuje", avoidItems: ["Pisanie maili, artykułów, kodu i swobodnych wyjaśnień.", "Generowanie kreatywne bez zdefiniowanej przestrzeni odpowiedzi.", "Zadania, których możliwych wyników nie da się opisać z góry.", "Zatwierdzanie ryzykownych działań bez reguł i kontroli uprawnień."], nextHeading: "Następny krok", nextBody: "Wypróbuj Playground, przeczytaj szybki start API, cennik i wzorce." },
    pricing: { intro: { eyebrow: "Cennik Jev", title: "Cennik Jev", description: "Sprawdź bieżącą cenę tokenów wejściowych, sposób rozliczania wyjścia i oficjalne źródło." }, callout: "Ceny mogą się zmienić. JevHub używa jednej konfiguracji cen i linkuje do oficjalnego źródła TypeSafe.", currentHeading: "Bieżące ceny", input: "Wejście", output: "Wyjście", examplesHeading: "Trzy przykłady", examples: ["1 mln tokenów wejściowych", "100 mln tokenów wejściowych", "1 mld tokenów wejściowych"], exampleNote: "Przykład obliczony według bieżącej ceny tokenów wejściowych.", tokenHeading: "Sama liczba żądań nie wystarczy", tokenBody: "Jev rozlicza tokeny wejściowe. Uwzględnij długość State i wolumen żądań.", sourceHeading: "Oficjalne źródło", storeHeading: "O JevHub Store", storeBody: "Store to niezależna strona zewnętrzna. Kliknięcie opuszcza serwis informacyjny JevHub.", calculatorButton: "Otwórz kalkulator Jev", quickstartButton: "Przeczytaj szybki start" },
    gettingStarted: { intro: { eyebrow: "Jev API", title: "Szybki start Jev API", description: "Użyj oficjalnego SDK JavaScript na serwerze, ustaw klucz API TypeSafe i wyślij pierwsze typowane żądanie." }, headings: ["1. Zanim zaczniesz", "2. Zainstaluj oficjalne SDK", "3. Wyślij pierwszą decyzję", "4. Czym jest State?", "5. Projektowanie pytań", "Częste błędy", "Oficjalne źródło"], paragraphs: ["Potrzebujesz Node.js 20+ i klucza API TypeSafe. Klucz powinien pozostać na serwerze.", "Ten przykład klasyfikuje wiadomość do zamkniętego zbioru kategorii.", "State zawiera informacje, które model ma ocenić. Znane fakty przekazuj w jawnych polach.", "Choice wybiera, Noul zwraca prawdopodobieństwo tak, a Score używa zdefiniowanej skali.", "Nie proś Jev o swobodny tekst, gdy odpowiedzi nie są zdefiniowane. Nigdy nie umieszczaj klucza API w przeglądarce."], nextBody: "Następnie wypróbuj Playground, przykłady, kalkulator lub porównanie Jev z ChatGPT." },
    comparison: { intro: { eyebrow: "Porównanie", title: "Jev i ChatGPT", description: "Jev obsługuje ograniczone decyzje, a generatywny LLM tekst, kod i otwarte zadania." }, headers: ["Wymiar", "Jev", "LLM typu ChatGPT"], rows: [["Główne wyjście", "Stały wynik Choice / Score / Noul", "Tekst, kod, ustrukturyzowane wyjście i tool calls"], ["Swobodne pisanie", "Nie jest do tego przeznaczony", "Główna zaleta"], ["Routing", "Dobry przy zdefiniowanych kandydatach", "Często wymaga ograniczeń promptu lub schematu"], ["Wyjaśnienia", "Nie generuje swobodnych wyjaśnień", "Może wyjaśniać, streszczać i pisać"], ["Przepływ programu", "Można podłączyć bezpośrednio do if / switch", "Przydatny, gdy generowana treść jest wynikiem"]], questionHeading: "Nie pytaj tylko, który model jest silniejszy", questionBody: "Oddziel kroki, których odpowiedzi można zdefiniować, od tych, które naprawdę potrzebują generowania tekstu.", architectureHeading: "Praktyczne połączenie", architectureBody: "Wejście → filtrowanie / routing / ocena Jev → generatywny LLM tylko wtedy, gdy potrzebny jest otwarty tekst", limitsHeading: "O szybkości i kosztach", limitsBody: "Benchmarki zależą od zadania, modelu, wielkości State i sieci. Nie przenoś jednej liczby na wszystkie zastosowania.", nextBody: "Przeczytaj opis Jev, szybki start API i wzorce." },
    calculator: { intro: { eyebrow: "Darmowe narzędzie", title: "Kalkulator kosztu Jev", description: "Oszacuj dzienny, miesięczny i roczny koszt Jev na podstawie tokenów wejściowych i wolumenu żądań. Dane pozostają w przeglądarce." }, howHeading: "Jak działa obliczenie", howBody: "Kalkulator mnoży średnią liczbę tokenów na żądanie przez wolumen i stosuje bieżącą stawkę tokenów wejściowych.", notHeading: "Czego nie szacuje", notItems: ["Kosztów bazy danych, logów, kolejek i hostingu.", "Wywołań modeli generatywnych używanych obok Jev.", "Przyszłych zmian ceny po dacie weryfikacji."], nextBody: "Wypróbuj Playground, przeczytaj cennik i szybki start API, a następnie przejrzyj wzorce." },
    templates: { intro: { eyebrow: "Przykłady i wzorce", title: "Przykłady i wzorce decyzji Jev", description: "Przejrzyj osiem praktycznych przykładów Choice, Score i Noul i dopasuj je do swojej aplikacji." }, callout: "To przykłady kodu do skopiowania. Wypróbuj je w Playground i dopasuj opcje oraz progi do swoich reguł.", sourceNote: "Ostatnia weryfikacja przykładów i źródeł" },
    ecosystem: { intro: { eyebrow: "Ekosystem", title: "Ekosystem Jev", description: "Mały katalog sprawdzonych oficjalnych SDK, klientów społecznościowych, integracji, narzędzi Agent i Playgroundów." }, callout: "Publiczne listy pomagają odkrywać projekty, ale każdy wpis jest sprawdzany w oryginalnym repozytorium lub serwisie.", maintenanceHeading: "Jak utrzymujemy katalog", maintenanceItems: ["Każdy wpis musi mieć publiczny, możliwy do sprawdzenia link.", "Opisy tworzy JevHub, bez kopiowania z innych list.", "V0.1 nie rankinguje projektów według gwiazdek ani popularności.", "Wybór jest ręczny, bez automatycznego importu."], nextBody: "Poznaj sposób podejmowania decyzji przez Jev albo zacznij od ośmiu wzorców." },
    common: { playground: "Jev Playground", whatIsJev: "Czym jest Jev?", quickstart: "Szybki start API", pricing: "Cennik", calculator: "Kalkulator kosztu", templates: "Wzorce", ecosystem: "Ekosystem", storeHeading: "JevHub Store", storeBody: "Store to niezależna strona zewnętrzna, nieoficjalny sklep TypeSafe.", sourceHeading: "Oficjalne źródło", nextHeading: "Następny krok", allTemplates: "Wszystkie wzorce", officialSource: "Oficjalne", communitySource: "Społeczność", originalSource: "Oryginalne", basic: "Podstawowe", intermediate: "Średniozaawansowane" },
  },
};

export const INTL_PAGE_METADATA: Record<
  AddedLocale,
  Record<string, { title: string; description: string }>
> = {
  ja: {
    "/": { title: "Jev AI：Playground、API、料金と例", description: "TypeSafe AI の Jev System One Model を学び、試し、API と実例を確認する独立ガイド。" },
    "/playground": { title: "Jev Playground：型付き AI 判断を試す", description: "Choice、Noul、Score の Jev 判断をブラウザーで試し、確率分布を確認します。" },
    "/what-is-jev": { title: "Jev とは？TypeSafe AI の System One を解説", description: "Jev が State と型付き質問から固定形式の判断と確率を返す仕組みを説明します。" },
    "/pricing": { title: "Jev 料金：入力 token とコスト計算機", description: "Jev の現在の入力 token 料金、出力の扱い、公式ソースを確認します。" },
    "/getting-started": { title: "Jev API クイックスタート：API key と JavaScript SDK", description: "公式 JavaScript SDK でサーバーから Jev API を使う方法を説明します。" },
    "/jev-vs-chatgpt": { title: "Jev と ChatGPT：使い分け", description: "Jev と生成型 LLM がワークフローのどの部分に向くかを比較します。" },
    "/tools/jev-cost-calculator": { title: "Jev コスト計算機：token コストを見積もる", description: "入力 token 数、リクエスト量、現在の料金から Jev の利用コストを見積もります。" },
    "/templates": { title: "Jev の例とテンプレート：Choice、Score、Noul", description: "Choice、Score、Noul を使った 8 つの実用的な Jev 判断例を確認します。" },
    "/ecosystem": { title: "Jev エコシステム：SDK、連携、ツール", description: "確認済みの Jev SDK、連携、Agent ツール、Playground を紹介します。" },
  },
  fr: {
    "/": { title: "Jev AI : Playground, API, tarifs et exemples", description: "Guide indépendant pour découvrir, essayer et utiliser le System One Model Jev de TypeSafe AI." },
    "/playground": { title: "Jev Playground : essayer les décisions IA typées", description: "Essayez les décisions Choice, Noul et Score de Jev dans le navigateur et inspectez les probabilités." },
    "/what-is-jev": { title: "Qu’est-ce que Jev ? Le System One de TypeSafe AI", description: "Comprendre comment Jev transforme un state et des questions typées en décisions et probabilités." },
    "/pricing": { title: "Tarifs Jev : tokens d’entrée et calculateur", description: "Consultez le prix actuel des tokens d’entrée, la sortie et la source officielle de Jev." },
    "/getting-started": { title: "Démarrage de l’API Jev : clé API et SDK JavaScript", description: "Utiliser l’API Jev côté serveur avec le SDK JavaScript officiel." },
    "/jev-vs-chatgpt": { title: "Jev et ChatGPT : quand utiliser chacun", description: "Comparer Jev et les LLM génératifs dans un workflow logiciel." },
    "/tools/jev-cost-calculator": { title: "Calculateur de coût Jev : estimer les tokens", description: "Estimez le coût Jev selon les tokens d’entrée, le volume de requêtes et le tarif actuel." },
    "/templates": { title: "Exemples et modèles Jev : Choice, Score et Noul", description: "Parcourez huit exemples pratiques de décisions Jev pour des tâches bornées." },
    "/ecosystem": { title: "Écosystème Jev : SDK, intégrations et outils", description: "Un répertoire vérifié de SDK Jev, intégrations, outils d’agents et Playgrounds." },
  },
  pl: {
    "/": { title: "Jev AI: Playground, API, cennik i przykłady", description: "Niezależny przewodnik po System One Model Jev firmy TypeSafe AI: poznaj go, wypróbuj i użyj w API." },
    "/playground": { title: "Jev Playground: wypróbuj typowane decyzje AI", description: "Uruchom decyzje Choice, Noul i Score w przeglądarce i zobacz rozkład prawdopodobieństwa." },
    "/what-is-jev": { title: "Czym jest Jev? System One firmy TypeSafe AI", description: "Dowiedz się, jak Jev zamienia State i typowane pytania w decyzje oraz prawdopodobieństwa." },
    "/pricing": { title: "Cennik Jev: tokeny wejściowe i kalkulator", description: "Sprawdź bieżącą cenę tokenów wejściowych, wyjście i oficjalne źródło Jev." },
    "/getting-started": { title: "Szybki start Jev API: klucz API i SDK JavaScript", description: "Używaj Jev API po stronie serwera z oficjalnym SDK JavaScript." },
    "/jev-vs-chatgpt": { title: "Jev i ChatGPT: kiedy używać którego", description: "Porównanie Jev i generatywnych LLM w przepływach oprogramowania." },
    "/tools/jev-cost-calculator": { title: "Kalkulator kosztu Jev: oszacuj tokeny", description: "Oszacuj koszt Jev na podstawie tokenów wejściowych, wolumenu żądań i bieżącej ceny." },
    "/templates": { title: "Przykłady i wzorce Jev: Choice, Score i Noul", description: "Przejrzyj osiem praktycznych przykładów decyzji Jev dla ograniczonych zadań." },
    "/ecosystem": { title: "Ekosystem Jev: SDK, integracje i narzędzia", description: "Sprawdzony katalog SDK Jev, integracji, narzędzi Agent i Playgroundów." },
  },
};

const TEMPLATE_SUMMARIES: Record<
  AddedLocale,
  Record<string, { title: string; description: string }>
> = {
  ja: {
    "refund-detection": { title: "返金依頼の検出", description: "顧客が返金を求めているかを識別し、分類結果を返金承認と混同しない例です。" },
    "support-routing": { title: "サポートルーティング", description: "問い合わせを主なサポートキューへ送り、対応の緊急度も評価します。" },
    "lead-qualification": { title: "リードの選別", description: "販売機会と協業、サポート、スパム、不明な問い合わせを区別します。" },
    "buying-intent": { title: "購入意向", description: "具体的な評価・購入行動と曖昧な興味を区別します。" },
    "spam-detection": { title: "スパム検出", description: "問い合わせフォームの広告や無関係な宣伝を識別します。" },
    "agent-router": { title: "Agent ルーター", description: "定義済みワークフローから次の Agent または tool を選択します。" },
    "task-completion": { title: "タスク完了の確認", description: "tool の結果と最終状態から Agent の完了主張を確認します。" },
    "content-moderation": { title: "コンテンツモデレーション", description: "定義済みの安全カテゴリでコンテンツを分類し、レビューが必要なものを見つけます。" },
  },
  fr: {
    "refund-detection": { title: "Détection de demande de remboursement", description: "Identifier une demande de remboursement sans transformer la classification en autorisation." },
    "support-routing": { title: "Routage du support", description: "Router une demande vers une file support et évaluer son urgence." },
    "lead-qualification": { title: "Qualification des leads", description: "Séparer les opportunités commerciales du support, des partenariats, du spam et de l’incertain." },
    "buying-intent": { title: "Intention d’achat", description: "Distinguer une évaluation ou un achat concret d’un intérêt vague." },
    "spam-detection": { title: "Détection du spam", description: "Identifier les promotions non sollicitées dans un formulaire de contact." },
    "agent-router": { title: "Routeur d’agents", description: "Choisir le prochain agent ou outil dans un workflow borné." },
    "task-completion": { title: "Vérification de fin de tâche", description: "Vérifier la déclaration de fin d’un agent avec les preuves disponibles." },
    "content-moderation": { title: "Modération de contenu", description: "Classer un contenu selon des catégories de sécurité définies et repérer les cas à revoir." },
  },
  pl: {
    "refund-detection": { title: "Wykrywanie prośby o zwrot", description: "Rozpoznaj prośbę o zwrot bez traktowania klasyfikacji jako autoryzacji zwrotu." },
    "support-routing": { title: "Routing obsługi", description: "Skieruj sprawę do kolejki obsługi i oceń jej pilność." },
    "lead-qualification": { title: "Kwalifikacja leadów", description: "Oddziel szanse sprzedażowe od wsparcia, partnerstw, spamu i niejasnych wiadomości." },
    "buying-intent": { title: "Intencja zakupu", description: "Odróżnij konkretną ocenę lub zakup od ogólnego zainteresowania." },
    "spam-detection": { title: "Wykrywanie spamu", description: "Rozpoznaj niezamówione reklamy w formularzu kontaktowym." },
    "agent-router": { title: "Router Agentów", description: "Wybierz następnego agenta lub tool w ograniczonym workflow." },
    "task-completion": { title: "Sprawdzenie ukończenia zadania", description: "Zweryfikuj deklarację ukończenia zadania na podstawie dostępnych dowodów." },
    "content-moderation": { title: "Moderacja treści", description: "Klasyfikuj treść według zdefiniowanych kategorii bezpieczeństwa i znajdź przypadki do sprawdzenia." },
  },
};

export const INTL_CATEGORY_LABELS: Record<AddedLocale, Record<string, string>> = {
  ja: { support: "サポート", sales: "営業", agents: "Agent", safety: "安全とコミュニティ" },
  fr: { support: "Support", sales: "Ventes", agents: "Agents", safety: "Sécurité et communauté" },
  pl: { support: "Obsługa", sales: "Sprzedaż", agents: "Agenci", safety: "Bezpieczeństwo i społeczność" },
};

export const INTL_ECOSYSTEM_CATEGORY_LABELS: Record<AddedLocale, Record<string, string>> = {
  ja: { Official: "公式", SDKs: "SDK", Integrations: "連携", Playgrounds: "Playground", "Agent / Tooling": "Agent / ツール", "Open Source / Research": "オープンソース / 研究" },
  fr: { Official: "Officiel", SDKs: "SDK", Integrations: "Intégrations", Playgrounds: "Playgrounds", "Agent / Tooling": "Agents / outils", "Open Source / Research": "Open source / recherche" },
  pl: { Official: "Oficjalne", SDKs: "SDK", Integrations: "Integracje", Playgrounds: "Playgroundy", "Agent / Tooling": "Agenci / narzędzia", "Open Source / Research": "Open source / badania" },
};

export function localizedIntlTemplate(template: JevTemplate, locale: AddedLocale) {
  const summary = TEMPLATE_SUMMARIES[locale][template.slug];
  return summary ? { ...template, ...summary } : template;
}

export function localizedIntlCategory(category: string, locale: AddedLocale) {
  return INTL_CATEGORY_LABELS[locale][category] ?? category;
}

export function localizedIntlEcosystemCategory(category: string, locale: AddedLocale) {
  return INTL_ECOSYSTEM_CATEGORY_LABELS[locale][category] ?? category;
}
