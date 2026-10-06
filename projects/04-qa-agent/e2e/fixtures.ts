import { test as base, expect, type Page } from '@playwright/test';

/**
 * Every spec imports `test` from here. The auto fixture records browser console
 * output and attaches it on failure, so the reporter can ship it to diagnosis.
 */
export const test = base.extend<{ consoleCapture: void }>({
  consoleCapture: [
    async ({ page }, use, testInfo) => {
      const lines: string[] = [];
      page.on('console', (msg) => lines.push(`[${msg.type()}] ${msg.text()}`));
      page.on('pageerror', (err) => lines.push(`[pageerror] ${err.message}`));
      await use();
      if (testInfo.status !== testInfo.expectedStatus && lines.length > 0) {
        await testInfo.attach('console-logs', { body: lines.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],
});

export { expect };

export const DEMO_USER = { email: 'demo@shop.test', password: 'correct-horse' } as const;

export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('email').fill(DEMO_USER.email);
  await page.getByTestId('password').fill(DEMO_USER.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/products$/);
}
