import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/inbox-triage/route";

const types = [
  "conversation", "account_update", "newsletter", "promotion",
  "sales_outreach", "suspected_junk", "other",
];

function upstream(count: number) {
  const answers: Record<string, unknown> = {};
  for (let i = 0; i < count; i += 1) {
    answers[`email_${i}_type`] = {
      type: "choice", choice: "conversation", confidence: 0.9,
      probabilities: Object.fromEntries(types.map((type) => [type, type === "conversation" ? 0.94 : 0.01])),
    };
    answers[`email_${i}_reply`] = { type: "noul", noul: 0.9 };
    answers[`email_${i}_time`] = {
      type: "score", score: 1, confidence: 0.8,
      probabilities: { "0": 0.1, "1": 0.8, "2": 0.1 },
      legend: { "0": "none", "1": "days", "2": "today" },
    };
  }
  return { model: "jev-test", answers, usage: { input_tokens: 100, output_tokens: 20 } };
}

let address = 0;
function request(body: unknown, headers: Record<string, string> = {}) {
  address += 1;
  return new Request("http://localhost/api/inbox-triage", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `192.0.2.${address}`, ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/inbox-triage", () => {
  beforeEach(() => {
    process.env.TYPESAFE_API_KEY = "server-secret";
    delete process.env.JEV_INBOX_RATE_LIMIT;
    delete process.env.JEV_INBOX_EMAIL_LIMIT;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TYPESAFE_API_KEY;
    delete process.env.JEV_INBOX_RATE_LIMIT;
    delete process.env.JEV_INBOX_EMAIL_LIMIT;
  });

  it("returns an honest unavailable response without a server key", async () => {
    delete process.env.TYPESAFE_API_KEY;
    const response = await POST(request({ mode: "demo" }));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).not.toContain("server-secret");
  });

  it("rejects oversized, blank, and caller-controlled payloads before upstream", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const huge = await POST(request({ mode: "custom", text: "x".repeat(20_000) }));
    expect(huge.status).toBe(413);
    const blank = await POST(request({ mode: "custom", text: " " }));
    expect(blank.status).toBe(400);
    const override = await POST(request({ mode: "custom", text: "Hello", model: "other" }));
    expect(override.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("sends six server-owned sample messages and 18 fixed questions with the server key", async () => {
    let target = "";
    let authorization = "";
    let payload: Record<string, unknown> = {};
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      target = url;
      authorization = new Headers(init.headers).get("authorization") ?? "";
      payload = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json(upstream(6));
    }));
    const response = await POST(request({ mode: "demo" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(target).toBe("https://api.typesafe.ai/v1/systemone");
    expect(authorization).toBe("Bearer server-secret");
    expect(payload.model).toBe("jev-latest");
    expect((payload.state as { emails: unknown[] }).emails).toHaveLength(6);
    expect(Object.keys(payload.questions as object)).toHaveLength(18);
    const data = await response.json();
    expect(data.summary).toEqual({ needs_reply: 6, review: 0, read_later: 0 });
    expect(JSON.stringify(data)).not.toContain("server-secret");
  });

  it("submits one custom text and returns no echoed body", async () => {
    let payload: Record<string, unknown> = {};
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      payload = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json(upstream(1));
    }));
    const response = await POST(request({ mode: "custom", text: "Private sample text to classify" }));
    expect(response.status).toBe(200);
    expect((payload.state as { emails: unknown[] }).emails).toHaveLength(1);
    expect(Object.keys(payload.questions as object)).toHaveLength(3);
    expect(await response.text()).not.toContain("Private sample text to classify");
  });

  it("fails safely on malformed upstream answers", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ answers: {} })));
    const response = await POST(request({ mode: "custom", text: "Subject: Hello" }));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("Subject: Hello");
  });

  it("limits repeated runs and weighted email usage", async () => {
    process.env.JEV_INBOX_RATE_LIMIT = "1";
    process.env.JEV_INBOX_EMAIL_LIMIT = "6";
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(upstream(6))));
    const ip = { "x-forwarded-for": "198.51.100.23" };
    const first = await POST(request({ mode: "demo" }, ip));
    const second = await POST(request({ mode: "custom", text: "Hello" }, ip));
    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.headers.get("retry-after")).toBeTruthy();
  });
});
