import type { AskResult, Chunk } from '../domain/types';
import { logger } from '../lib/logger';
import type { LlmClient } from '../llm/client';
import type { HybridRetriever, RetrievalResult } from '../retrieval/retriever';
import { type CitationProblem, validateCitations } from './citation-validator';
import { buildGroundedPrompt, GROUNDED_ANSWER_SYSTEM } from './prompt';
import { type GroundedAnswer, GroundedAnswerSchema } from './schema';

export const NOT_IN_CORPUS_ANSWER = "I couldn't find this in the knowledge base.";
export const UNVERIFIED_ANSWER = "I couldn't produce an answer with verifiable citations, so I'm not giving one.";

export interface AskOptions {
  /** Cosine floor for the best vector hit; below it the LLM is never called. */
  minRelevance: number;
}

export interface GateDecision {
  retrieval: RetrievalResult;
  passed: boolean;
}

/** Everything the eval harness needs to score one question. */
export interface AskTrace {
  gate: GateDecision;
  /** Model output before citation validation; absent when the gate short-circuited. */
  raw?: GroundedAnswer;
  problems: CitationProblem[];
  result: AskResult;
}

export class AskService {
  constructor(
    private readonly retriever: HybridRetriever,
    private readonly llm: LlmClient,
    private readonly options: AskOptions,
  ) {}

  get rerankerName(): string {
    return this.retriever.rerankerName;
  }

  async ask(question: string): Promise<AskResult> {
    return (await this.trace(question)).result;
  }

  /** Retrieval plus the not-in-corpus gate. Never calls the answering model. */
  async retrieveAndGate(question: string): Promise<GateDecision> {
    const retrieval = await this.retriever.retrieve(question);
    return { retrieval, passed: passesRelevanceGate(retrieval, this.options.minRelevance) };
  }

  async trace(question: string): Promise<AskTrace> {
    const gate = await this.retrieveAndGate(question);
    if (!gate.passed) {
      return {
        gate,
        problems: [],
        result: { status: 'not_in_corpus', reason: 'low_retrieval_score', answer: NOT_IN_CORPUS_ANSWER, citations: [], retrieved: [] },
      };
    }
    const retrieved = gate.retrieval.chunks;
    const raw = await this.llm.structured({
      task: 'grounded-answer',
      system: GROUNDED_ANSWER_SYSTEM,
      prompt: buildGroundedPrompt(question, retrieved),
      schema: GroundedAnswerSchema,
      maxTokens: 4000,
    });
    const problems = validateCitations(raw, retrieved);
    return { gate, raw, problems, result: toResult(raw, problems, retrieved) };
  }
}

function toResult(raw: GroundedAnswer, problems: CitationProblem[], retrieved: Chunk[]): AskResult {
  if (raw.status !== 'answered') {
    // Citations on a non-answer carry no meaning; drop them rather than surface them.
    return { status: raw.status, reason: 'model_declined', answer: raw.answer, citations: [], retrieved };
  }
  if (problems.length > 0) {
    logger.warn({ problems }, 'rejected answer: citation validation failed');
    return { status: 'refused', reason: 'citation_validation_failed', answer: UNVERIFIED_ANSWER, citations: [], retrieved };
  }
  const docOf = new Map(retrieved.map((c) => [c.id, c.docId]));
  return {
    status: 'answered',
    answer: raw.answer,
    citations: raw.citations.map((c) => ({ chunkId: c.chunkId, docId: docOf.get(c.chunkId)!, quote: c.quote })),
    retrieved,
  };
}

export function passesRelevanceGate(r: RetrievalResult, minRelevance: number): boolean {
  return r.chunks.length > 0 && r.topVectorScore >= minRelevance;
}
