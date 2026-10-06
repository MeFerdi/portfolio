import type { z } from 'zod';
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
