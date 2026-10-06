import type { FailureEvent } from '../../src/contracts/failure-event';

export const REPO_ROOT = '/repo';

/** A realistic checkout failure, as the reporter would emit it with BUG=checkout-total. */
export const checkoutTotalFailure: FailureEvent = {
  schemaVersion: 1,
  runId: 'run-0001',
  testId: 'checkout-abc123',
  title: 'order total equals the sum of line totals',
  titlePath: ['chromium', 'checkout.spec.ts', 'checkout', 'order total equals the sum of line totals'],
  file: 'e2e/checkout.spec.ts',
  retry: 0,
  status: 'failed',
  error: {
    message:
      'Error: expect(locator).toHaveText(expected) failed\n\nLocator: getByTestId(\'order-total\')\nExpected: "$49.97"\nReceived: "$34.98"',
    stack:
      'Error: expect(locator).toHaveText(expected) failed\n    at /repo/e2e/checkout.spec.ts:14:51\n    at /repo/node_modules/playwright/lib/worker/workerMain.js:300:7',
  },
  consoleLogs: ['[info] [storefront] page=checkout total=3498'],
  screenshotPath: '/repo/test-results/checkout/test-failed-1.png',
  tracePath: '/repo/test-results/checkout/trace.zip',
  gitSha: '0123456789abcdef0123456789abcdef01234567',
  timestamp: '2026-10-07T09:30:00.000Z',
};

/** Same test and error shape, different volatile values: must dedup with the above. */
export const checkoutTotalFailureRepeat: FailureEvent = {
  ...checkoutTotalFailure,
  runId: 'run-0002',
  error: {
    ...checkoutTotalFailure.error,
    message: checkoutTotalFailure.error.message.replace('$34.98', '$29.99'),
  },
  timestamp: '2026-10-07T09:35:00.000Z',
};

export const VALID_FIXTURES: FailureEvent[] = [
  checkoutTotalFailure,
  checkoutTotalFailureRepeat,
  { ...checkoutTotalFailure, testId: 'login-1', status: 'timedOut', screenshotPath: null, tracePath: null, consoleLogs: [], error: { message: 'Test timeout of 30000ms exceeded.' } },
];

const { gitSha: _omitSha, ...withoutSha } = checkoutTotalFailure;

export const MALFORMED_FIXTURES: Record<string, unknown> = {
  'empty object': {},
  'not an object': 'boom',
  'missing gitSha': withoutSha,
  'wrong schema version': { ...checkoutTotalFailure, schemaVersion: 2 },
  'status passed is not a failure': { ...checkoutTotalFailure, status: 'passed' },
  'empty error message': { ...checkoutTotalFailure, error: { message: '' } },
  'timestamp not ISO': { ...checkoutTotalFailure, timestamp: 'yesterday' },
  'negative retry': { ...checkoutTotalFailure, retry: -1 },
};

export const REPO_INDEX = [
  'e2e/checkout.spec.ts',
  'e2e/fixtures.ts',
  'storefront/lib/pricing.ts',
  'storefront/routes/checkout.ts',
  'storefront/routes/cart.ts',
  'storefront/store.ts',
];
