import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import type { BetaContentBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import type { z } from 'zod';

/**
 * The only seam between business logic and the model provider.
 * Production code depends on this interface; tests inject FakeLlm.
 */
export interface LlmClient {
  /** One call whose output must validate against `schema`, or it throws. */
  structured<T extends z.ZodType>(req: StructuredRequest<T>): Promise<z.infer<T>>;
}

export interface StructuredRequest<T extends z.ZodType> {
  /** Stable label for logs, evals and fakes, e.g. "icp-fit". */
  task: string;
  system: string;
  prompt: string;
  schema: T;
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high';
  /** Optional images (e.g. a failure screenshot) sent ahead of the prompt text. */
  images?: LlmImage[];
}

export interface LlmImage {
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
  /** Base64-encoded bytes, no data: prefix. */
  base64: string;
}

/**
 * Text-only requests keep the plain-string form; with images, each image becomes
 * a base64 image block placed before the text (images-then-instructions).
 */
export function buildUserContent(prompt: string, images?: LlmImage[]): string | BetaContentBlockParam[] {
  if (!images || images.length === 0) return prompt;
  return [
    ...images.map(
      (img): BetaContentBlockParam => ({
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
      }),
    ),
    { type: 'text', text: prompt },
  ];
}

export class LlmOutputError extends Error {
  constructor(
    readonly task: string,
    readonly reason: string,
  ) {
    super(`LLM output rejected for task "${task}": ${reason}`);
  }
}

export class AnthropicLlm implements LlmClient {
  private readonly client: Anthropic;

  constructor(
    private readonly model: string,
    client?: Anthropic,
  ) {
    this.client = client ?? new Anthropic();
  }

  async structured<T extends z.ZodType>(req: StructuredRequest<T>): Promise<z.infer<T>> {
    const response = await this.client.beta.messages.parse({
      model: this.model,
      // On a safety-classifier refusal the API re-runs the request on a
      // fallback model instead of failing the job.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      max_tokens: req.maxTokens ?? 16000,
      system: req.system,
      messages: [{ role: 'user', content: buildUserContent(req.prompt, req.images) }],
      output_config: {
        effort: req.effort ?? 'medium',
        format: betaZodOutputFormat(req.schema),
      },
    });

    if (response.stop_reason === 'refusal') {
      throw new LlmOutputError(req.task, `refused (${response.stop_details?.category ?? 'unknown'})`);
    }
    if (response.stop_reason === 'max_tokens') {
      throw new LlmOutputError(req.task, 'truncated at max_tokens');
    }
    if (response.parsed_output == null) {
      throw new LlmOutputError(req.task, 'output did not match schema');
    }
    // Validate again on our side: the contract test is that nothing unvalidated
    // ever crosses this boundary, regardless of provider behaviour.
    return req.schema.parse(response.parsed_output);
  }
}
