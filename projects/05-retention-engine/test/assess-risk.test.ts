import { assessRisk, DEFAULT_RULES } from '../src/workers/assess-risk';
import { ev, hours } from './builders';

describe('assessRisk', () => {
  it('returns no risk for an empty trail or a fully onboarded user', () => {
    expect(assessRisk([], hours(100), DEFAULT_RULES)).toMatchObject({ stalledAtStep: null, riskScore: 0 });
    const done = ['signed_up', 'email_verified', 'project_created', 'teammate_invited', 'payment_added', 'first_success_reached'] as const;
    const trail = done.map((t, i) => ev(t, i));
    expect(assessRisk(trail, hours(1000), DEFAULT_RULES)).toMatchObject({ stalledAtStep: null, nextStep: null });
  });

  it('does not flag a user who is still within the step window', () => {
    const trail = [ev('signed_up', 0)];
    const r = assessRisk(trail, hours(23), DEFAULT_RULES); // verify_email window is 24h
    expect(r).toMatchObject({ stalledAtStep: null, nextStep: 'verify_email', riskScore: 0 });
  });

  it('flags inactivity past the per-step threshold, and adds long_inactive past 2x', () => {
    const signup = ev('signed_up', 0);
    const r1 = assessRisk([signup], hours(24), DEFAULT_RULES);
    expect(r1.stalledAtStep).toBe('verify_email');
    expect(r1.riskScore).toBe(0.5);
    expect(r1.signals).toEqual([
      { code: 'inactive', hoursSinceLastEvent: 24, thresholdHours: 24, eventIds: [signup.id] },
    ]);

    const r2 = assessRisk([signup], hours(48), DEFAULT_RULES);
    expect(r2.signals.map((s) => s.code)).toEqual(['inactive', 'long_inactive']);
    expect(r2.riskScore).toBe(0.75);
  });

  it('flags repeated failures on the current step even when the user is active', () => {
    const trail = [
      ev('signed_up', 0),
      ev('email_verified', 1),
      ev('project_created', 2),
      ev('teammate_invited', 3),
      ev('payment_failed', 4, { reason: 'card_declined' }),
      ev('payment_failed', 5, { reason: 'insufficient_funds' }),
    ];
    const r = assessRisk(trail, hours(6), DEFAULT_RULES);
    expect(r.stalledAtStep).toBe('add_payment');
    expect(r.signals).toEqual([
      expect.objectContaining({ code: 'repeated_failures', failureCount: 2, reasons: ['card_declined', 'insufficient_funds'] }),
    ]);
  });

  it('treats a single recent failure as a signal but not a stall', () => {
    const trail = [ev('signed_up', 0), ev('email_verification_failed', 1, { reason: 'link_expired' })];
    const r = assessRisk(trail, hours(2), DEFAULT_RULES);
    expect(r).toMatchObject({ stalledAtStep: null, riskScore: 0.2 });
    expect(r.signals[0]).toMatchObject({ code: 'failed_attempt', reason: 'link_expired' });
  });

  it('ignores failures on steps already completed', () => {
    const trail = [
      ev('signed_up', 0),
      ev('email_verification_failed', 1, { reason: 'link_expired' }),
      ev('email_verification_failed', 2, { reason: 'link_expired' }),
      ev('email_verified', 3),
    ];
    expect(assessRisk(trail, hours(4), DEFAULT_RULES)).toMatchObject({ stalledAtStep: null, nextStep: 'create_project' });
  });

  it('caps the score at 1 and is independent of input order', () => {
    const trail = [
      ev('signed_up', 0),
      ev('payment_failed', 1, { reason: 'card_declined' }), // not current step: ignored
      ev('email_verification_failed', 2, { reason: 'bounced' }),
      ev('email_verification_failed', 3, { reason: 'bounced' }),
    ];
    const r = assessRisk([...trail].reverse(), hours(200), DEFAULT_RULES);
    expect(r.riskScore).toBe(1);
    expect(r).toEqual(assessRisk(trail, hours(200), DEFAULT_RULES));
  });
});
