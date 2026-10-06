/**
 * Provider-neutral agent seam. The agent runner depends only on this; the
 * Anthropic implementation lives next to it and tests use a scripted fake that
 * emits tool calls, so the policy layer is exercised without a network.
 */

export interface ToolSpec {
  name: string;
  description: string;
  /** JSON Schema for the tool input. */
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError: boolean;
}

export type AgentMessage =
  | { role: 'user'; text: string }
  | {
      role: 'assistant';
      text: string;
      toolCalls: ToolCall[];
      /**
       * Opaque provider payload (e.g. Anthropic content blocks including
       * signed thinking) replayed verbatim on the next request. History must
       * be append-only: rewriting it invalidates thinking signatures and the cache.
       */
      providerContent?: unknown;
    }
  | { role: 'tool'; results: ToolResult[] };

export type StopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'refusal' | 'other';

export interface AgentStep {
  text: string;
  toolCalls: ToolCall[];
  stopReason: StopReason;
  providerContent?: unknown;
}

export interface AgentRequest {
  system: string;
  messages: AgentMessage[];
  tools: ToolSpec[];
}

export interface AgentModel {
  next(request: AgentRequest): Promise<AgentStep>;
}

/** The model provider failed (network, 5xx, rate limit, auth). Safe to surface as "agent unavailable". */
export class AgentModelError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
