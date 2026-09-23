import { afterEach, describe, expect, it, vi } from "vitest";

const createPostgres = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("postgres", () => ({ default: createPostgres }));

import { saveIdeaValidatorSubmission } from "@/lib/server/idea-submissions";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Idea Validator database configuration", () => {
  it("does not open PostgreSQL until daily expiry cleanup is explicitly enabled", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:local@127.0.0.1/test");
    vi.stubEnv("JEV_IDEA_RETENTION_CLEANUP_SCHEDULED", "false");

    await expect(
      saveIdeaValidatorSubmission({
        idea: "An idea that is long enough for the database guard test.",
        goal: "money",
        result: {
          overall: 50,
          verdict: "FIX",
          goal: "money",
          dimensions: [],
          best: { id: "problem", label: "Problem", score: 50, rawScore: 2 },
          risk: { id: "reach", label: "Reach", score: 50, rawScore: 2 },
        },
        ipAddress: "198.51.100.20",
      }),
    ).rejects.toThrow("Daily Idea Validator retention cleanup is not configured.");

    expect(createPostgres).not.toHaveBeenCalled();
  });
});
