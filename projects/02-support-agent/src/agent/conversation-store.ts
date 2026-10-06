import type { AgentMessage } from '../llm/agent-model';
import { newId } from '../lib/ids';
import { PiiVault } from '../policy/redact';

export interface Conversation {
  id: string;
  customerId: string;
  /** Append-only. Holds unredacted values server-side; redaction happens per request. */
  messages: AgentMessage[];
  vault: PiiVault;
  busy: boolean;
}

/**
 * TODO: in-memory; persist transcripts (encrypted, with retention) before any
 * real traffic. Vault contents are PII and need the same treatment.
 */
export class ConversationStore {
  private readonly conversations = new Map<string, Conversation>();

  create(customerId: string): Conversation {
    const conversation: Conversation = { id: newId('conv'), customerId, messages: [], vault: new PiiVault(), busy: false };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  /** Returns the conversation only if it belongs to `customerId`. */
  getOwned(id: string, customerId: string): Conversation | undefined {
    const conversation = this.conversations.get(id);
    return conversation?.customerId === customerId ? conversation : undefined;
  }
}
