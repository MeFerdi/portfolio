# AI-integrated systems

Five projects, each showing a different way to put AI into production software.
Each folder is self-contained (own `package.json`, tests, Docker setup and README), so it can be split into its own repository.

| # | Project | Integration pattern | Headline signal | Status |
|---|---|---|---|---|
| 1 | [AI Growth Engineer Pipeline](01-growth-pipeline) | LLM agent + automation + CRM data | Pipeline / revenue impact | In progress |
| 2 | [Support Agent with Live CRM Sync](02-support-agent) | Tool-calling agent with permission model | Guardrailed action-taking | Up next |
| 3 | [RAG Assistant with Evaluation Harness](03-rag-assistant) | Retrieval + CI evals | AI reliability | Planned |
| 4 | [Autonomous E-Commerce QA Agent](04-qa-agent) | Deterministic E2E + AI diagnosis | Quality engineering | Planned |
| 5 | [Onboarding & Retention Engine](05-retention-engine) | Event pipeline + AI intervention | Closed-loop growth | Planned |

## Shared conventions

- **Stack:** Node 22, TypeScript (strict), Jest, PostgreSQL + pgvector, BullMQ/Redis, Docker.
- **One LLM seam:** every model call goes through `src/llm/client.ts` (`LlmClient`). Output is schema-validated with Zod;
  anything that doesn't validate throws `LlmOutputError` and never reaches business logic. Tests inject `FakeLlm`.
- **Model:** Anthropic Claude via `@anthropic-ai/sdk`, `LLM_MODEL` env (default `claude-opus-5-5`), with
  server-side refusal fallbacks enabled. Point bulk stages at a cheaper model by setting `LLM_MODEL`.
- **Tests run offline:** `npm test` needs no API key, database or Redis. Tests that need real infrastructure live in
  `test/integration/` and run with `INTEGRATION=1`.
- **Honest results:** each README's Results table says "not yet measured" until there's a reproducible run behind the number.

## Running one project

```bash
cd projects/01-growth-pipeline
cp .env.example .env
docker compose up -d      # Postgres/Redis where needed
npm install
npm test
npm run dev
```

CI for all five runs from [`.github/workflows/projects-ci.yml`](../.github/workflows/projects-ci.yml).

## Splitting a project into its own repo

Separate repos pin better on a GitHub profile. To extract one with its history:

```bash
git subtree split --prefix=projects/01-growth-pipeline -b split/growth-pipeline
# create an empty repo on GitHub, then:
git push git@github.com:MeFerdi/ai-growth-pipeline.git split/growth-pipeline:main
```

Each project carries its own `.github/workflows/ci.yml`, which becomes active once it sits at a repo root.
Afterwards, update the `REPO` links in `components/portfolio/ProjectsSection.jsx`.

## Build order

Projects ship one at a time, each portfolio-worthy on its own: 1 → 2 → 3 → 4 → 5. Aim to deploy at least three
(Fly.io / Railway / Render) and link live URLs from the portfolio.
