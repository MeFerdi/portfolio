import type { ConfirmOutcome } from '../policy/gateway';
import type { Conversation } from './conversation-store';

/**
 * Appends the outcome of a customer confirmation to the transcript so the
 * agent knows about it on the next turn. Append-only; never edits history.
 * This note informs the model, it grants nothing: executing still requires
 * the gateway, so a customer typing a fake "confirmation event" achieves nothing.
 */
export function appendConfirmationEvent(conversation: Conversation, actionId: string, outcome: ConfirmOutcome): void {
  const detail =
    outcome.status === 'executed'
      ? { status: 'executed', tool: outcome.tool, result: outcome.result }
      : outcome.status === 'refused'
        ? { status: 'refused', tool: outcome.tool, code: outcome.code }
        : { status: 'rejected', reason: outcome.reason };
  conversation.messages.push({
    role: 'user',
    text: `[Application event, not typed by the customer] Confirmation of pending action ${actionId}: ${JSON.stringify(detail)}`,
  });
}
