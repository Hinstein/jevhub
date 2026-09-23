import type { Locale } from "@/i18n/config";

export type InboxEmail = {
  id: string;
  from: string;
  subject: string;
  body: string;
};

export const DEMO_EMAILS: readonly InboxEmail[] = [
  {
    id: "refund",
    from: "Maya at customer@example.com",
    subject: "Duplicate charge on my order",
    body: "Hi, I was charged twice for order 1042. Could you refund the duplicate charge and let me know today? Thanks, Maya.",
  },
  {
    id: "security",
    from: "alerts@account.example.com",
    subject: "New sign-in to your account",
    body: "A new device signed in to your account. If this was not you, review your account activity today. This is an automated notice; please do not reply.",
  },
  {
    id: "newsletter",
    from: "digest@weekly.example.com",
    subject: "This week's developer roundup",
    body: "Here are five articles and tools from this week. Read them whenever you have time. You can unsubscribe from this newsletter.",
  },
  {
    id: "sales",
    from: "sales@vendor.example.com",
    subject: "Could our tool help your team?",
    body: "Hello, our agency helps teams book more meetings. Would you be open to a 15-minute sales call next week? This is an unsolicited introduction.",
  },
  {
    id: "friend",
    from: "Alex at friend@example.com",
    subject: "Dinner next Thursday?",
    body: "Are you free for dinner next Thursday? Let me know when you get a chance so I can book a table.",
  },
  {
    id: "suspicious",
    from: "billing@notice.example.com",
    subject: "Immediate account verification",
    body: "Your account will close unless you send your password and card number in a reply. Do not contact support. Act now.",
  },
];

export const DEMO_EMAILS_BY_LOCALE: Record<Locale, readonly InboxEmail[]> = {
  en: DEMO_EMAILS,
  zh: [
    { id: "refund", from: "Maya（customer@example.com）", subject: "我的订单被重复扣款", body: "你好，我的 1042 号订单被扣了两次。可以退还重复扣款，并在今天告知我处理结果吗？谢谢，Maya。" },
    { id: "security", from: "alerts@account.example.com", subject: "你的账户有新的登录记录", body: "检测到有新设备登录你的账户。如果不是你本人操作，请立即检查账户活动。这是一封系统自动通知，请勿直接回复。" },
    { id: "newsletter", from: "digest@weekly.example.com", subject: "本周开发者精选", body: "这是本周精选的五篇文章和工具。有空时再阅读即可。你可以随时取消订阅这份简报。" },
    { id: "sales", from: "sales@vendor.example.com", subject: "我们的工具能帮到你的团队吗？", body: "你好，我们是一家帮助团队预约更多会议的服务商。下周你愿意抽 15 分钟了解一下我们的销售工具吗？这是未经邀请的业务联系。" },
    { id: "friend", from: "Alex（friend@example.com）", subject: "下周四一起吃晚饭吗？", body: "下周四有空一起吃晚饭吗？你有空时告诉我一声，我好预订餐厅。" },
    { id: "suspicious", from: "billing@notice.example.com", subject: "请立即验证账户", body: "否则你的账户将被关闭，请在回复中提供密码和银行卡号。不要联系官方客服。请立即处理。" },
  ],
  ja: [
    { id: "refund", from: "Maya（customer@example.com）", subject: "注文が二重に請求されています", body: "こんにちは。注文番号 1042 の料金が二重に請求されました。重複分を返金し、今日中に結果を知らせてもらえますか？よろしくお願いします。Maya" },
    { id: "security", from: "alerts@account.example.com", subject: "アカウントへの新しいログイン", body: "新しい端末からアカウントにログインがありました。ご自身の操作でない場合は、本日中にアカウントの利用状況をご確認ください。このメールは自動送信です。返信しないでください。" },
    { id: "newsletter", from: "digest@weekly.example.com", subject: "今週の開発者向けまとめ", body: "今週の記事とツールを 5 件まとめました。時間のあるときにお読みください。このニュースレターはいつでも配信停止できます。" },
    { id: "sales", from: "sales@vendor.example.com", subject: "弊社のツールでチームを支援できますか？", body: "こんにちは。弊社はチームの商談予約を支援しています。来週、15 分ほど製品の説明を聞いていただけませんか？事前のご依頼を受けていない営業連絡です。" },
    { id: "friend", from: "Alex（friend@example.com）", subject: "来週の木曜日に夕食はどう？", body: "来週の木曜日、夕食に行ける？都合のよいときに教えてね。お店を予約しておくよ。" },
    { id: "suspicious", from: "billing@notice.example.com", subject: "至急：アカウントの確認", body: "返信でパスワードとカード番号を送らないと、アカウントを停止します。サポートには連絡しないでください。今すぐ対応してください。" },
  ],
  fr: [
    { id: "refund", from: "Maya <customer@example.com>", subject: "Mon achat a été débité deux fois", body: "Bonjour, le montant de la commande 1042 m’a été facturé deux fois. Pourriez-vous rembourser le doublon et me confirmer le traitement aujourd’hui ? Merci, Maya." },
    { id: "security", from: "alerts@account.example.com", subject: "Nouvelle connexion à votre compte", body: "Un nouvel appareil s’est connecté à votre compte. Si ce n’était pas vous, vérifiez l’activité de votre compte aujourd’hui. Ceci est une notification automatique ; merci de ne pas répondre." },
    { id: "newsletter", from: "digest@weekly.example.com", subject: "La sélection développeur de la semaine", body: "Voici cinq articles et outils sélectionnés cette semaine. Vous pourrez les lire quand vous aurez le temps. Vous pouvez vous désabonner de cette newsletter à tout moment." },
    { id: "sales", from: "sales@vendor.example.com", subject: "Notre outil pourrait-il aider votre équipe ?", body: "Bonjour, notre agence aide les équipes à obtenir davantage de rendez-vous. Seriez-vous disponible pour un appel commercial de 15 minutes la semaine prochaine ? Il s’agit d’une prise de contact non sollicitée." },
    { id: "friend", from: "Alex <friend@example.com>", subject: "Dîner jeudi prochain ?", body: "Tu es libre pour dîner jeudi prochain ? Dis-moi quand tu peux, comme ça je réserve une table." },
    { id: "suspicious", from: "billing@notice.example.com", subject: "Vérification immédiate du compte", body: "Votre compte sera fermé si vous ne transmettez pas votre mot de passe et votre numéro de carte en réponse. Ne contactez pas le support. Agissez immédiatement." },
  ],
  pl: [
    { id: "refund", from: "Maya <customer@example.com>", subject: "Podwójne obciążenie za zamówienie", body: "Dzień dobry, za zamówienie 1042 pobrano opłatę dwa razy. Czy mogą Państwo zwrócić nadpłatę i dać mi znać jeszcze dzisiaj? Dziękuję, Maya." },
    { id: "security", from: "alerts@account.example.com", subject: "Nowe logowanie na Twoje konto", body: "Na Twoje konto zalogowało się nowe urządzenie. Jeśli to nie Ty, sprawdź dziś aktywność konta. To automatyczne powiadomienie — prosimy na nie nie odpowiadać." },
    { id: "newsletter", from: "digest@weekly.example.com", subject: "Cotygodniowy przegląd dla programistów", body: "Oto pięć artykułów i narzędzi wybranych w tym tygodniu. Możesz przeczytać je w wolnej chwili. Z tej wiadomości możesz zrezygnować w dowolnym momencie." },
    { id: "sales", from: "sales@vendor.example.com", subject: "Czy nasze narzędzie pomoże Twojemu zespołowi?", body: "Dzień dobry, pomagamy zespołom umawiać więcej spotkań. Czy znajdziesz 15 minut na rozmowę handlową w przyszłym tygodniu? To niezamówiona wiadomość z ofertą." },
    { id: "friend", from: "Alex <friend@example.com>", subject: "Kolacja w przyszły czwartek?", body: "Masz czas na kolację w przyszły czwartek? Daj znać, kiedy możesz, żebym zarezerwował stolik." },
    { id: "suspicious", from: "billing@notice.example.com", subject: "Pilna weryfikacja konta", body: "Twoje konto zostanie zamknięte, jeśli nie prześlesz w odpowiedzi hasła i numeru karty. Nie kontaktuj się z pomocą. Zrób to natychmiast." },
  ],
};

export function getDemoEmails(locale: Locale): readonly InboxEmail[] {
  return DEMO_EMAILS_BY_LOCALE[locale];
}

// Editorial examples for the keyless preview. These are not Jev responses.
export const DEMO_PREVIEW = [
  { id: "refund", messageType: "conversation", queue: "needs_reply" },
  { id: "security", messageType: "account_update", queue: "review" },
  { id: "newsletter", messageType: "newsletter", queue: "read_later" },
  { id: "sales", messageType: "sales_outreach", queue: "review" },
  { id: "friend", messageType: "conversation", queue: "needs_reply" },
  { id: "suspicious", messageType: "suspected_junk", queue: "review" },
] as const;
