import type { z } from 'zod';
import type { AgentModel, AgentRequest, AgentStep, StopReason } from '../src/llm/agent-model';
import type { LlmClient, StructuredRequest } from '../src/llm/client';

type Responder = (req: StructuredRequest<z.ZodType>) => unknown;

/** Deterministic LLM for tests: responses are keyed by task name. */
export class FakeLlm implements LlmClient {
  readonly calls: StructuredRequest<z.ZodType>[] = [];

  constructor(private readonly responders: Record<string, Responder>) {}

  async structured<T extends z.ZodType>(req: StructuredRequest<T>): Promise<z.infer<T>> {
    this.calls.push(req);
    const responder = this.responders[req.task];
    if (!responder) throw new Error(`FakeLlm: no responder for task "${req.task}"`);
    // Parse through the real schema so tests exercise the same contract as production.
    return req.schema.parse(responder(req));
  }
}


/** One scripted model step. Tool call ids are filled in automatically. */
export interface ScriptedStep {
  text?: string;
  toolCalls?: { name: string; input: unknown }[];
  stopReason?: StopReason;
}

export type ScriptEntry = ScriptedStep | ((req: AgentRequest) => ScriptedStep);

/**
 * Deterministic agent for tests: replays a script of steps, including tool
 * calls a real model might make (or be tricked into making). Records every
 * request so tests can assert on exactly what the "LLM" was sent.
 */
export class ScriptedAgentModel implements AgentModel {
  readonly requests: AgentRequest[] = [];
  private readonly script: ScriptEntry[];
  private callCounter = 0;

  constructor(script: ScriptEntry[] = []) {
    this.script = [...script];
  }

  enqueue(...steps: ScriptEntry[]): void {
    this.script.push(...steps);
  }

  get remaining(): number {
    return this.script.length;
  }

  async next(req: AgentRequest): Promise<AgentStep> {
    this.requests.push(structuredClone(req));
    const entry = this.script.shift();
    if (!entry) throw new Error('ScriptedAgentModel: script exhausted');
    const step = typeof entry === 'function' ? entry(req) : entry;
    const toolCalls = (step.toolCalls ?? []).map((c) => ({ id: `toolu_${++this.callCounter}`, name: c.name, input: c.input }));
    return {
      text: step.text ?? '',
      toolCalls,
      stopReason: step.stopReason ?? (toolCalls.length > 0 ? 'tool_use' : 'end_turn'),
    };
  }

  /** Everything the model has been sent, as one string, for "never saw X" assertions. */
  seenText(): string {
    return JSON.stringify(this.requests.map((r) => r.messages));
  }

  /** Parsed tool results from the most recent request. */
  lastToolResults(): { isError: boolean; body: Record<string, unknown> }[] {
    const last = this.requests[this.requests.length - 1];
    const msg = last?.messages[last.messages.length - 1];
    if (!msg || msg.role !== 'tool') return [];
    return msg.results.map((r) => ({ isError: r.isError, body: JSON.parse(r.content) as Record<string, unknown> }));
  }
}
