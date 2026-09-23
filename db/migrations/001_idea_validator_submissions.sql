CREATE TABLE IF NOT EXISTS idea_validator_submissions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idea_text TEXT NOT NULL CHECK (char_length(idea_text) BETWEEN 20 AND 3000),
  goal TEXT NOT NULL CHECK (goal IN ('money', 'open_source', 'fun')),
  result_json JSONB NOT NULL,
  ip_address INET,
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idea_validator_submissions_expires_at_idx
  ON idea_validator_submissions (expires_at);

CREATE INDEX IF NOT EXISTS idea_validator_submissions_ip_created_at_idx
  ON idea_validator_submissions (ip_address, created_at DESC);
