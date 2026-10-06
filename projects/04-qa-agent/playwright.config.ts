import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.STOREFRONT_PORT ?? 3000);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  // The storefront keeps state in-process; serial runs keep sessions independent and simple.
  workers: 1,
  // One retry in CI produces the pass-after-fail signal that flaky detection relies on.
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['./e2e/reporter.ts', { endpoint: process.env.DIAGNOSIS_URL ?? 'http://localhost:4000' }],
  ],
  webServer: {
    command: 'npx tsx storefront/server.ts',
    url: `${baseURL}/health`,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(port), BUG: process.env.BUG ?? '' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
