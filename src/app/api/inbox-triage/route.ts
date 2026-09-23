import { DEMO_EMAILS, type InboxEmail } from "@/content/inbox-demo";
import {
  buildInboxQuestions,
  composeInboxResult,
  INBOX_LIMITS,
  validateInboxRequest,
} from "@/lib/inbox-triage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Bucket = { runs: number; emails: number; resetAt: number };
const rateStore = globalThis as typeof globalThis & {
  __jevHubInboxRateLimit?: Map<string, Bucket>;
};
const buckets = rateStore.__jevHubInboxRateLimit ??
  (rateStore.__jevHubInboxRateLimit = new Map<string, Bucket>());

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { ...init, headers });
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function consumeRateLimit(request: Request, emailCount: number) {
  const now = Date.now();
  const key = clientAddress(request);
  const runsLimit = positiveInteger(process.env.JEV_INBOX_RATE_LIMIT, INBOX_LIMITS.runsPerHour);
  const emailsLimit = positiveInteger(process.env.JEV_INBOX_EMAIL_LIMIT, INBOX_LIMITS.emailsPerHour);
  const previous = buckets.get(key);
  const bucket = previous && previous.resetAt > now
    ? previous
    : { runs: 0, emails: 0, resetAt: now + 60 * 60 * 1000 };
  if (bucket.runs + 1 > runsLimit || bucket.emails + emailCount > emailsLimit) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.runs += 1;
  bucket.emails += emailCount;
  buckets.set(key, bucket);
  return { allowed: true, retryAfter: 0 };
}

async function readBoundedJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; status: number; error: string }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > INBOX_LIMITS.requestBytes) {
    return { ok: false, status: 413, error: "Request is too large." };
  }
  if (!request.body) return { ok: false, status: 400, error: "Request body must be valid JSON." };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > INBOX_LIMITS.requestBytes) {
      await reader.cancel();
      return { ok: false, status: 413, error: "Request is too large." };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false, status: 400, error: "Request body must be valid JSON." };
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) {
    return json({ error: "Inbox Triage is temporarily unavailable. Please try again later.", code: "inbox_unavailable" }, { status: 503 });
  }

  const parsed = await readBoundedJson(request);
  if (!parsed.ok) return json({ error: parsed.error }, { status: parsed.status });
  const validated = validateInboxRequest(parsed.body);
  if (!validated.ok) return json({ error: validated.error }, { status: 400 });

  const emails: readonly InboxEmail[] = validated.value.mode === "demo"
    ? DEMO_EMAILS
    : [{ id: "custom", from: "", subject: "", body: validated.value.text }];
  const rate = consumeRateLimit(request, emails.length);
  if (!rate.allowed) {
    return json(
      { error: "Inbox Triage rate limit reached. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  const controller = new AbortController();
  const timeoutMs = positiveInteger(process.env.JEV_INBOX_TIMEOUT_MS, 12_000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const upstream = await fetch("https://api.typesafe.ai/v1/systemone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: { emails: emails.map(({ from, subject, body }) => ({ from, subject, body })) },
        questions: buildInboxQuestions(emails),
        model: process.env.TYPESAFE_DEFAULT_MODEL?.trim() || "jev-latest",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!upstream.ok) {
      return json(
        { error: upstream.status === 429 ? "Too many requests right now. Try again shortly." : "The Jev request could not be completed right now." },
        { status: upstream.status === 429 ? 429 : 502 },
      );
    }
    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      return json({ error: "Jev returned an incomplete result. Please try again." }, { status: 502 });
    }
    try {
      return json(composeInboxResult(emails, data));
    } catch {
      return json({ error: "Jev returned an incomplete result. Please try again." }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return json({ error: "The Jev request timed out. Please try again." }, { status: 504 });
    }
    return json({ error: "The Jev request could not reach TypeSafe." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
