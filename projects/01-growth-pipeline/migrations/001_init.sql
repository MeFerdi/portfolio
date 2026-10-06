-- AI Growth Pipeline: initial schema.
-- Every pipeline table is keyed by lead_key (a hash of the normalised lead
-- identity), so stage writes are upserts and replays are idempotent.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

CREATE TYPE lead_status AS ENUM ('ingested', 'researched', 'scored', 'disqualified', 'drafted', 'failed');
CREATE TYPE fit_verdict AS ENUM ('fit', 'partial', 'unfit');
CREATE TYPE draft_status AS ENUM ('pending_review', 'approved', 'rejected', 'sent');

CREATE TABLE leads (
  lead_key       text PRIMARY KEY,
  email          text,
  full_name      text,
  title          text,
  company_name   text,
  company_domain text,
  website_url    text,
  source         text NOT NULL,
  source_ref     text,
  status         lead_status NOT NULL DEFAULT 'ingested',
  last_error     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leads_status_idx ON leads (status);
CREATE INDEX leads_company_domain_idx ON leads (company_domain);

CREATE TABLE research (
  lead_key   text PRIMARY KEY REFERENCES leads (lead_key) ON DELETE CASCADE,
  profile    jsonb,          -- parsed CompanyProfile, NULL if the page could not be fetched
  summary    text NOT NULL,
  signals    jsonb NOT NULL DEFAULT '[]',
  unknowns   jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verdicts (
  lead_key         text PRIMARY KEY REFERENCES leads (lead_key) ON DELETE CASCADE,
  verdict          fit_verdict NOT NULL,
  reasons          jsonb NOT NULL,
  matched_criteria jsonb NOT NULL DEFAULT '[]',
  icp_version      text NOT NULL, -- which ICP definition produced this verdict
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verdicts_verdict_idx ON verdicts (verdict);

-- Drafts are never sent automatically; a human moves them out of pending_review.
CREATE TABLE drafts (
  lead_key               text PRIMARY KEY REFERENCES leads (lead_key) ON DELETE CASCADE,
  subject                text NOT NULL,
  body                   text NOT NULL,
  personalisation_points jsonb NOT NULL DEFAULT '[]',
  example_message_ids    uuid[] NOT NULL DEFAULT '{}',
  status                 draft_status NOT NULL DEFAULT 'pending_review',
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Historically successful outreach (e.g. got a positive reply), used as
-- few-shot examples for the drafter via similarity search.
-- Dimension 1024 matches EMBEDDING_DIMENSIONS (Voyage AI voyage-3.5 default).
CREATE TABLE successful_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject    text NOT NULL,
  body       text NOT NULL,
  context    text NOT NULL,          -- the lead/research text the embedding was computed from
  outcome    text NOT NULL,          -- e.g. 'positive_reply', 'meeting_booked'
  embedding  vector(1024) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX successful_messages_embedding_idx
  ON successful_messages USING hnsw (embedding vector_cosine_ops);
