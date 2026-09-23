import type { InboxEmail } from "@/content/inbox-demo";

export const INBOX_LIMITS = {
  customCharacters: 3_000,
  requestBytes: 16_000,
  runsPerHour: 15,
  emailsPerHour: 30,
} as const;

export const MESSAGE_TYPES = [
  "conversation", "account_update", "newsletter", "promotion",
  "sales_outreach", "suspected_junk", "other",
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];
export type InboxQueue = "needs_reply" | "review" | "read_later";
export type InboxRequest = { mode: "demo" } | { mode: "custom"; text: string };

export type InboxEmailResult = {
  id: string;
  messageType: MessageType;
  typeProbabilities: Record<MessageType, number>;
  categoryConfidence: number;
  replyProbability: number;
  timeSensitivity: number;
  timeConfidence: number;
  queue: InboxQueue;
};

export type InboxResult = {
  emails: InboxEmailResult[];
  summary: Record<InboxQueue, number>;
  model?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
};

type ValidationResult =
  | { ok: true; value: InboxRequest }
  | { ok: false; error: string };

type ChoiceQuestion = {
  type: "choice";
  instructions: string;
  criteria: Record<MessageType, string>;
};
type NoulQuestion = { type: "noul"; instructions: string };
type ScoreQuestion = {
  type: "score";
  instructions: string;
  criteria: [string, string, string];
};
export type InboxQuestion = ChoiceQuestion | NoulQuestion | ScoreQuestion;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateInboxRequest(input: unknown): ValidationResult {
  if (!isRecord(input)) return { ok: false, error: "Request body must be an object." };
  if (input.mode === "demo") {
    if (Object.keys(input).length !== 1) {
      return { ok: false, error: "Demo accepts no other fields." };
    }
    return { ok: true, value: { mode: "demo" } };
  }
  if (input.mode !== "custom" || Object.keys(input).some((key) => key !== "mode" && key !== "text")) {
    return { ok: false, error: "Use demo or one custom text message." };
  }
  if (typeof input.text !== "string") {
    return { ok: false, error: "Email text is required." };
  }
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Email text is required." };
  if (text.length > INBOX_LIMITS.customCharacters) {
    return { ok: false, error: `Email text must be at most ${INBOX_LIMITS.customCharacters} characters.` };
  }
  return { ok: true, value: { mode: "custom", text } };
}

export function buildInboxQuestions(emails: readonly InboxEmail[]): Record<string, InboxQuestion> {
  const questions: Record<string, InboxQuestion> = {};
  for (const [index] of emails.entries()) {
    const target = `\`emails[${index}]\``;
    questions[`email_${index}_type`] = {
      type: "choice",
      instructions: `What is the main type of ${target}? Use only the visible sender, subject, and body. If none fits, choose other.`,
      criteria: {
        conversation: "A message specifically continuing a personal, customer, or colleague conversation.",
        account_update: "An automated account, security, payment, order, or delivery update.",
        newsletter: "A periodic editorial digest sent to a list.",
        promotion: "A marketing campaign, discount, or product announcement sent broadly.",
        sales_outreach: "Unsolicited vendor, agency, or recruiter outreach trying to start a sales conversation.",
        suspected_junk: "The text appears to be a scam, phishing request, or unrelated junk; this is only a review flag.",
        other: "None of the listed types clearly fits.",
      },
    };
    questions[`email_${index}_reply`] = {
      type: "noul",
      instructions: `Does ${target} clearly ask the recipient for a direct response to a specific request or existing conversation? Do not count generic marketing or unsolicited sales invitations as needing a reply.`,
    };
    questions[`email_${index}_time`] = {
      type: "score",
      instructions: `How much explicit time pressure does ${target} express for the recipient to review or respond? Judge only the supplied text, not guessed deadlines.`,
      criteria: [
        "No stated time pressure or deadline.",
        "A response or review is requested within several days or a week.",
        "A response or review is requested today, within 24 hours, or immediately.",
      ],
    };
  }
  return questions;
}

function numberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function readAnswer(answers: Record<string, unknown>, id: string, type: string) {
  const answer = answers[id];
  if (!isRecord(answer) || answer.type !== type) throw new Error("Incomplete Jev answer set.");
  return answer;
}

function queueFor(type: MessageType, confidence: number, reply: number, time: number): InboxQueue {
  if (type === "suspected_junk" || confidence < 0.4) return "review";
  if (reply >= 0.7) return "needs_reply";
  if (reply >= 0.35 || time >= 1.3) return "review";
  return "read_later";
}

export function composeInboxResult(emails: readonly InboxEmail[], upstream: unknown): InboxResult {
  if (!isRecord(upstream) || !isRecord(upstream.answers)) {
    throw new Error("Incomplete Jev answer set.");
  }
  const results: InboxEmailResult[] = emails.map((email, index) => {
    const choice = readAnswer(upstream.answers as Record<string, unknown>, `email_${index}_type`, "choice");
    const reply = readAnswer(upstream.answers as Record<string, unknown>, `email_${index}_reply`, "noul");
    const time = readAnswer(upstream.answers as Record<string, unknown>, `email_${index}_time`, "score");
    if (
      typeof choice.choice !== "string" ||
      !MESSAGE_TYPES.includes(choice.choice as MessageType) ||
      !numberInRange(choice.confidence, 0, 1) ||
      !isRecord(choice.probabilities) ||
      !numberInRange(reply.noul, 0, 1) ||
      !numberInRange(time.score, 0, 2) ||
      !numberInRange(time.confidence, 0, 1)
    ) throw new Error("Incomplete Jev answer set.");
    const typeProbabilities = {} as Record<MessageType, number>;
    for (const type of MESSAGE_TYPES) {
      const probability = choice.probabilities[type];
      if (!numberInRange(probability, 0, 1)) throw new Error("Incomplete Jev answer set.");
      typeProbabilities[type] = probability;
    }
    const messageType = choice.choice as MessageType;
    return {
      id: email.id,
      messageType,
      typeProbabilities,
      categoryConfidence: choice.confidence as number,
      replyProbability: reply.noul as number,
      timeSensitivity: time.score as number,
      timeConfidence: time.confidence as number,
      queue: queueFor(messageType, choice.confidence as number, reply.noul as number, time.score as number),
    };
  });
  const summary: Record<InboxQueue, number> = { needs_reply: 0, review: 0, read_later: 0 };
  for (const email of results) summary[email.queue] += 1;
  const usage = isRecord(upstream.usage) ? {
    input_tokens: typeof upstream.usage.input_tokens === "number" ? upstream.usage.input_tokens : undefined,
    output_tokens: typeof upstream.usage.output_tokens === "number" ? upstream.usage.output_tokens : undefined,
  } : undefined;
  return {
    emails: results,
    summary,
    model: typeof upstream.model === "string" ? upstream.model : undefined,
    usage,
  };
}
