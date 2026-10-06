import type { EventInput } from '../events/schema';

/**
 * Mock product behaviour. Each onboarding action succeeds or fails based on
 * well-known test inputs (in the spirit of Stripe test cards), so demos and the
 * simulator can drive every failure path deterministically.
 */
type Outcome = Pick<EventInput, 'type'> & { reason?: string };

export const TEST_CARD_TOKENS: Record<string, string> = {
  tok_chargeDeclined: 'card_declined',
  tok_insufficientFunds: 'insufficient_funds',
  tok_expiredCard: 'expired_card',
  tok_authenticationRequired: 'authentication_required',
};

export function verifyEmailOutcome(token: string): Outcome {
  if (token === 'expired') return { type: 'email_verification_failed', reason: 'link_expired' };
  if (token === 'bounced') return { type: 'email_verification_failed', reason: 'bounced' };
  return { type: 'email_verified' };
}

export function createProjectOutcome(name: string, existingProjects: number): Outcome {
  if (name.trim().length === 0) return { type: 'project_creation_failed', reason: 'validation_error' };
  if (existingProjects >= 3) return { type: 'project_creation_failed', reason: 'quota_exceeded' };
  return { type: 'project_created' };
}

export function inviteOutcome(email: string, seatsUsed: number): Outcome {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { type: 'teammate_invite_failed', reason: 'invalid_email' };
  if (seatsUsed >= 5) return { type: 'teammate_invite_failed', reason: 'seat_limit_reached' };
  return { type: 'teammate_invited' };
}

export function paymentOutcome(cardToken: string): Outcome {
  const reason = TEST_CARD_TOKENS[cardToken];
  return reason ? { type: 'payment_failed', reason } : { type: 'payment_added' };
}
