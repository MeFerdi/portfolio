import { createHash } from 'node:crypto';
import type { AskService } from '../answer/ask-service';
import type { AnswerStatus, Citation } from '../domain/types';
import type { LlmClient } from '../llm/client';
import type { GoldenItem } from './golden';
import { judgeFaithfulness } from './judge';
import {
  type Aggregate,
  answerContains,
  citationCorrectness,
  faithfulnessScore,
  type FaithfulnessVerdict,
  gateCorrect,
  mean,
  rankedDocIds,
  recallAtK,
  reciprocalRank,
  statusMatch,
} from './metrics';

export const REPORT_VERSION = 1;

export type EvalMode = 'offline' | 'live';
export type EvalConfig = 'baseline' | 'rerank';

export const METRIC_NAMES = [
  'recallAtK',
  'mrr',
  'gateAccuracy',
  'statusAccuracy',
  'citationCorrectness',
  'answerContainsRate',
  'faithfulness',
] as const;
export type MetricName = (typeof METRIC_NAMES)[number];

/** Metrics that need the answering model or judge; skipped offline. */
const LLM_METRICS = new Set<MetricName>(['statusAccuracy', 'citationCorrectness', 'answerContainsRate', 'faithfulness']);

export type MetricResult =
  | ({ status: 'measured' } & Aggregate)
  | { status: 'skipped'; value: null; n: 0; reason: string };

export interface ItemResult {
  id: string;
  tags: string[];
  expectStatus: AnswerStatus;
  retrievedChunkIds: string[];
  retrievedDocIds: string[];
  topVectorScore: number;
  gatePassed: boolean;
  scores: Partial<Record<MetricName, number | null>>;
  actualStatus?: AnswerStatus;
  answer?: string;
  citations?: Citation[];
  citationProblems?: string[];
  faithfulness?: { verdict: FaithfulnessVerdict; unsupportedClaims: string[] };
  error?: string;
}

export interface EvalReport {
  reportVersion: number;
  runId: string;
  createdAt: string;
  mode: EvalMode;
  config: EvalConfig;
  k: number;
  setup: { embedder: string; reranker: string; model: string | null; minRelevance: number; gitSha: string | null };
  dataset: { path: string; sha256: string; items: number };
  metrics: Record<MetricName, MetricResult>;
  byTag: Record<string, { items: number; recallAtK: number | null; statusAccuracy: number | null; gateAccuracy: number | null }>;
  thresholds: { floors: Partial<Record<MetricName, number>>; failures: { metric: MetricName; value: number; floor: number }[] };
  items: ItemResult[];
}

export interface RunEvalInput {
  items: GoldenItem[];
  ask: AskService;
  mode: EvalMode;
  config: EvalConfig;
  /** Required in live mode for the faithfulness judge. */
  judge?: LlmClient;
  k?: number;
  dataset: { path: string; raw: string };
  setup: Omit<EvalReport['setup'], 'reranker'>;
  floors: Partial<Record<MetricName, number>>;
  now?: Date;
}

export async function runEval(input: RunEvalInput): Promise<EvalReport> {
  const k = input.k ?? 5;
  if (input.mode === 'live' && !input.judge) throw new Error('live mode requires a judge LLM');
  const results: ItemResult[] = [];
  for (const item of input.items) {
    results.push(await evalItem(item, input, k));
  }
  const metrics = aggregate(results, input.mode);
  const now = input.now ?? new Date();
  return {
    reportVersion: REPORT_VERSION,
    runId: `${now.toISOString()}-${input.mode}-${input.config}`,
    createdAt: now.toISOString(),
    mode: input.mode,
    config: input.config,
    k,
    setup: { ...input.setup, reranker: input.ask.rerankerName },
    dataset: {
      path: input.dataset.path,
      sha256: createHash('sha256').update(input.dataset.raw).digest('hex'),
      items: input.items.length,
    },
    metrics,
    byTag: byTag(results),
    thresholds: { floors: input.floors, failures: checkThresholds(metrics, input.floors) },
    items: results,
  };
}

async function evalItem(item: GoldenItem, input: RunEvalInput, k: number): Promise<ItemResult> {
  const base = (gate: Awaited<ReturnType<AskService['retrieveAndGate']>>): ItemResult => {
    const ranked = rankedDocIds(gate.retrieval.chunks);
    return {
      id: item.id,
      tags: item.tags,
      expectStatus: item.expectStatus,
      retrievedChunkIds: gate.retrieval.chunks.map((c) => c.id),
      retrievedDocIds: ranked,
      topVectorScore: round(gate.retrieval.topVectorScore),
      gatePassed: gate.passed,
      scores: {
        recallAtK: recallAtK(ranked, item.expectedDocIds, k),
        mrr: reciprocalRank(ranked, item.expectedDocIds),
        gateAccuracy: gateCorrect(gate.passed, item.expectStatus),
      },
    };
  };

  if (input.mode === 'offline') return base(await input.ask.retrieveAndGate(item.question));

  try {
    const trace = await input.ask.trace(item.question);
    const out = base(trace.gate);
    const { result } = trace;
    out.actualStatus = result.status;
    out.answer = result.answer;
    out.citations = result.citations;
    out.citationProblems = trace.problems.map((p) => p.kind);
    out.scores.statusAccuracy = statusMatch(result.status, item.expectStatus);
    // Scored on the model's raw citations: validation would otherwise hide hallucinations.
    out.scores.citationCorrectness = trace.raw?.status === 'answered'
      ? citationCorrectness(trace.raw.citations, trace.gate.retrieval.chunks, item.expectedDocIds)
      : null;
    out.scores.answerContainsRate = item.expectStatus === 'answered'
      ? (result.status === 'answered' ? answerContains(result.answer, item.expectedAnswerContains) : item.expectedAnswerContains?.length ? 0 : null)
      : null;
    if (result.status === 'answered') {
      const judgement = await judgeFaithfulness(input.judge!, {
        question: item.question,
        answer: result.answer,
        context: result.retrieved,
      });
      out.faithfulness = { verdict: judgement.verdict, unsupportedClaims: judgement.unsupportedClaims };
      out.scores.faithfulness = faithfulnessScore(judgement.verdict);
    }
    return out;
  } catch (err) {
    // A crash is a wrong answer, not a skipped item: it must drag status accuracy down.
    const gate = await input.ask.retrieveAndGate(item.question);
    const out = base(gate);
    out.error = err instanceof Error ? err.message : String(err);
    out.scores.statusAccuracy = 0;
    return out;
  }
}

function aggregate(results: ItemResult[], mode: EvalMode): Record<MetricName, MetricResult> {
  const out = {} as Record<MetricName, MetricResult>;
  for (const name of METRIC_NAMES) {
    if (mode === 'offline' && LLM_METRICS.has(name)) {
      out[name] = { status: 'skipped', value: null, n: 0, reason: 'offline mode: requires the answering model / judge' };
      continue;
    }
    out[name] = { status: 'measured', ...mean(results.map((r) => r.scores[name])) };
  }
  return out;
}

function byTag(results: ItemResult[]): EvalReport['byTag'] {
  const tags = [...new Set(results.flatMap((r) => r.tags))].sort();
  return Object.fromEntries(
    tags.map((tag) => {
      const rs = results.filter((r) => r.tags.includes(tag));
      return [
        tag,
        {
          items: rs.length,
          recallAtK: mean(rs.map((r) => r.scores.recallAtK)).value,
          statusAccuracy: mean(rs.map((r) => r.scores.statusAccuracy)).value,
          gateAccuracy: mean(rs.map((r) => r.scores.gateAccuracy)).value,
        },
      ];
    }),
  );
}

export function checkThresholds(
  metrics: Record<MetricName, MetricResult>,
  floors: Partial<Record<MetricName, number>>,
): EvalReport['thresholds']['failures'] {
  const failures: EvalReport['thresholds']['failures'] = [];
  for (const name of METRIC_NAMES) {
    const floor = floors[name];
    const m = metrics[name];
    if (floor === undefined || m.status !== 'measured' || m.value === null) continue;
    if (m.value < floor) failures.push({ metric: name, value: m.value, floor });
  }
  return failures;
}

function round(x: number): number {
  return Math.round(x * 1000) / 1000;
}
