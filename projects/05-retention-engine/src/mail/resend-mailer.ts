import type { Mailer, OutboundEmail, SendResult } from './mailer';
import { PermanentJobError } from '../queue/jobs';

/**
 * Resend (https://resend.com) over its REST API; no SDK needed for one endpoint.
 * Resend dedupes on the Idempotency-Key header for 24h, which covers the window
 * between a successful send and our DB recording it.
 *
 * Skeleton: compiles and has the right shape, but has not been exercised against
 * the live API yet. TODO: integration test with a Resend test key, bounce webhooks.
 */
export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(email: OutboundEmail): Promise<SendResult> {
    const res = await this.fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': email.idempotencyKey,
      },
      body: JSON.stringify({ from: this.from, to: [email.to], subject: email.subject, text: email.body }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const body = (await res.json()) as { id?: string };
      if (!body.id) throw new Error('Resend response missing id');
      return { providerMessageId: body.id };
    }
    const detail = await res.text();
    // 4xx other than rate limiting will not succeed on retry: dead-letter immediately.
    if (res.status >= 400 && res.status < 500 && res.status !== 429) {
      throw new PermanentJobError(`Resend rejected email (${res.status}): ${detail}`);
    }
    throw new Error(`Resend error (${res.status}): ${detail}`);
  }
}
