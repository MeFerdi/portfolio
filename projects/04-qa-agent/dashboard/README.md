# dashboard (phase 2, not built)

Planned: a small Next.js app over the `test_runs` / `test_results` tables showing

- pass-rate trend per run (`passRateTrend` in `src/health/metrics.ts`)
- flaky tests, i.e. passed and failed on the same commit (`detectFlaky`)
- recent bug reports with their AI diagnosis

The metric functions already exist and are unit-tested; this folder is a placeholder
so the layout is clear. Nothing here runs yet.
