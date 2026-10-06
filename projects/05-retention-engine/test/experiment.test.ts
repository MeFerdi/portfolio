import { assignCohort } from '../src/experiment/cohort';
import { completionByCohort, duplicateSendRate } from '../src/experiment/measure';
import { normalCdf, twoProportionZTest } from '../src/experiment/stats';
import { ev } from './builders';

describe('cohort assignment', () => {
  const ids = Array.from({ length: 10_000 }, (_, i) => `user-${i}`);

  it('is deterministic for a given salt', () => {
    const cfg = { salt: 'exp-a', interventionShare: 0.5 };
    expect(ids.map((id) => assignCohort(id, cfg))).toEqual(ids.map((id) => assignCohort(id, cfg)));
  });

  it.each([0.5, 0.2, 0.9])('approximates a %s intervention split', (share) => {
    const n = ids.filter((id) => assignCohort(id, { salt: 'exp-a', interventionShare: share }) === 'intervention').length;
    expect(Math.abs(n / ids.length - share)).toBeLessThan(0.02);
  });

  it('handles the 0 and 1 edges and rejects out-of-range shares', () => {
    expect(assignCohort('u', { salt: 's', interventionShare: 0 })).toBe('control');
    expect(assignCohort('u', { salt: 's', interventionShare: 1 })).toBe('intervention');
    expect(() => assignCohort('u', { salt: 's', interventionShare: 1.5 })).toThrow();
  });

  it('reshuffles when the salt changes', () => {
    const a = ids.map((id) => assignCohort(id, { salt: 'exp-a', interventionShare: 0.5 }));
    const b = ids.map((id) => assignCohort(id, { salt: 'exp-b', interventionShare: 0.5 }));
    const same = a.filter((c, i) => c === b[i]).length;
    expect(same / ids.length).toBeGreaterThan(0.45);
    expect(same / ids.length).toBeLessThan(0.55);
  });
});

describe('two-proportion z-test', () => {
  it('matches a hand-computed example', () => {
    // 60/200 vs 40/200: pooled p = 0.25, se = sqrt(0.25*0.75*0.01) = 0.0433, z = 0.1/0.0433 = 2.309
    const r = twoProportionZTest(60, 200, 40, 200);
    expect(r.diff).toBeCloseTo(0.1, 10);
    expect(r.z).toBeCloseTo(2.3094, 3);
    expect(r.pValue).toBeCloseTo(0.0209, 3);
  });

  it('is symmetric and returns p = 1 for identical proportions', () => {
    expect(twoProportionZTest(40, 200, 60, 200).z).toBeCloseTo(-2.3094, 3);
    const same = twoProportionZTest(30, 100, 30, 100);
    expect(same.z).toBe(0);
    expect(same.pValue).toBeCloseTo(1, 6);
    expect(twoProportionZTest(0, 50, 0, 50)).toMatchObject({ z: 0, pValue: 1 });
  });

  it('rejects impossible counts', () => {
    expect(() => twoProportionZTest(5, 0, 1, 10)).toThrow();
    expect(() => twoProportionZTest(11, 10, 1, 10)).toThrow();
  });

  it('uses an accurate normal CDF', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.959964)).toBeCloseTo(0.975, 5);
  });
});

describe('measurement', () => {
  it('computes completion per arm among flagged users (intention-to-treat)', () => {
    const flagged = [
      { userId: 'a', cohort: 'intervention' as const },
      { userId: 'b', cohort: 'intervention' as const },
      { userId: 'c', cohort: 'control' as const },
      { userId: 'd', cohort: 'control' as const },
    ];
    const events = [ev('first_success_reached', 1, { userId: 'a' }), ev('first_success_reached', 1, { userId: 'zz' })];
    const r = completionByCohort(flagged, events);
    expect(r.intervention).toEqual({ flagged: 2, completed: 1, rate: 0.5 });
    expect(r.control).toEqual({ flagged: 2, completed: 0, rate: 0 });
    expect(r.test).not.toBeNull();
  });

  it('computes the duplicate-send rate', () => {
    expect(duplicateSendRate(new Map([['k1', 1], ['k2', 2], ['k3', 1], ['k4', 1]]))).toBe(0.25);
    expect(duplicateSendRate(new Map())).toBe(0);
  });
});
