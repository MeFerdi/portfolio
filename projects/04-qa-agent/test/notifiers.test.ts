import type { Diagnosis } from '../src/contracts/diagnosis';
import type { BugReport } from '../src/reporting/bug-report';
import { buildDiscordMessage } from '../src/reporting/discord';
import { FanoutNotifier, type Notifier } from '../src/reporting/notifier';
import { buildSlackMessage } from '../src/reporting/slack';
import { postJson } from '../src/reporting/webhook';
import { checkoutTotalFailure } from './fixtures/failure-events';

const diagnosis: Diagnosis = {
  summary: 'Checkout total is $14.99 lower than the sum of line items.',
  likelyRootCause: 'orderTotalCents ignores line quantity, so the second mug is not charged.',
  suspectedFiles: [{ path: 'storefront/lib/pricing.ts', reason: 'computes the order total' }],
  confidence: 'medium',
  suggestedNextStep: 'Multiply priceCents by quantity in orderTotalCents and add a unit test for qty > 1.',
};

const diagnosed: BugReport = {
  event: checkoutTotalFailure,
  diagnosis,
  diagnosisError: null,
  droppedPaths: ['src/cart/totals.ts'],
  occurrences: 1,
  firstSeen: '2026-10-07T09:30:00.000Z',
  lastSeen: '2026-10-07T09:30:00.000Z',
};

const undiagnosed: BugReport = { ...diagnosed, diagnosis: null, diagnosisError: 'LLM output rejected', droppedPaths: [] };
const recurring: BugReport = { ...diagnosed, occurrences: 4, lastSeen: '2026-10-07T09:58:00.000Z' };

describe('Slack message builder', () => {
  it('renders a diagnosed report', () => expect(buildSlackMessage(diagnosed)).toMatchSnapshot());
  it('renders a report when diagnosis failed', () => expect(buildSlackMessage(undiagnosed)).toMatchSnapshot());
  it('mentions the occurrence count for recurring failures', () => {
    expect(JSON.stringify(buildSlackMessage(recurring))).toContain('Seen *4 times*');
  });
  it('keeps every section within Block Kit limits', () => {
    const huge: BugReport = { ...diagnosed, diagnosis: { ...diagnosis, summary: 'x'.repeat(10_000) } };
    for (const block of buildSlackMessage(huge).blocks) {
      if (block.type === 'section' && block.text) expect(block.text.text.length).toBeLessThanOrEqual(3000);
    }
  });
});

describe('Discord message builder', () => {
  it('renders a diagnosed report', () => expect(buildDiscordMessage(diagnosed)).toMatchSnapshot());
  it('renders a report when diagnosis failed', () => expect(buildDiscordMessage(undiagnosed)).toMatchSnapshot());
  it('keeps fields within embed limits', () => {
    const huge: BugReport = { ...diagnosed, event: { ...checkoutTotalFailure, error: { message: 'y'.repeat(5000) } } };
    for (const f of buildDiscordMessage(huge).embeds[0]?.fields ?? []) expect(f.value.length).toBeLessThanOrEqual(1024);
  });
});

describe('webhook delivery', () => {
  const noSleep = async () => undefined;

  it('retries 5xx then succeeds', async () => {
    const statuses = [502, 200];
    const fetch = jest.fn(async () => {
      const status = statuses.shift() ?? 200;
      return { ok: status < 300, status, text: async () => '' };
    });
    await postJson('https://hooks.example/x', { a: 1 }, { fetch, sleep: noSleep });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 400 (bad payload will not get better)', async () => {
    const fetch = jest.fn(async () => ({ ok: false, status: 400, text: async () => 'invalid_blocks' }));
    await expect(postJson('https://hooks.example/x', {}, { fetch, sleep: noSleep })).rejects.toThrow('400');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('gives up after the configured attempts', async () => {
    const fetch = jest.fn(async () => Promise.reject(new Error('ECONNRESET')));
    await expect(postJson('https://hooks.example/x', {}, { fetch, sleep: noSleep, attempts: 3 })).rejects.toThrow('3 attempts');
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

describe('fan-out', () => {
  const log = { error: jest.fn() };
  const ok: Notifier = { name: 'ok', send: async () => undefined };
  const down: Notifier = { name: 'down', send: async () => Promise.reject(new Error('boom')) };

  it('succeeds if at least one channel delivered', async () => {
    await expect(new FanoutNotifier([ok, down], log).send(diagnosed)).resolves.toBeUndefined();
    expect(log.error).toHaveBeenCalledTimes(1);
  });

  it('fails if every channel failed', async () => {
    await expect(new FanoutNotifier([down], log).send(diagnosed)).rejects.toThrow('All notifiers failed');
  });
});
