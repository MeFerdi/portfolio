import type { Clock } from '../lib/clock';
import { newId } from '../lib/ids';

export interface PendingAction {
  id: string;
  conversationId: string;
  customerId: string;
  tool: string;
  /** Validated, rehydrated arguments. Never sent to the model. */
  args: unknown;
  /** Human-readable effect, shown to the customer before they confirm. */
  summary: string;
  createdAt: string;
  expiresAt: string;
}

/** The subset of a PendingAction that is safe to return over the API. */
export interface PendingActionView {
  id: string;
  tool: string;
  summary: string;
  expiresAt: string;
}

export type ConsumeFailure = 'not_found' | 'expired' | 'already_used';
export type ConsumeResult = { ok: true; action: PendingAction } | { ok: false; reason: ConsumeFailure };

interface Entry {
  action: PendingAction;
  expiresAtMs: number;
  consumed: boolean;
}

/**
 * Write actions proposed by the agent wait here until the customer confirms.
 * Ids are unguessable capabilities, bound to one conversation + customer,
 * expire after `ttlMs`, and are single-use.
 * TODO: in-memory only; persist (with TTL) once there is more than one instance.
 */
export class PendingActionStore {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly clock: Clock,
    private readonly ttlMs: number,
  ) {}

  create(input: Pick<PendingAction, 'conversationId' | 'customerId' | 'tool' | 'args' | 'summary'>): PendingAction {
    const now = this.clock.now();
    const action: PendingAction = {
      ...input,
      id: newId('act'),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + this.ttlMs).toISOString(),
    };
    this.entries.set(action.id, { action, expiresAtMs: now + this.ttlMs, consumed: false });
    return action;
  }

  /**
   * Atomically claims an action for execution. It is marked consumed before
   * the caller executes it, so a failed or concurrent execution can never run
   * twice; the customer has to ask again instead.
   */
  consume(id: string, owner: { conversationId: string; customerId: string }): ConsumeResult {
    const entry = this.entries.get(id);
    // A foreign conversation's id looks exactly like a non-existent one.
    if (!entry || entry.action.conversationId !== owner.conversationId || entry.action.customerId !== owner.customerId) {
      return { ok: false, reason: 'not_found' };
    }
    if (entry.consumed) return { ok: false, reason: 'already_used' };
    if (this.clock.now() >= entry.expiresAtMs) return { ok: false, reason: 'expired' };
    entry.consumed = true;
    return { ok: true, action: entry.action };
  }

  listOpen(conversationId: string): PendingActionView[] {
    const now = this.clock.now();
    return [...this.entries.values()]
      .filter((e) => e.action.conversationId === conversationId && !e.consumed && now < e.expiresAtMs)
      .map((e) => toView(e.action));
  }
}

export function toView(action: PendingAction): PendingActionView {
  return { id: action.id, tool: action.tool, summary: action.summary, expiresAt: action.expiresAt };
}
