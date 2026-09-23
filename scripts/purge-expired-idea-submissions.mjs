import postgres from "postgres";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is required to purge expired Idea Validator records.");
  process.exitCode = 1;
} else {
  const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 5 });
  try {
    const deleted = await sql`
      DELETE FROM idea_validator_submissions
      WHERE expires_at <= now()
      RETURNING id
    `;
    console.log(`Deleted ${deleted.length} expired Idea Validator record(s).`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}
