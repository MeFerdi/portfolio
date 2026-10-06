# Demo loop: 60-second recording

Goal of the clip: a deliberately broken checkout is caught by a deterministic
Playwright assertion, diagnosed by the agent, and lands in Slack as a structured
bug report pointing at the right file.

## Before recording (not on camera)

```bash
cp .env.example .env            # set SLACK_WEBHOOK_URL (a test channel) and ANTHROPIC_API_KEY
npm ci
npx playwright install chromium
docker compose up -d postgres
npm run db:migrate
```

Dry-run once end to end, then clear the Slack channel.

Layout: terminal on the left (two panes), Slack channel on the right.

## On camera

| Time | Action | What the viewer sees |
| --- | --- | --- |
| 0:00 | Pane A: `npm run diagnosis` | `diagnosis service listening`, channels `["slack"]` |
| 0:05 | Pane B: `npm run e2e` | 5 tests pass against the healthy storefront |
| 0:15 | Pane B: `BUG=checkout-total npm run e2e` | storefront restarts with the fault; checkout spec fails with `Expected "$49.97" Received "$34.98"` |
| 0:30 | Pane A | reporter POST accepted, `diagnose-failure` call, report sent |
| 0:40 | Slack | report: summary, root cause, suspected file `storefront/lib/pricing.ts`, confidence, next step, raw assertion error |
| 0:50 | Pane B: `BUG=checkout-total npm run e2e` again | fails again; Pane A logs `duplicate failure suppressed`, no second Slack message |
| 0:55 | Voice-over / caption | "The test decides pass/fail. The AI only explains it." |

Notes:

- `reuseExistingServer` is off in CI only; locally, stop any storefront already on
  port 3000 before switching `BUG=` values, or Playwright will reuse the healthy one.
- The diagnosis service and the runner must share a filesystem for the screenshot
  to be attached (true when both run on your machine).
- Ground truth for the injected bug is in `storefront/faults.ts`. Check the report
  against it before publishing the clip; do not cut a take where the diagnosis was wrong
  without saying so.
