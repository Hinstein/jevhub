import "server-only";
import postgres from "postgres";
import type { IdeaValidatorResult } from "@/lib/idea-validator";

// Expire one day early so a daily cleanup run removes rows within 30 days.
export const IDEA_SUBMISSION_RETENTION_DAYS = 29;
export const IDEA_SUBMISSION_CONSENT_VERSION = "2026-09-23-v1";

export type IdeaValidatorSubmission = {
  idea: string;
  goal: IdeaValidatorResult["goal"];
  result: IdeaValidatorResult;
  ipAddress: string | null;
};

type Sql = ReturnType<typeof postgres>;

const globalSql = globalThis as typeof globalThis & {
  __jevHubIdeaSubmissionSql?: Sql;
};

function getDatabase(): Sql {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not configured.");
  if (process.env.JEV_IDEA_RETENTION_CLEANUP_SCHEDULED !== "true") {
    throw new Error("Daily Idea Validator retention cleanup is not configured.");
  }

  if (!globalSql.__jevHubIdeaSubmissionSql) {
    globalSql.__jevHubIdeaSubmissionSql = postgres(url, {
      max: 1,
      prepare: false,
      connect_timeout: 5,
      idle_timeout: 20,
    });
  }

  return globalSql.__jevHubIdeaSubmissionSql;
}

export async function saveIdeaValidatorSubmission(
  submission: IdeaValidatorSubmission,
): Promise<void> {
  const sql = getDatabase();

  await sql.begin(async (transaction) => {
    await transaction`
      DELETE FROM idea_validator_submissions
      WHERE expires_at <= now()
    `;

    await transaction`
      INSERT INTO idea_validator_submissions (
        idea_text,
        goal,
        result_json,
        ip_address,
        consent_version,
        consented_at,
        expires_at
      ) VALUES (
        ${submission.idea},
        ${submission.goal},
        ${sql.json(submission.result)},
        ${submission.ipAddress},
        ${IDEA_SUBMISSION_CONSENT_VERSION},
        now(),
        now() + (${IDEA_SUBMISSION_RETENTION_DAYS} * interval '1 day')
      )
    `;
  });
}
