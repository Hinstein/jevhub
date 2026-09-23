import type { Locale } from "@/i18n/config";
import type { InboxQueue, MessageType } from "@/lib/inbox-triage";

export type InboxTriageCopy = {
  title: string;
  description: string;
  eyebrow: string;
  meta: [string, string, string];
  sampleTitle: string;
  sampleBody: string;
  sampleButton: string;
  samplesLabel: string;
  customTitle: string;
  customBody: string;
  customPlaceholder: string;
  customButton: string;
  customOpen: string;
  customClose: string;
  privacy: string;
  resultTitle: string;
  resultDescription: string;
  loading: string;
  error: string;
  retry: string;
  details: string;
  typeLabel: string;
  replyLabel: string;
  timeLabel: string;
  typeConfidence: string;
  timeConfidence: string;
  noReply: string;
  howTitle: string;
  howBody: string;
  limitTitle: string;
  limitBody: string;
  learnTitle: string;
  learnBody: string;
  playgroundLink: string;
  templateLink: string;
  queues: Record<InboxQueue, { title: string; description: string }>;
  types: Record<MessageType, string>;
};

const en: InboxTriageCopy = {
  title: "Inbox Triage with Jev",
  description: "See six example emails sorted into Needs reply, Review, and Read later in one Jev request. Then try one message of your own. No signup or Gmail connection.",
  eyebrow: "Real App · Live Jev demo",
  meta: ["Six sample emails", "One Jev request", "No inbox connection"],
  sampleTitle: "Start with a sample inbox",
  sampleBody: "The six messages below are synthetic. Run Jev to see how each type, reply request, and time signal becomes a suggested queue.",
  sampleButton: "Sort sample inbox",
  samplesLabel: "Sample messages",
  customTitle: "Try one of your own",
  customBody: "Paste the sender, subject, and body as plain text. One message, up to 3,000 characters.",
  customPlaceholder: "From: …\nSubject: …\n\nMessage text…",
  customButton: "Sort this message",
  customOpen: "Try my own email",
  customClose: "Close custom input",
  privacy: "Your text is sent to JevHub and TypeSafe AI for this request. Do not paste passwords, payment details, or sensitive personal data. JevHub does not save your message or connect to your inbox.",
  resultTitle: "Suggested queues",
  resultDescription: "These are suggestions for review. Nothing is moved, deleted, or sent.",
  loading: "Jev is sorting the messages…",
  error: "The request did not finish.",
  retry: "Try again",
  details: "View decision signals",
  typeLabel: "Message type",
  replyLabel: "Direct reply request",
  timeLabel: "Time pressure",
  typeConfidence: "Type confidence",
  timeConfidence: "Time confidence",
  noReply: "No reply action is taken.",
  howTitle: "How the sorting works",
  howBody: "Jev answers three fixed questions for each email: its type (Choice), whether it asks for a direct reply (Noul), and explicit time pressure (Score). JevHub applies visible rules to place it in a queue. A suspicious or uncertain message goes to Review.",
  limitTitle: "What this trial does not do",
  limitBody: "It does not read Gmail, follow links, send replies, delete messages, or decide whether a sender is safe. Check every suggestion before acting.",
  learnTitle: "Build your own decision flow",
  learnBody: "Inspect Jev's typed judgments in the Playground or start from a support routing template.",
  playgroundLink: "Open Playground",
  templateLink: "See support routing",
  queues: {
    needs_reply: { title: "Needs reply", description: "A direct response appears to be requested." },
    review: { title: "Review", description: "Urgent, uncertain, or suspicious: check this yourself." },
    read_later: { title: "Read later", description: "No clear direct reply or immediate action." },
  },
  types: { conversation: "Conversation", account_update: "Account update", newsletter: "Newsletter", promotion: "Promotion", sales_outreach: "Sales outreach", suspected_junk: "Suspicious or junk", other: "Other" },
};

export const INBOX_TRIAGE_COPY: Record<Locale, InboxTriageCopy> = {
  en,
  zh: {
    ...en,
    title: "Jev 邮件速分",
    description: "一键把 6 封示例邮件分成待回复、需检查、稍后阅读。然后可以粘贴自己的一封邮件试玩，无需注册或连接 Gmail。",
    eyebrow: "真实应用 · Jev 在线试玩",
    meta: ["6 封示例邮件", "1 次 Jev 请求", "无需连接邮箱"],
    sampleTitle: "先试一组示例邮件", sampleBody: "下面的 6 封邮件是虚构的。运行 Jev，看看类型、回复请求和时间信号如何变成建议队列。", sampleButton: "整理示例邮件", samplesLabel: "示例邮件",
    customTitle: "试试自己的邮件", customBody: "把发件人、主题和正文作为纯文本粘贴。一次一封，最多 3,000 字。", customPlaceholder: "发件人：…\n主题：…\n\n邮件正文…", customButton: "整理这封邮件", customOpen: "试试我的邮件", customClose: "关闭输入框",
    privacy: "提交的文字会发送给 JevHub 和 TypeSafe AI 处理本次请求。请勿粘贴密码、支付信息或敏感个人资料。JevHub 不保存邮件，也不会连接你的邮箱。",
    resultTitle: "建议队列", resultDescription: "这些只是供你检查的建议。我们不会移动、删除或发送任何邮件。", loading: "Jev 正在整理…", error: "请求未能完成。", retry: "重试", details: "查看判断信号", typeLabel: "邮件类型", replyLabel: "直接回复请求", timeLabel: "时间紧迫度", typeConfidence: "类型判断置信度", timeConfidence: "时间判断置信度", noReply: "不会自动回复。",
    howTitle: "如何分类", howBody: "Jev 对每封邮件回答三个固定问题：类型（Choice）、是否明确要求直接回复（Noul）和文本里的时间要求（Score）。JevHub 再按公开规则建议队列。可疑或不确定的邮件进入“需检查”。",
    limitTitle: "试玩范围", limitBody: "不会读取 Gmail、打开链接、发送回复、删除邮件或判断发件人一定安全。采取行动前请自行核实。", learnTitle: "构建自己的判断流程", learnBody: "可以在 Playground 查看 Jev 的结构化判断，或参考客服路由模板。", playgroundLink: "打开 Playground", templateLink: "查看客服路由",
    queues: { needs_reply: { title: "待回复", description: "看起来需要直接回复。" }, review: { title: "需检查", description: "紧急、不确定或可疑，请亲自核实。" }, read_later: { title: "稍后阅读", description: "没有明确的直接回复或立即行动要求。" } },
    types: { conversation: "对话", account_update: "账户通知", newsletter: "简报", promotion: "促销", sales_outreach: "销售邀约", suspected_junk: "可疑或垃圾邮件", other: "其他" },
  },
  ja: {
    ...en,
    title: "Jev メール仕分け", description: "6 件のサンプルメールを返信・確認・後で読むに仕分けます。自分のメールも 1 件試せます。登録や Gmail 接続は不要です。", eyebrow: "実用アプリ · Jev デモ", meta: ["サンプル 6 件", "Jev 呼び出し 1 回", "受信箱との接続不要"],
    sampleTitle: "サンプル受信箱から試す", sampleBody: "以下は架空のメールです。Jev が種類、返信要求、時間的な緊急性を判断します。", sampleButton: "サンプルを仕分ける", samplesLabel: "サンプルメール", customTitle: "自分のメールを試す", customBody: "送信者、件名、本文をテキストで貼り付けてください。1 件 3,000 文字まで。", customButton: "このメールを仕分ける", customOpen: "自分のメールを試す", customClose: "入力を閉じる", privacy: "入力内容は、このリクエストのため JevHub と TypeSafe AI に送信されます。パスワード、決済情報、機密情報を入力しないでください。JevHub はメールを保存せず、受信箱にも接続しません。", resultTitle: "推奨キュー", resultDescription: "提案は必ず確認してください。メールの移動、削除、送信は行いません。", loading: "Jev が仕分け中…", error: "処理を完了できませんでした。", retry: "再試行", details: "判断の根拠を見る", typeLabel: "メールの種類", replyLabel: "直接の返信要求", timeLabel: "緊急度", typeConfidence: "種類の確信度", timeConfidence: "緊急度の確信度", noReply: "自動返信はしません。", howTitle: "仕組み", howBody: "Jev は各メールについて Choice、Noul、Score の固定された 3 問に回答します。JevHub がその結果をキューに振り分けます。不審または不確実なメールは確認へ送ります。", limitTitle: "このデモの範囲", limitBody: "Gmail の読み取り、リンクの表示、返信、削除、安全性の保証は行いません。", learnTitle: "独自の判断フローを作る", learnBody: "Playground で型付き判断を確認し、サポート振り分け例から始められます。", playgroundLink: "Playground を開く", templateLink: "サポート振り分けを見る", queues: { needs_reply: { title: "返信", description: "直接の返答が必要そうです。" }, review: { title: "確認", description: "緊急、不確実、または不審です。" }, read_later: { title: "後で読む", description: "明確な返信や即時対応は不要です。" } }, types: { conversation: "会話", account_update: "アカウント通知", newsletter: "ニュースレター", promotion: "宣伝", sales_outreach: "営業", suspected_junk: "不審なメール", other: "その他" },
  },
  fr: {
    ...en,
    title: "Tri des e-mails avec Jev", description: "Classez six e-mails fictifs entre Répondre, Vérifier et Lire plus tard. Essayez ensuite un message personnel, sans compte ni connexion Gmail.", eyebrow: "Application réelle · Démo Jev", meta: ["Six exemples", "Un appel Jev", "Sans connexion à la boîte mail"], sampleTitle: "Commencer par des exemples", sampleBody: "Ces six messages sont fictifs. Jev examine leur type, la demande de réponse et l’urgence indiquée.", sampleButton: "Trier les exemples", samplesLabel: "Exemples d’e-mails", customTitle: "Essayer votre message", customBody: "Collez expéditeur, objet et corps en texte brut. Un message de 3 000 caractères maximum.", customButton: "Trier ce message", customOpen: "Essayer mon e-mail", customClose: "Fermer la saisie", privacy: "Votre texte est envoyé à JevHub et TypeSafe AI pour cette demande. Ne collez ni mot de passe, ni donnée de paiement, ni information sensible. JevHub ne conserve pas le message et ne se connecte pas à votre boîte mail.", resultTitle: "Files suggérées", resultDescription: "Vérifiez chaque suggestion. Aucun e-mail n’est déplacé, supprimé ou envoyé.", loading: "Jev classe les messages…", error: "La demande n’a pas abouti.", retry: "Réessayer", details: "Voir les signaux", typeLabel: "Type de message", replyLabel: "Réponse directe demandée", timeLabel: "Urgence", typeConfidence: "Confiance du type", timeConfidence: "Confiance de l’urgence", noReply: "Aucune réponse automatique.", howTitle: "Comment fonctionne le tri", howBody: "Jev répond à trois questions fixes par e-mail : type (Choice), réponse directe (Noul) et urgence explicite (Score). JevHub applique des règles visibles. Les messages suspects ou incertains passent en Vérifier.", limitTitle: "Limites de l’essai", limitBody: "Pas d’accès Gmail, de lien ouvert, de réponse, de suppression ou de garantie de sécurité de l’expéditeur.", learnTitle: "Créer votre propre flux", learnBody: "Explorez les décisions typées dans Playground ou partez d’un exemple de routage du support.", playgroundLink: "Ouvrir Playground", templateLink: "Voir le routage du support", queues: { needs_reply: { title: "Répondre", description: "Une réponse directe semble demandée." }, review: { title: "Vérifier", description: "Urgent, incertain ou suspect : vérifiez vous-même." }, read_later: { title: "Lire plus tard", description: "Pas de réponse directe clairement nécessaire." } }, types: { conversation: "Conversation", account_update: "Notification de compte", newsletter: "Newsletter", promotion: "Promotion", sales_outreach: "Prospection", suspected_junk: "Suspect ou indésirable", other: "Autre" },
  },
  pl: {
    ...en,
    title: "Sortowanie poczty z Jev", description: "Podziel sześć przykładowych e-maili na odpowiedź, sprawdzenie i później. Następnie wypróbuj jedną własną wiadomość bez rejestracji i łączenia Gmaila.", eyebrow: "Prawdziwa aplikacja · Demo Jev", meta: ["Sześć przykładów", "Jedno żądanie Jev", "Bez połączenia ze skrzynką"], sampleTitle: "Zacznij od przykładów", sampleBody: "Sześć wiadomości jest fikcyjnych. Jev ocenia typ, potrzebę odpowiedzi i presję czasu.", sampleButton: "Posortuj przykłady", samplesLabel: "Przykładowe wiadomości", customTitle: "Wypróbuj własną wiadomość", customBody: "Wklej nadawcę, temat i treść jako zwykły tekst. Jedna wiadomość do 3000 znaków.", customButton: "Posortuj wiadomość", customOpen: "Wypróbuj mój e-mail", customClose: "Zamknij pole", privacy: "Tekst jest wysyłany do JevHub i TypeSafe AI na potrzeby tego żądania. Nie wklejaj haseł, danych płatniczych ani informacji wrażliwych. JevHub nie zapisuje wiadomości i nie łączy się ze skrzynką.", resultTitle: "Sugerowane kolejki", resultDescription: "Sprawdź każdą sugestię. Żadna wiadomość nie jest przenoszona, usuwana ani wysyłana.", loading: "Jev sortuje wiadomości…", error: "Nie udało się ukończyć żądania.", retry: "Spróbuj ponownie", details: "Zobacz sygnały decyzji", typeLabel: "Typ wiadomości", replyLabel: "Prośba o odpowiedź", timeLabel: "Pilność", typeConfidence: "Pewność typu", timeConfidence: "Pewność pilności", noReply: "Bez automatycznej odpowiedzi.", howTitle: "Jak działa sortowanie", howBody: "Jev odpowiada na trzy stałe pytania o każdą wiadomość: typ (Choice), prośba o odpowiedź (Noul) i pilność (Score). JevHub stosuje jawne reguły. Podejrzane lub niepewne wiadomości trafiają do Sprawdź.", limitTitle: "Zakres próby", limitBody: "Brak dostępu do Gmaila, otwierania linków, odpowiedzi, usuwania i gwarancji bezpieczeństwa nadawcy.", learnTitle: "Zbuduj własny przepływ", learnBody: "Sprawdź typowane decyzje w Playground lub zacznij od wzorca routingu wsparcia.", playgroundLink: "Otwórz Playground", templateLink: "Zobacz routing wsparcia", queues: { needs_reply: { title: "Odpowiedz", description: "Prawdopodobnie potrzebna jest bezpośrednia odpowiedź." }, review: { title: "Sprawdź", description: "Pilne, niepewne lub podejrzane." }, read_later: { title: "Przeczytaj później", description: "Brak wyraźnej potrzeby odpowiedzi." } }, types: { conversation: "Rozmowa", account_update: "Powiadomienie o koncie", newsletter: "Newsletter", promotion: "Promocja", sales_outreach: "Oferta handlowa", suspected_junk: "Podejrzane", other: "Inne" },
  },
};
