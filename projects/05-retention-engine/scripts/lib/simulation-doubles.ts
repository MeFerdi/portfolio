/**
 * SYNTHETIC-ONLY test doubles for scripts/simulate.ts. Nothing here is used by
 * the production entrypoints.
 */
import type { z } from 'zod';
import type { LlmClient, StructuredRequest } from '../../src/llm/client';
import type { Mailer, OutboundEmail, SendResult } from '../../src/mail/mailer';
import { FIRST_NAME_TOKEN } from '../../src/workers/diagnose-and-draft';

/**
 * Deterministic stand-in for the model when --llm is not passed: drafts a
 * templated diagnosis that cites the event ids found in the prompt. It lets the
 * pipeline run end to end offline; it says nothing about real draft quality.
 */
export class TemplateDiagnosisLlm implements LlmClient {
  async structured<T extends z.ZodType>(req: StructuredRequest<T>): Promise<z.infer<T>> {
    const ids = [...req.prompt.matchAll(/^\[([^\]]+)\]/gm)].map((m) => m[1]);
    const step = /Stalled at step: (\w+)/.exec(req.prompt)?.[1] ?? 'unknown';
    const cited = ids.slice(-2);
    return req.schema.parse({
      likelyReason: `[synthetic template] User has not completed ${step}.`,
      evidence: cited.map((eventId) => ({ eventId, observation: 'Most recent activity before the stall.' })),
      recommendedAction: `Nudge the user to complete ${step}.`,
      email: {
        subject: `Need a hand with ${step.replace('_', ' ')}?`,
        body: `Hi ${FIRST_NAME_TOKEN},\n\n[synthetic template email]\n\nReply to this email if anything is blocking you.`,
      },
    });
  }
}

/**
 * Worst-case provider: does NOT dedupe on idempotency key, and fails transiently
 * (before accepting the message) at `failureRate`. Counts deliveries per key so
 * the duplicate-send rate reflects only our own idempotency layers.
 */
export class ChaosMailer implements Mailer {
  readonly deliveredByKey = new Map<string, number>();
  attempts = 0;
  transientFailures = 0;

  constructor(
    private readonly random: () => number,
    private readonly failureRate: number,
  ) {}

  async send(email: OutboundEmail): Promise<SendResult> {
    this.attempts++;
    if (this.random() < this.failureRate) {
      this.transientFailures++;
      throw new Error('synthetic transient provider error (503)');
    }
    const n = (this.deliveredByKey.get(email.idempotencyKey) ?? 0) + 1;
    this.deliveredByKey.set(email.idempotencyKey, n);
    return { providerMessageId: `synthetic-${this.attempts}` };
  }
}
