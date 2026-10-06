import type { AgentModel, ToolCall, ToolResult } from '../llm/agent-model';
import type { ToolGateway, ToolOutcome } from '../policy/gateway';
import type { PendingActionView } from '../policy/pending-actions';
import type { Session } from '../policy/types';
import type { ToolRegistry } from '../tools/registry';
import type { Conversation } from './conversation-store';
import { RedactingAgentModel } from './redacting-model';
import { SYSTEM_PROMPT } from './system-prompt';

export type TurnEnd = 'completed' | 'awaiting_confirmation' | 'max_steps' | 'model_refusal' | 'truncated';

export interface ToolEvent {
  tool: string;
  status: ToolOutcome['status'];
  code?: string;
}

export interface TurnResult {
  reply: string;
  end: TurnEnd;
  pendingActions: PendingActionView[];
  toolEvents: ToolEvent[];
}

export const FALLBACK_REPLIES = {
  max_steps: "I wasn't able to finish this request automatically. I've flagged it for a human colleague, who will follow up.",
  model_refusal: "I can't help with that request here. A human colleague can take a look if you'd like.",
  truncated: 'Something went wrong while preparing my answer. Please try again, or ask for a human colleague.',
} as const;

/**
 * Drives one conversation turn: model step -> tool calls through the policy
 * gateway -> results back to the model, until the model answers in plain text
 * or `maxSteps` is hit. Tool calls never bypass the gateway.
 */
export class AgentRunner {
  constructor(
    private readonly model: AgentModel,
    private readonly gateway: ToolGateway,
    private readonly registry: ToolRegistry,
    private readonly maxSteps: number,
  ) {}

  async runTurn(conversation: Conversation, session: Session, userText: string): Promise<TurnResult> {
    const model = new RedactingAgentModel(this.model, conversation.vault);
    const tools = this.registry.specs();
    const pendingActions: PendingActionView[] = [];
    const toolEvents: ToolEvent[] = [];

    conversation.messages.push({ role: 'user', text: userText });

    for (let step = 0; step < this.maxSteps; step++) {
      const out = await model.next({ system: SYSTEM_PROMPT, messages: conversation.messages, tools });
      conversation.messages.push({ role: 'assistant', text: out.text, toolCalls: out.toolCalls, providerContent: out.providerContent });

      if (out.stopReason === 'refusal') {
        return { reply: FALLBACK_REPLIES.model_refusal, end: 'model_refusal', pendingActions, toolEvents };
      }

      if (out.toolCalls.length === 0) {
        if (out.stopReason === 'max_tokens') {
          return { reply: FALLBACK_REPLIES.truncated, end: 'truncated', pendingActions, toolEvents };
        }
        const end: TurnEnd = pendingActions.length > 0 ? 'awaiting_confirmation' : 'completed';
        return { reply: out.text, end, pendingActions, toolEvents };
      }

      // Tool input cut off at max_tokens may parse as a valid but partial
      // object; never run it. Error results keep the transcript well-formed.
      if (out.stopReason === 'max_tokens') {
        conversation.messages.push({ role: 'tool', results: out.toolCalls.map((c) => truncatedResult(c)) });
        return { reply: FALLBACK_REPLIES.truncated, end: 'truncated', pendingActions, toolEvents };
      }

      const results: ToolResult[] = out.toolCalls.map((call) => {
        const outcome = this.gateway.invoke(session, { name: call.name, input: call.input });
        toolEvents.push({ tool: outcome.tool, status: outcome.status, ...(outcome.status === 'refused' ? { code: outcome.code } : {}) });
        if (outcome.status === 'pending_confirmation') pendingActions.push(outcome.action);
        return toToolResult(call, outcome);
      });
      conversation.messages.push({ role: 'tool', results });
    }

    // TODO: emit an escalation event (ticket note / queue) instead of only replying.
    return { reply: FALLBACK_REPLIES.max_steps, end: 'max_steps', pendingActions, toolEvents };
  }
}

/** What the model sees for each outcome. Pending action ids are withheld: only the customer can confirm. */
function toToolResult(call: ToolCall, outcome: ToolOutcome): ToolResult {
  switch (outcome.status) {
    case 'executed':
      return { toolCallId: call.id, isError: false, content: JSON.stringify({ status: 'ok', data: outcome.result }) };
    case 'pending_confirmation':
      return {
        toolCallId: call.id,
        isError: false,
        content: JSON.stringify({
          status: 'pending_confirmation',
          summary: outcome.action.summary,
          expiresAt: outcome.action.expiresAt,
          note: 'NOT executed. The customer must confirm this in the app. Do not say it is done.',
        }),
      };
    case 'refused':
      return { toolCallId: call.id, isError: true, content: JSON.stringify({ status: 'refused', code: outcome.code, message: outcome.message }) };
  }
}

function truncatedResult(call: ToolCall): ToolResult {
  return { toolCallId: call.id, isError: true, content: JSON.stringify({ status: 'not_run', reason: 'tool input truncated' }) };
}
