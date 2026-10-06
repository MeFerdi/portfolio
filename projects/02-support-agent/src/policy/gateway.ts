import type { Clock } from '../lib/clock';
import type { MockBackends } from '../mocks/seed';
import type { ToolRegistry } from '../tools/registry';
import { type PendingActionStore, type PendingActionView, toView, type ConsumeFailure } from './pending-actions';
import type { ToolRateLimiter } from './rate-limit';
import { type RefusalCode, type Session, type Tool, type ToolContext, ToolRefusal } from './types';

export type ToolOutcome =
  | { status: 'executed'; tool: string; result: unknown }
  | { status: 'pending_confirmation'; tool: string; action: PendingActionView }
  | { status: 'refused'; tool: string; code: RefusalCode; message: string };

export type ConfirmOutcome =
  | { status: 'executed'; tool: string; result: unknown }
  | { status: 'refused'; tool: string; code: RefusalCode; message: string }
  | { status: 'rejected'; reason: ConsumeFailure };

export interface ToolCallRequest {
  name: string;
  /** Raw, untrusted arguments from the model (placeholders already restored). */
  input: unknown;
}

/**
 * The single enforcement point between the model and the backends. The model
 * proposes; this decides. Order of checks for every call:
 *
 *   1. rate limit (charged even for calls that will be refused)
 *   2. tool exists in the registry      -> else unknown_tool
 *   3. session holds the tool's scope   -> else scope_not_granted
 *   4. arguments parse strictly         -> else invalid_arguments
 *   5. read  -> execute now (tool enforces record ownership)
 *      write -> describe (ownership + validation, no side effects) -> PendingAction
 *
 * Writes only execute via `confirm`, which is driven by the customer's HTTP
 * request, never by the model.
 */
export class ToolGateway {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly backends: MockBackends,
    private readonly pending: PendingActionStore,
    private readonly limiter: ToolRateLimiter,
    private readonly clock: Clock,
  ) {}

  invoke(session: Session, call: ToolCallRequest): ToolOutcome {
    const limit = this.limiter.tryTake(session.conversationId);
    if (!limit.allowed) {
      return refuse(call.name, new ToolRefusal('rate_limited', `Tool rate limit reached; retry in ${Math.ceil(limit.retryAfterMs / 1000)}s.`));
    }

    try {
      const tool = this.authorize(session, call.name);
      const args = parseArgs(tool, call.input);
      const ctx = this.context(session);

      if (tool.access === 'read') {
        return { status: 'executed', tool: tool.name, result: tool.execute(ctx, args) };
      }

      const summary = tool.describe(ctx, args);
      const action = this.pending.create({
        conversationId: session.conversationId,
        customerId: session.customerId,
        tool: tool.name,
        args,
        summary,
      });
      return { status: 'pending_confirmation', tool: tool.name, action: toView(action) };
    } catch (err) {
      if (err instanceof ToolRefusal) return refuse(call.name, err);
      throw err;
    }
  }

  confirm(session: Session, actionId: string): ConfirmOutcome {
    const claimed = this.pending.consume(actionId, session);
    if (!claimed.ok) return { status: 'rejected', reason: claimed.reason };
    const { action } = claimed;

    try {
      // Re-authorise at execution time: scopes or state may have changed
      // between proposal and confirmation.
      const tool = this.authorize(session, action.tool);
      const args = parseArgs(tool, action.args);
      return { status: 'executed', tool: tool.name, result: tool.execute(this.context(session), args) };
    } catch (err) {
      if (err instanceof ToolRefusal) return refuse(action.tool, err);
      throw err;
    }
  }

  private authorize(session: Session, name: string): Tool {
    const tool = this.registry.get(name);
    if (!tool) throw new ToolRefusal('unknown_tool', `"${name}" is not an available tool. The agent cannot perform this action.`);
    if (!session.scopes.includes(tool.scope)) {
      throw new ToolRefusal('scope_not_granted', `This session is not permitted to use ${name} (${tool.scope}).`);
    }
    return tool;
  }

  private context(session: Session): ToolContext {
    return { customerId: session.customerId, now: new Date(this.clock.now()), backends: this.backends };
  }
}

function parseArgs(tool: Tool, input: unknown): unknown {
  const parsed = tool.input.safeParse(input);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new ToolRefusal('invalid_arguments', `Invalid arguments for ${tool.name}: ${detail}`);
  }
  return parsed.data;
}

function refuse(tool: string, err: ToolRefusal): ToolOutcome & { status: 'refused' } {
  return { status: 'refused', tool, code: err.code, message: err.message };
}
