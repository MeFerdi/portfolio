import { tokenize } from '../lib/text';

export type EmbeddingInput = 'document' | 'query';

/**
 * Anthropic has no embeddings endpoint; Voyage AI is the intended production
 * provider. Everything downstream depends only on this interface.
 */
export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  /**
   * Cosine similarity below which the best match is treated as "not in corpus".
   * Scores are not comparable across providers, so each one carries its own floor.
   */
  readonly defaultMinRelevance: number;
  embed(texts: string[], input: EmbeddingInput): Promise<number[][]>;
}

/**
 * Deterministic feature-hashing embedder: signed bag of content terms,
 * L2-normalised. Captures lexical overlap only — no semantics — so it is
 * for tests and the offline eval smoke run, never for production retrieval.
 */
export class HashingEmbedder implements EmbeddingProvider {
  readonly name = 'hashing';
  readonly defaultMinRelevance = 0.15;

  constructor(readonly dimensions = 1024) {}

  async embed(texts: string[], _input?: EmbeddingInput): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }

  private embedOne(text: string): number[] {
    const vec = new Array<number>(this.dimensions).fill(0);
    for (const token of tokenize(text)) {
      const h = fnv1a(token);
      const sign = (h & 1) === 0 ? 1 : -1;
      vec[(h >>> 1) % this.dimensions]! += sign;
    }
    return l2Normalize(vec);
  }
}

export interface VoyageOptions {
  apiKey: string;
  model: string;
  dimensions?: number;
  batchSize?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Voyage AI embeddings over its REST API (no SDK dependency).
 * Not yet exercised against the live API — covered only by a mocked-fetch test.
 */
export class VoyageEmbedder implements EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  // Uncalibrated placeholder: dense embeddings put unrelated text well above 0.
  // TODO: calibrate from the eval harness (sweep and pick the best status accuracy).
  readonly defaultMinRelevance = 0.35;
  private readonly batchSize: number;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly opts: VoyageOptions) {
    this.name = `voyage:${opts.model}`;
    this.dimensions = opts.dimensions ?? 1024;
    this.batchSize = opts.batchSize ?? 64;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async embed(texts: string[], input: EmbeddingInput): Promise<number[][]> {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      out.push(...(await this.embedBatch(texts.slice(i, i + this.batchSize), input)));
    }
    return out;
  }

  private async embedBatch(texts: string[], input: EmbeddingInput): Promise<number[][]> {
    const res = await this.fetchImpl('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.opts.apiKey}` },
      body: JSON.stringify({
        input: texts,
        model: this.opts.model,
        input_type: input,
        output_dimension: this.dimensions,
      }),
    });
    if (!res.ok) throw new Error(`Voyage embeddings failed: HTTP ${res.status} ${await res.text()}`);
    const body = (await res.json()) as { data: { index: number; embedding: number[] }[] };
    const vectors = [...body.data].sort((a, b) => a.index - b.index).map((d) => d.embedding);
    if (vectors.length !== texts.length) throw new Error('Voyage returned a different number of embeddings');
    return vectors;
  }
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
  return norm === 0 ? vec : vec.map((x) => x / norm);
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
