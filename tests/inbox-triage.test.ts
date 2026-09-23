import { describe, expect, it } from "vitest";
import { DEMO_EMAILS } from "@/content/inbox-demo";
import {
  buildInboxQuestions,
  composeInboxResult,
  validateInboxRequest,
} from "@/lib/inbox-triage";

const categoryKeys = [
  "conversation", "account_update", "newsletter", "promotion",
  "sales_outreach", "suspected_junk", "other",
];

function upstreamFor(
  types: string[],
  replies: number[],
  times: number[],
  categoryConfidence = 0.9,
) {
  const answers: Record<string, unknown> = {};
  for (let i = 0; i < types.length; i += 1) {
    answers[`email_${i}_type`] = {
      type: "choice",
      choice: types[i],
      probabilities: Object.fromEntries(categoryKeys.map((key) => [key, key === types[i] ? 0.9 : 0.1 / 6])),
      confidence: categoryConfidence,
    };
    answers[`email_${i}_reply`] = { type: "noul", noul: replies[i] };
    answers[`email_${i}_time`] = {
      type: "score", score: times[i], confidence: 0.8,
      probabilities: { "0": 0.1, "1": 0.1, "2": 0.8 },
      legend: { "0": "none", "1": "days", "2": "today" },
    };
  }
  return { model: "jev-1.13.0", answers, usage: { input_tokens: 200, output_tokens: 40 } };
}

describe("inbox triage input", () => {
  it("uses six distinct synthetic emails for a first-click demo", () => {
    expect(DEMO_EMAILS).toHaveLength(6);
    expect(new Set(DEMO_EMAILS.map((mail) => mail.id)).size).toBe(6);
    expect(DEMO_EMAILS.every((mail) => mail.from && mail.subject && mail.body)).toBe(true);
    expect(DEMO_EMAILS.every((mail) => !mail.from.includes("@") || mail.from.includes("example."))).toBe(true);
  });

  it("accepts only the server-owned demo switch", () => {
    expect(validateInboxRequest({ mode: "demo" })).toMatchObject({ ok: true, value: { mode: "demo" } });
    expect(validateInboxRequest({ mode: "demo", emails: [{ body: "override" }] }).ok).toBe(false);
  });

  it("trims one custom text and rejects blank, oversize, and caller-controlled questions", () => {
    expect(validateInboxRequest({ mode: "custom", text: "  Please reply today.  " }))
      .toMatchObject({ ok: true, value: { mode: "custom", text: "Please reply today." } });
    expect(validateInboxRequest({ mode: "custom", text: "  " }).ok).toBe(false);
    expect(validateInboxRequest({ mode: "custom", text: "x".repeat(3001) }).ok).toBe(false);
    expect(validateInboxRequest({ mode: "custom", text: "Hi", model: "other" }).ok).toBe(false);
    expect(validateInboxRequest({ mode: "custom", text: "Hi", questions: [] }).ok).toBe(false);
  });
});

describe("inbox triage judgments", () => {
  it("asks three fixed, independently scoped questions per email", () => {
    const questions = buildInboxQuestions(DEMO_EMAILS);
    expect(Object.keys(questions)).toHaveLength(18);
    expect(questions.email_0_type.type).toBe("choice");
    expect(questions.email_0_reply.type).toBe("noul");
    expect(questions.email_0_time.type).toBe("score");
    expect(JSON.stringify(questions.email_0_type)).toContain("`emails[0]`");
    expect(JSON.stringify(questions.email_5_reply)).toContain("`emails[5]`");
  });

  it("keeps reply, review, and read-later decisions separate from message type", () => {
    const emails = DEMO_EMAILS.slice(0, 4);
    const upstream = upstreamFor(
      ["sales_outreach", "account_update", "newsletter", "suspected_junk"],
      [0.9, 0.1, 0.1, 0.1],
      [0.2, 1.8, 0.1, 0.1],
    );
    const result = composeInboxResult(emails, upstream);
    expect(result.emails.map((mail) => mail.queue)).toEqual([
      "needs_reply", "review", "read_later", "review",
    ]);
    expect(result.summary).toEqual({ needs_reply: 1, review: 2, read_later: 1 });
    expect(JSON.stringify(result)).not.toContain(emails[0].body);
  });

  it("puts ambiguous replies and low-confidence types into review", () => {
    const emails = DEMO_EMAILS.slice(0, 2);
    const ambiguous = upstreamFor(["conversation", "promotion"], [0.5, 0.1], [0, 0], 0.2);
    expect(composeInboxResult(emails, ambiguous).emails.map((mail) => mail.queue))
      .toEqual(["review", "review"]);
  });

  it("rejects incomplete or out-of-range upstream answers", () => {
    const emails = DEMO_EMAILS.slice(0, 1);
    const valid = upstreamFor(["conversation"], [0.9], [1]);
    expect(() => composeInboxResult(emails, { answers: {} })).toThrow();
    expect(() => composeInboxResult(emails, {
      ...valid,
      answers: { ...valid.answers, email_0_reply: { type: "noul", noul: 1.5 } },
    })).toThrow();
  });
});
