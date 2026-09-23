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

// Editorial examples for the keyless preview. These are not Jev responses.
export const DEMO_PREVIEW = [
  { id: "refund", messageType: "conversation", queue: "needs_reply" },
  { id: "security", messageType: "account_update", queue: "review" },
  { id: "newsletter", messageType: "newsletter", queue: "read_later" },
  { id: "sales", messageType: "sales_outreach", queue: "review" },
  { id: "friend", messageType: "conversation", queue: "needs_reply" },
  { id: "suspicious", messageType: "suspected_junk", queue: "review" },
] as const;
