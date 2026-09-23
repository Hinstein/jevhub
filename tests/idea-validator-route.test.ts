import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ideaDimensions } from "@/lib/idea-validator";

const persistence = vi.hoisted(() => ({
  save: vi.fn(),
}));

vi.mock("@/lib/server/idea-submissions", () => ({
  saveIdeaValidatorSubmission: persistence.save,
}));

import { POST } from "@/app/api/idea-validator/route";

let ipSuffix = 1;

function request(body: Record<string, unknown>) {
  const ip = `198.51.100.${ipSuffix++}`;
  return new Request("http://localhost/api/idea-validator", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

function upstreamResponse() {
  return Response.json({
    model: "jev-test",
    answers: Object.fromEntries(
      ideaDimensions("money").map((dimension) => [
        dimension.id,
        { score: dimension.id === "different" ? 1 : 3, confidence: 0.8 },
      ]),
    ),
  });
}

const idea = "A tool that helps independent developers find and test product ideas.";

beforeEach(() => {
  vi.stubEnv("TYPESAFE_API_KEY", "test-key");
  persistence.save.mockReset().mockResolvedValue(undefined);
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(upstreamResponse())));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/idea-validator retention consent", () => {
  it("scores without persisting when consent is omitted or false", async () => {
    for (const body of [{ idea, goal: "money" }, { idea, goal: "money", consentToRetention: false }]) {
      const response = await POST(request(body));
      expect(response.status).toBe(200);
      expect((await response.json()).retentionStatus).toBeUndefined();
    }

    expect(persistence.save).not.toHaveBeenCalled();
  });

  it("persists the idea, goal, full result, and parsed request IP after consent", async () => {
    const response = await POST(
      request({ idea, goal: "money", consentToRetention: true }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.retentionStatus).toBe("saved");
    expect(persistence.save).toHaveBeenCalledOnce();
    expect(persistence.save).toHaveBeenCalledWith({
      idea,
      goal: "money",
      result: expect.objectContaining({
        overall: 70,
        verdict: "SHIP",
        dimensions: expect.arrayContaining([
          expect.objectContaining({ id: "different", score: 25 }),
        ]),
      }),
      ipAddress: "198.51.100.3",
    });
  });

  it("returns the score and tells the client nothing was saved if PostgreSQL fails", async () => {
    persistence.save.mockRejectedValueOnce(new Error("database unavailable"));

    const response = await POST(
      request({ idea, goal: "money", consentToRetention: true }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.overall).toBe(70);
    expect(body.retentionStatus).toBe("unavailable");
    expect(JSON.stringify(body)).not.toContain("database unavailable");
  });

  it("rejects a malformed consent value before calling Jev or PostgreSQL", async () => {
    const response = await POST(
      request({ idea, goal: "money", consentToRetention: "yes" }),
    );

    expect(response.status).toBe(400);
    expect(persistence.save).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
