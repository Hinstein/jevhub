# Idea Validator records

The database exception is limited to opt-in Startup Idea Validator submissions.
It stores the idea text, selected goal, full structured result, request IP when
provided by the server proxy, consent copy version, consent timestamp, and
expiry timestamp. Inbox Triage emails, Playground state, and analytics payloads
are not stored here.

The route reads the first valid IP in `X-Forwarded-For`, then falls back to
`X-Real-IP`. The deployment proxy must overwrite these headers; otherwise the
value may be forged. If neither header contains a valid IP, the database stores
`NULL` for that field.

Apply `migrations/001_idea_validator_submissions.sql` to the PostgreSQL database
referenced by the server-only `DATABASE_URL`. Use a least-privilege database
role that can access only this table where the hosting provider supports it.
Do not enable public scoring with consented retention until the migration is
applied and the daily cleanup job is scheduled.

Records expire 29 days after consent, and are kept for no longer than 30 days
when the daily cleanup job runs as scheduled. Each new saved submission also
removes expired rows before inserting. Schedule `npm run db:purge-expired-ideas`
once per day in the deployment environment so expired rows are removed during
quiet periods. Run the script with the server-side `DATABASE_URL`:

```bash
npm run db:purge-expired-ideas
```

Set `JEV_IDEA_RETENTION_CLEANUP_SCHEDULED=true` in the server environment only
after the daily job is active. The application refuses database writes while
this setting is false or missing.

The script runs this operation:

```sql
DELETE FROM idea_validator_submissions WHERE expires_at <= now();
```

To inspect recent saved submissions:

```sql
SELECT
  created_at,
  ip_address,
  idea_text,
  goal,
  result_json->>'overall' AS overall_score,
  result_json->>'verdict' AS verdict,
  result_json->'dimensions' AS dimensions
FROM idea_validator_submissions
WHERE expires_at > now()
ORDER BY created_at DESC;
```

The browser must send `consentToRetention: true` before the route attempts an
insert. If the database is unavailable, scoring still succeeds and the user is
told that no record was saved.

The PostgreSQL integration test is skipped by default. Run it only against an
isolated test database by setting `JEV_RUN_DATABASE_INTEGRATION=1`,
`JEV_IDEA_RETENTION_CLEANUP_SCHEDULED=true`, and `DATABASE_URL`; do not point it
at production data.
