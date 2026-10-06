import { z } from 'zod';

/** The onboarding funnel, in order. A user "completes onboarding" at first_success. */
export const ONBOARDING_STEPS = [
  'signup',
  'verify_email',
  'create_project',
  'invite_teammate',
  'add_payment',
  'first_success',
] as const;

export const OnboardingStep = z.enum(ONBOARDING_STEPS);
export type OnboardingStep = z.infer<typeof OnboardingStep>;

/** Fields every event carries, whatever produced it. */
const EventBase = z.object({
  userId: z.string().min(1).max(128),
  // UTC only ("...Z"), so ISO strings sort chronologically.
  occurredAt: z.iso.datetime(),
  /** Client-supplied; the store keeps at most one event per key. */
  idempotencyKey: z.string().min(8).max(200),
});

const completed = <T extends string>(type: T) => EventBase.extend({ type: z.literal(type) });
const failed = <T extends string, R extends readonly [string, ...string[]]>(type: T, reasons: R) =>
  EventBase.extend({ type: z.literal(type), reason: z.enum(reasons) });

export const EventInput = z.discriminatedUnion('type', [
  completed('signed_up'),
  completed('email_verified'),
  failed('email_verification_failed', ['link_expired', 'bounced']),
  completed('project_created'),
  failed('project_creation_failed', ['validation_error', 'quota_exceeded']),
  completed('teammate_invited'),
  failed('teammate_invite_failed', ['invalid_email', 'seat_limit_reached']),
  completed('payment_added'),
  failed('payment_failed', [
    'card_declined',
    'insufficient_funds',
    'expired_card',
    'authentication_required',
  ]),
  completed('first_success_reached'),
]);
export type EventInput = z.infer<typeof EventInput>;
export type EventType = EventInput['type'];

/** What the store returns: the validated input plus server-assigned fields. */
export type StoredEvent = EventInput & { id: string; receivedAt: string };

/** Which funnel step each event type belongs to, and whether it advanced the user. */
export const EVENT_STEP: Record<EventType, { step: OnboardingStep; outcome: 'completed' | 'failed' }> = {
  signed_up: { step: 'signup', outcome: 'completed' },
  email_verified: { step: 'verify_email', outcome: 'completed' },
  email_verification_failed: { step: 'verify_email', outcome: 'failed' },
  project_created: { step: 'create_project', outcome: 'completed' },
  project_creation_failed: { step: 'create_project', outcome: 'failed' },
  teammate_invited: { step: 'invite_teammate', outcome: 'completed' },
  teammate_invite_failed: { step: 'invite_teammate', outcome: 'failed' },
  payment_added: { step: 'add_payment', outcome: 'completed' },
  payment_failed: { step: 'add_payment', outcome: 'failed' },
  first_success_reached: { step: 'first_success', outcome: 'completed' },
};

export function isFailure(event: EventInput): event is Extract<EventInput, { reason: string }> {
  return EVENT_STEP[event.type].outcome === 'failed';
}
