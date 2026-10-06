export interface OutboundEmail {
  to: string;
  subject: string;
  /** Plain text. */
  body: string;
  /**
   * Passed through to the provider so a retry after "sent but not yet recorded"
   * is deduplicated provider-side too. We use the intervention key.
   */
  idempotencyKey: string;
}

export interface SendResult {
  providerMessageId: string;
}

export interface Mailer {
  send(email: OutboundEmail): Promise<SendResult>;
}

/** Local dev: prints instead of sending. Honours idempotency keys like a real provider. */
export class ConsoleMailer implements Mailer {
  private readonly sentByKey = new Map<string, SendResult>();

  constructor(private readonly print: (line: string) => void = console.log) {}

  async send(email: OutboundEmail): Promise<SendResult> {
    const prior = this.sentByKey.get(email.idempotencyKey);
    if (prior) return prior;
    const result = { providerMessageId: `console-${this.sentByKey.size + 1}` };
    this.sentByKey.set(email.idempotencyKey, result);
    this.print(`--- email to ${email.to} [${email.idempotencyKey}]\nSubject: ${email.subject}\n\n${email.body}\n---`);
    return result;
  }
}
