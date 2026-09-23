import postgres from "postgres";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  IDEA_SUBMISSION_CONSENT_VERSION,
  IDEA_SUBMISSION_RETENTION_DAYS,
  saveIdeaValidatorSubmission,
} from "@/lib/server/idea-submissions";

const databaseUrl =
  process.env.JEV_RUN_DATABASE_INTEGRATION === "1"
    ? process.env.DATABASE_URL?.trim()
    : undefined;

describe("PostgreSQL Idea Validator persistence", () => {
  const integrationTest = databaseUrl ? it : it.skip;
  let savedIdea: string | undefined;

  afterEach(async () => {
    if (!databaseUrl || !savedIdea) return;
    const sql = postgres(databaseUrl, { max: 1, prepare: false });
    try {
      await sql`DELETE FROM idea_validator_submissions WHERE idea_text = ${savedIdea}`;
    } finally {
      await sql.end({ timeout: 5 });
      savedIdea = undefined;
    }
  });

  integrationTest("persists the opted-in request, full result, IP, and expiry", async () => {
    vi.stubEnv("JEV_IDEA_RETENTION_CLEANUP_SCHEDULED", "true");
    const idea = `Integration record ${Date.now()} describes a testable software product.`;
    savedIdea = idea;
    const now = Date.now();
    const result = {
      overall: 72,
      verdict: "SHIP" as const,
      goal: "money" as const,
      dimensions: [],
      best: { id: "problem" as const, label: "Problem", score: 75, rawScore: 3 },
      risk: { id: "reach" as const, label: "Reach", score: 50, rawScore: 2 },
    };

    await saveIdeaValidatorSubmission({
      idea,
      goal: "money",
      result,
      ipAddress: "198.51.100.42",
    });

    const sql = postgres(databaseUrl!, { max: 1, prepare: false });
    try {
      const [row] = await sql<{
        goal: string;
        result_json: typeof result;
        ip_address: string;
        consent_version: string;
        expires_at: Date;
      }[]>`
        SELECT goal, result_json, ip_address::text, consent_version, expires_at
        FROM idea_validator_submissions
        WHERE idea_text = ${idea}
      `;

      expect(row.goal).toBe("money");
      expect(row.result_json).toEqual(result);
      expect(row.ip_address).toBe("198.51.100.42/32");
      expect(row.consent_version).toBe(IDEA_SUBMISSION_CONSENT_VERSION);
      expect(new Date(row.expires_at).getTime()).toBeGreaterThan(
        now + (IDEA_SUBMISSION_RETENTION_DAYS - 1) * 24 * 60 * 60 * 1000,
      );
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
});
