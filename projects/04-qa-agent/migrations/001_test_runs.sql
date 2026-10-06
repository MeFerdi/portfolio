-- One row per E2E suite run, and one row per test attempt within it.
CREATE TABLE IF NOT EXISTS test_runs (
  run_id      TEXT PRIMARY KEY,
  git_sha     TEXT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_results (
  id          BIGSERIAL PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES test_runs (run_id) ON DELETE CASCADE,
  test_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  file        TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'timedOut', 'skipped', 'interrupted')),
  retry       INTEGER NOT NULL CHECK (retry >= 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  -- Makes re-delivery of a spooled run a no-op.
  UNIQUE (run_id, test_id, retry)
);

CREATE INDEX IF NOT EXISTS test_runs_git_sha_idx ON test_runs (git_sha);
CREATE INDEX IF NOT EXISTS test_runs_started_at_idx ON test_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS test_results_test_id_idx ON test_results (test_id);
