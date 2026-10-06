import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { RawLead } from '../src/domain/lead';

/**
 * Benchmark plan (not yet runnable end to end):
 *   1. Generate N deterministic synthetic leads (seededLeads below).
 *   2. Enqueue them against a running stack (docker compose + `npm run dev`).
 *   3. Wait until every lead reaches a terminal status (drafted / disqualified / failed).
 *   4. Record wall-clock time, per-stage latency percentiles, LLM token usage and
 *      verdict distribution, and write them to reports/benchmark.json.
 *
 * Usage: npm run benchmark -- 100
 *
 * Nothing here fabricates numbers: until runSeededBatch is implemented the
 * script stops with an explicit error and writes no report.
 */

export interface BenchmarkReport {
  leads: number;
  seed: number;
  startedAt: string;
  wallClockMs: number;
  stageLatencyMs: Record<'research' | 'score' | 'draft', { p50: number; p95: number }>;
  outcomes: Record<'drafted' | 'disqualified' | 'failed', number>;
  llm: { inputTokens: number; outputTokens: number };
}

/** Deterministic synthetic leads on reserved example domains (RFC 2606), so no real company is contacted. */
export function seededLeads(n: number, seed: number): RawLead[] {
  let state = seed >>> 0;
  const next = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0);
  const titles = ['VP Engineering', 'Head of Platform', 'Marketing Manager', 'CTO', 'Data Engineering Lead'];
  return Array.from({ length: n }, (_, i) => ({
    email: `lead${i}@company${next() % 1000}.example`,
    fullName: `Benchmark Lead ${i}`,
    title: titles[next() % titles.length],
    companyName: `Example Co ${i}`,
    source: 'benchmark',
    sourceRef: `seed-${seed}-${i}`,
  }));
}

async function runSeededBatch(_leads: RawLead[]): Promise<BenchmarkReport> {
  // TODO: enqueue via enqueueLead, subscribe with QueueEvents to the draft/score
  // queues, poll leads.status until terminal, and aggregate timings from job
  // processedOn/finishedOn. Token usage needs LlmClient to expose response.usage.
  throw new Error('Not implemented: runSeededBatch (next step: QueueEvents-based completion tracking)');
}

async function main(): Promise<void> {
  const n = Number(process.argv[2] ?? 100);
  if (!Number.isInteger(n) || n <= 0) throw new Error('Usage: npm run benchmark -- <number of leads>');

  const report = await runSeededBatch(seededLeads(n, 42));
  const dir = join(__dirname, '..', 'reports');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'benchmark.json'), `${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
