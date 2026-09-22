import {
  buildIdeaValidatorQuestions,
  composeIdeaValidatorResult,
  validateIdeaValidatorInput,
} from "@/lib/idea-validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Bucket = {
  count: number;
  resetAt: number;
};

const globalRateLimit = globalThis as typeof globalThis & {
  __jevHubIdeaValidatorRateLimit?: Map<string, Bucket>;
};

const buckets =
  globalRateLimit.__jevHubIdeaValidatorRateLimit ??
  (globalRateLimit.__jevHubIdeaValidatorRateLimit = new Map<string, Bucket>());

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function consumeRateLimit(request: Request) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limit = positiveInteger(process.env.JEV_IDEA_VALIDATOR_RATE_LIMIT, 20);
  const key = clientAddress(request);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfter: 0,
  };
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { ...init, headers });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 16_000) {
    return json({ error: "Request is too large." }, { status: 413 });
  }

  const rate = consumeRateLimit(request);
  if (!rate.allowed) {
    return json(
      { error: "Idea Validator rate limit reached. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      },
    );
  }

  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) {
    return json(
      {
        error: "Idea Validator is temporarily unavailable. Please try again later.",
        code: "idea_validator_unavailable",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validated = validateIdeaValidatorInput(body);
  if (!validated.ok) {
    return json({ error: validated.error }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutMs = positiveInteger(
    process.env.JEV_IDEA_VALIDATOR_TIMEOUT_MS,
    12_000,
  );
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstream = await fetch("https://api.typesafe.ai/v1/systemone", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: validated.value.idea,
        questions: buildIdeaValidatorQuestions(validated.value.goal),
        model: process.env.TYPESAFE_DEFAULT_MODEL?.trim() || "jev-latest",
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!upstream.ok) {
      return json(
        {
          error:
            upstream.status === 429
              ? "Too many requests right now. Please try again shortly."
              : "The Jev request could not be completed right now.",
        },
        { status: upstream.status === 429 ? 429 : 502 },
      );
    }

    try {
      const result = composeIdeaValidatorResult(
        validated.value.goal,
        data as Parameters<typeof composeIdeaValidatorResult>[1],
      );
      return json(result, {
        status: 200,
        headers: { "X-RateLimit-Remaining": String(rate.remaining) },
      });
    } catch {
      return json(
        { error: "Jev returned an incomplete score set. Please try again." },
        { status: 502 },
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return json(
        { error: "The Jev request timed out. Try a shorter idea description." },
        { status: 504 },
      );
    }
    return json(
      { error: "The Jev request could not reach TypeSafe." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
