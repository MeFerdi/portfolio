import { EVENT_STEP, EventInput, isFailure } from '../src/events/schema';

const base = { userId: 'u1', occurredAt: '2026-10-01T10:00:00.000Z', idempotencyKey: 'idem-0001' };

describe('event schema', () => {
  it('accepts a completed step event', () => {
    expect(EventInput.parse({ ...base, type: 'project_created' }).type).toBe('project_created');
  });

  it('requires a known reason on failure events', () => {
    const ok = EventInput.parse({ ...base, type: 'payment_failed', reason: 'card_declined' });
    expect(isFailure(ok)).toBe(true);
    expect(EventInput.safeParse({ ...base, type: 'payment_failed' }).success).toBe(false);
    expect(EventInput.safeParse({ ...base, type: 'payment_failed', reason: 'cosmic_rays' }).success).toBe(false);
  });

  it('rejects unknown event types, missing keys and non-UTC timestamps', () => {
    expect(EventInput.safeParse({ ...base, type: 'logged_in' }).success).toBe(false);
    expect(EventInput.safeParse({ ...base, type: 'signed_up', idempotencyKey: undefined }).success).toBe(false);
    expect(
      EventInput.safeParse({ ...base, type: 'signed_up', occurredAt: '2026-10-01T10:00:00+02:00' }).success,
    ).toBe(false);
  });

  it('maps every event type to a funnel step', () => {
    expect(EVENT_STEP.payment_failed).toEqual({ step: 'add_payment', outcome: 'failed' });
    expect(EVENT_STEP.first_success_reached).toEqual({ step: 'first_success', outcome: 'completed' });
  });
});
