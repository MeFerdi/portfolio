import Anthropic from '@anthropic-ai/sdk';
import {
  type AgentMessage,
  type AgentModel,
  AgentModelError,
  type AgentRequest,
  type AgentStep,
  type StopReason,
  type ToolSpec,
} from './agent-model';

/**
 * One model step per call; the loop lives in src/agent/runner.ts.
 *
 * Why not the SDK's beta tool runner: here a write tool must *suspend* the
 * conversation across HTTP requests (the customer confirms later via
 * /chat/:id/confirm), every tool call must pass the policy gateway, and the
 * exact same loop must be drivable by a scripted fake in tests. A step-wise
 * model behind an interface gives all three; the runner's `run()` callbacks
 * would hide the loop we need to own.
 */
export class AnthropicAgentModel implements AgentModel {
  private readonly client: Anthropic;

  constructor(
    private readonly model: string,
    client?: Anthropic,
    private readonly maxTokens = 16000,
  ) {
    this.client = client ?? new Anthropic();
  }

  async next(req: AgentRequest): Promise<AgentStep> {
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: req.system,
        tools: req.tools.map(toAnthropicTool),
        // Forced tool_choice ('any' / 'tool') is a 400 on claude-opus-5-5; auto is the only option.
        tool_choice: { type: 'auto' },
        messages: toAnthropicMessages(req.messages),
      });
    } catch (err) {
      // The SDK already retries 429/5xx with backoff. Anything left (API error,
      // network, missing credentials) is surfaced as "agent unavailable"
      // without leaking provider types past src/llm.
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      throw new AgentModelError(err instanceof Error ? err.message : String(err), status, { cause: err });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    const toolCalls = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((b) => ({ id: b.id, name: b.name, input: b.input }));

    return { text, toolCalls, stopReason: mapStopReason(response.stop_reason), providerContent: response.content };
  }
}

function toAnthropicTool(spec: ToolSpec): Anthropic.Tool {
  return {
    name: spec.name,
    description: spec.description,
    input_schema: spec.inputSchema as Anthropic.Tool.InputSchema,
  };
}

function mapStopReason(reason: Anthropic.StopReason | null): StopReason {
  switch (reason) {
    case 'end_turn':
    case 'tool_use':
    case 'max_tokens':
    case 'refusal':
      return reason;
    default:
      return 'other';
  }
}

export function toAnthropicMessages(messages: AgentMessage[]): Anthropic.MessageParam[] {
  const out: Anthropic.MessageParam[] = [];

  const pushUser = (blocks: Anthropic.ContentBlockParam[]) => {
    const last = out[out.length - 1];
    // Consecutive user-role entries (e.g. tool results then a confirmation
    // note) are merged so roles always alternate.
    if (last && last.role === 'user' && Array.isArray(last.content)) {
      last.content.push(...blocks);
    } else {
      out.push({ role: 'user', content: blocks });
    }
  };

  for (const m of messages) {
    if (m.role === 'user') {
      pushUser([{ type: 'text', text: m.text }]);
    } else if (m.role === 'tool') {
      pushUser(
        m.results.map((r) => ({ type: 'tool_result' as const, tool_use_id: r.toolCallId, content: r.content, is_error: r.isError })),
      );
    } else if (m.providerContent !== undefined) {
      // Replay exactly what the API returned (thinking signatures included).
      out.push({ role: 'assistant', content: m.providerContent as Anthropic.ContentBlockParam[] });
    } else {
      const blocks: Anthropic.ContentBlockParam[] = [];
      if (m.text) blocks.push({ type: 'text', text: m.text });
      for (const c of m.toolCalls) blocks.push({ type: 'tool_use', id: c.id, name: c.name, input: c.input });
      out.push({ role: 'assistant', content: blocks });
    }
  }
  return out;
}
