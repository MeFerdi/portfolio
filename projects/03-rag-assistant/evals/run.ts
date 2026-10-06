// Usage: npm run eval -- [--offline] [--config baseline|rerank] [--k 5] [--golden evals/golden.jsonl] [--out reports]
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { loadEnv } from '../src/config/env';
import { buildContainer, createEmbedder } from '../src/container';
import { loadGolden } from '../src/eval/golden';
import { type EvalConfig, type MetricName, runEval } from '../src/eval/harness';
import { writeReport } from '../src/eval/report';
import { HashingEmbedder } from '../src/ingest/embeddings';
import { loadCorpusDir } from '../src/ingest/load-corpus';
import { AnthropicLlm, type LlmClient } from '../src/llm/client';
import { InMemoryVectorStore } from '../src/store/memory-store';

/** Offline mode must never reach a provider; any LLM call is a bug. */
const NO_LLM: LlmClient = {
  structured: async (req) => {
    throw new Error(`offline eval attempted an LLM call (task "${req.task}")`);
  },
};

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: {
      offline: { type: 'boolean', default: false },
      config: { type: 'string', default: 'baseline' },
      k: { type: 'string', default: '5' },
      golden: { type: 'string', default: 'evals/golden.jsonl' },
      corpus: { type: 'string', default: 'corpus' },
      thresholds: { type: 'string', default: 'evals/thresholds.json' },
      out: { type: 'string', default: 'reports' },
    },
  });
  const config = values.config as EvalConfig;
  if (config !== 'baseline' && config !== 'rerank') throw new Error(`--config must be baseline|rerank, got "${config}"`);
  if (values.offline && config === 'rerank') {
    throw new Error('--config rerank needs the LLM reranker; run it without --offline');
  }

  const env = loadEnv();
  const mode = values.offline ? 'offline' : 'live';
  const llm = mode === 'offline' ? NO_LLM : new AnthropicLlm(env.LLM_MODEL);
  const embedder = mode === 'offline' ? new HashingEmbedder() : createEmbedder(env);
  // Evals always run on a fresh in-memory index so results depend only on corpus + code.
  const container = buildContainer(env, {
    llm,
    embedder,
    store: new InMemoryVectorStore(),
    reranker: config === 'rerank' ? 'llm' : 'identity',
  });
  await container.ingest.ingest(await loadCorpusDir(path.resolve(values.corpus)));

  const { items, raw } = await loadGolden(path.resolve(values.golden));
  const floors = loadFloors(await readFile(path.resolve(values.thresholds), 'utf8'));
  const report = await runEval({
    items,
    ask: container.ask,
    mode,
    config,
    judge: mode === 'live' ? llm : undefined,
    k: Number(values.k),
    dataset: { path: values.golden, raw },
    setup: {
      embedder: embedder.name,
      model: mode === 'live' ? env.LLM_MODEL : null,
      minRelevance: env.MIN_RELEVANCE_SCORE ?? embedder.defaultMinRelevance,
      gitSha: gitSha(),
    },
    floors,
  });
  const file = await writeReport(path.resolve(values.out), report);

  for (const [name, m] of Object.entries(report.metrics)) {
    console.log(`${name.padEnd(20)} ${m.status === 'skipped' ? 'skipped' : `${m.value?.toFixed(3) ?? 'n/a'} (n=${m.n})`}`);
  }
  console.log(`\nreport: ${path.relative(process.cwd(), file)}  summary: ${values.out}/latest.md`);
  if (report.thresholds.failures.length) {
    for (const f of report.thresholds.failures) console.error(`FAIL ${f.metric}: ${f.value.toFixed(3)} < ${f.floor}`);
    return 1;
  }
  return 0;
}

function loadFloors(json: string): Partial<Record<MetricName, number>> {
  const parsed = JSON.parse(json) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(parsed).filter(([k, v]) => !k.startsWith('$') && typeof v === 'number')) as Partial<
    Record<MetricName, number>
  >;
}

function gitSha(): string | null {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

main().then(
  (code) => process.exit(code),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(2);
  },
);
