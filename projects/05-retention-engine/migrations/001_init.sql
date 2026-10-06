-- Onboarding & retention engine: initial schema.

CREATE TABLE users (
  id          text PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  name        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- System of record for onboarding events. Append-only.
CREATE TABLE events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          text NOT NULL,
  type             text NOT NULL,
  occurred_at      timestamptz NOT NULL,
  received_at      timestamptz NOT NULL DEFAULT now(),
  -- Client-supplied. A retried request with the same key is acknowledged, not re-stored.
  idempotency_key  text NOT NULL,
  payload          jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT events_idempotency_key_uniq UNIQUE (idempotency_key)
);
CREATE INDEX events_user_time_idx ON events (user_id, occurred_at);
CREATE INDEX events_type_time_idx ON events (type, occurred_at);

-- One row per (user, stalled step, rule version), for BOTH experiment arms.
-- The primary key is the "never email the same stall twice" guarantee.
CREATE TABLE interventions (
  intervention_key     text PRIMARY KEY,
  user_id              text NOT NULL,
  stalled_at_step      text NOT NULL,
  rule_version         text NOT NULL,
  cohort               text NOT NULL CHECK (cohort IN ('intervention', 'control')),
  risk_score           numeric(4, 2) NOT NULL,
  signals              jsonb NOT NULL,
  status               text NOT NULL
                       CHECK (status IN ('control_logged', 'pending', 'drafted', 'sent', 'dead_lettered')),
  diagnosis            jsonb,
  provider_message_id  text,
  sent_at              timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interventions_stall_uniq UNIQUE (user_id, stalled_at_step, rule_version),
  -- Control users must never reach a sending state.
  CONSTRAINT interventions_control_never_sent CHECK (cohort = 'intervention' OR status = 'control_logged')
);
CREATE INDEX interventions_user_idx ON interventions (user_id);

-- Jobs that exhausted their retries. Reviewed by a human; never silently dropped.
CREATE TABLE dead_letters (
  id                bigserial PRIMARY KEY,
  queue             text NOT NULL,
  job_id            text NOT NULL,
  intervention_key  text REFERENCES interventions (intervention_key),
  error             text NOT NULL,
  attempts          integer NOT NULL,
  payload           jsonb NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  resolved_at       timestamptz
);
