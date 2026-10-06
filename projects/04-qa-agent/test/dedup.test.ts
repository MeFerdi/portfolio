import type { BugReport } from '../src/reporting/bug-report';
import { Deduplicator, dedupKey, errorSignature } from '../src/reporting/dedup';
import { checkoutTotalFailure, checkoutTotalFailureRepeat } from './fixtures/failure-events';

const WINDOW = 10 * 60_000;
const t0 = new Date('2026-10-07T09:00:00Z');
const at = (minutes: number) => new Date(t0.getTime() + minutes * 60_000);

function report(): BugReport {
  return {
    event: checkoutTotalFailure,
    diagnosis: null,
    diagnosisError: 'n/a',
    droppedPaths: [],
    occurrences: 1,
    firstSeen: t0.toISOString(),
    lastSeen: t0.toISOString(),
  };
}

describe('error signature', () => {
  it('ignores volatile values such as prices, ids and timeouts', () => {
    expect(errorSignature('Expected: "$49.97"\nReceived: "$34.98"')).toBe(errorSignature('Expected: "$49.97"\nReceived: "$29.99"'));
    expect(errorSignature('Test timeout of 30000ms exceeded.')).toBe(errorSignature('Test timeout of 45000ms exceeded.'));
    expect(errorSignature('order 3fa85f64aa not found')).toBe(errorSignature('order 9bc1d2e3ff not found'));
  });

  it('distinguishes different failures', () => {
    expect(errorSignature('expect(locator).toHaveText(expected) failed')).not.toBe(
      errorSignature('expect(locator).toBeVisible() failed'),
    );
  });

  it('keys on test id plus signature', () => {
    expect(dedupKey(checkoutTotalFailure)).toBe(dedupKey(checkoutTotalFailureRepeat));
    expect(dedupKey(checkoutTotalFailure)).not.toBe(dedupKey({ ...checkoutTotalFailure, testId: 'other' }));
  });
});

describe('Deduplicator', () => {
  it('reports the first occurrence and counts repeats inside the window', () => {
    const d = new Deduplicator(WINDOW);
    expect(d.observe('k', at(0))).toEqual({ action: 'report', occurrences: 1 });
    expect(d.observe('k', at(2))).toEqual({ action: 'suppress', occurrences: 2 });
    expect(d.observe('k', at(9))).toEqual({ action: 'suppress', occurrences: 3 });
    expect(d.observe('other', at(9))).toEqual({ action: 'report', occurrences: 1 });
  });

  it('opens a new window after expiry', () => {
    const d = new Deduplicator(WINDOW);
    d.observe('k', at(0));
    expect(d.observe('k', at(10))).toEqual({ action: 'report', occurrences: 1 });
  });

  it('emits one follow-up with the occurrence count when a window with repeats closes', () => {
    const d = new Deduplicator(WINDOW);
    d.observe('k', at(0));
    d.attachReport('k', report());
    d.observe('k', at(3));
    d.observe('k', at(7));

    expect(d.flushExpired(at(5))).toEqual([]);
    const [followUp, ...rest] = d.flushExpired(at(11));
    expect(rest).toEqual([]);
    expect(followUp).toMatchObject({ occurrences: 3, firstSeen: at(0).toISOString(), lastSeen: at(7).toISOString() });
    expect(d.flushExpired(at(30))).toEqual([]); // emitted once
  });

  it('sends no follow-up for a failure seen once', () => {
    const d = new Deduplicator(WINDOW);
    d.observe('k', at(0));
    d.attachReport('k', report());
    expect(d.flushExpired(at(11))).toEqual([]);
  });
});
