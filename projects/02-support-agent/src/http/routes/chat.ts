import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { appendConfirmationEvent } from '../../agent/confirmation';
import type { Conversation, ConversationStore } from '../../agent/conversation-store';
import type { AgentRunner } from '../../agent/runner';
import { HttpError } from '../../lib/errors';
import type { MockAuth } from '../../mocks/auth';
import type { ConfirmOutcome, ToolGateway } from '../../policy/gateway';
import type { Session } from '../../policy/types';
import { authenticate } from '../auth';

export interface ChatRouteDeps {
  auth: MockAuth;
  conversations: ConversationStore;
  runner: AgentRunner;
  gateway: ToolGateway;
}

const ChatBody = z.strictObject({
  conversationId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(4000),
});

const ConfirmBody = z.strictObject({ actionId: z.string().min(1) });
const ConfirmParams = z.object({ id: z.string().min(1) });

export function chatRoutes(deps: ChatRouteDeps) {
  return async (app: FastifyInstance): Promise<void> => {
    app.post('/chat', async (request) => {
      const principal = authenticate(request, deps.auth);
      const body = ChatBody.parse(request.body);

      const conversation = body.conversationId
        ? requireConversation(deps.conversations, body.conversationId, principal.customerId)
        : deps.conversations.create(principal.customerId);

      const session: Session = { conversationId: conversation.id, customerId: principal.customerId, scopes: principal.scopes };
      const result = await withLock(conversation, () => deps.runner.runTurn(conversation, session, body.message));

      return { conversationId: conversation.id, ...result };
    });

    app.post('/chat/:id/confirm', async (request, reply) => {
      const principal = authenticate(request, deps.auth);
      const { id } = ConfirmParams.parse(request.params);
      const { actionId } = ConfirmBody.parse(request.body);
      const conversation = requireConversation(deps.conversations, id, principal.customerId);

      const session: Session = { conversationId: conversation.id, customerId: principal.customerId, scopes: principal.scopes };
      const outcome = await withLock(conversation, async () => {
        const o = deps.gateway.confirm(session, actionId);
        appendConfirmationEvent(conversation, actionId, o);
        return o;
      });

      reply.status(statusFor(outcome));
      return outcome;
    });
  };
}

function requireConversation(store: ConversationStore, id: string, customerId: string): Conversation {
  const conversation = store.getOwned(id, customerId);
  // Another customer's conversation is reported exactly like a missing one.
  if (!conversation) throw new HttpError(404, 'conversation_not_found', 'Conversation not found.');
  return conversation;
}

/** One turn at a time per conversation; overlapping requests would interleave the transcript. */
async function withLock<T>(conversation: Conversation, fn: () => Promise<T>): Promise<T> {
  if (conversation.busy) throw new HttpError(409, 'conversation_busy', 'A previous message is still being processed.');
  conversation.busy = true;
  try {
    return await fn();
  } finally {
    conversation.busy = false;
  }
}

function statusFor(outcome: ConfirmOutcome): number {
  switch (outcome.status) {
    case 'executed':
      return 200;
    case 'rejected':
      return { not_found: 404, expired: 410, already_used: 409 }[outcome.reason];
    case 'refused':
      return outcome.code === 'invalid_state' ? 409 : 403;
  }
}
