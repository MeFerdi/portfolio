import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { type EvalReport, METRIC_NAMES, type MetricName } from './harness';

const LABELS: Record<MetricName, string> = {
  recallAtK: 'Retrieval recall@k',
  mrr: 'Retrieval MRR',
  gateAccuracy: 'Not-in-corpus gate accuracy',
  statusAccuracy: 'Status accuracy (answered / not_in_corpus / refused)',
  citationCorrectness: 'Citation correctness (raw model output)',
  answerContainsRate: 'Answer contains expected facts',
  faithfulness: 'Faithfulness (LLM judge)',
};

export function reportFileName(report: EvalReport): string {
  return `eval-${report.createdAt.replace(/[:.]/g, '-')}.json`;
}

/** Writes the versioned JSON report and regenerates latest.md. Returns the JSON path. */
export async function writeReport(dir: string, report: EvalReport): Promise<string> {
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, reportFileName(report));
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`);
  const peers = await loadReports(dir);
  await writeFile(path.join(dir, 'latest.md'), renderMarkdown(report, peers));
  return file;
}

async function loadReports(dir: string): Promise<EvalReport[]> {
  const names = (await readdir(dir)).filter((n) => /^eval-.*\.json$/.test(n)).sort();
  const reports: EvalReport[] = [];
  for (const n of names) {
    try {
      const r = JSON.parse(await readFile(path.join(dir, n), 'utf8')) as EvalReport;
      if (r.reportVersion === 1) reports.push(r);
    } catch {
      // Unreadable or foreign files are not ours to judge; skip.
    }
  }
  return reports;
}

const fmt = (v: number | null) => (v === null ? '—' : v.toFixed(3));

export function renderMarkdown(report: EvalReport, peers: EvalReport[] = []): string {
  const lines: string[] = [];
  lines.push(`# Eval report — ${report.mode} / ${report.config}`, '');
  if (report.mode === 'offline') {
    lines.push(
      '> **Offline smoke run.** Hashing (lexical) embeddings, in-memory store, no LLM. Retrieval and gate',
      '> metrics are real for this setup; LLM-dependent metrics are skipped. Not representative of production quality.',
      '',
    );
  }
  lines.push(
    `- Run: \`${report.runId}\``,
    `- Dataset: \`${report.dataset.path}\` (${report.dataset.items} items, sha256 \`${report.dataset.sha256.slice(0, 12)}\`)`,
    `- Embedder: \`${report.setup.embedder}\` · Reranker: \`${report.setup.reranker}\` · Model: \`${report.setup.model ?? 'n/a'}\` · k=${report.k} · gate floor=${report.setup.minRelevance}`,
    `- Git: \`${report.setup.gitSha ?? 'unknown'}\``,
    '',
    '| Metric | Value | n | Floor | Result |',
    '|---|---:|---:|---:|---|',
  );
  for (const name of METRIC_NAMES) {
    const m = report.metrics[name];
    const floor = report.thresholds.floors[name];
    const failed = report.thresholds.failures.some((f) => f.metric === name);
    const result = m.status === 'skipped' ? 'skipped' : floor === undefined ? '—' : failed ? '**FAIL**' : 'pass';
    lines.push(`| ${LABELS[name]} | ${fmt(m.value)} | ${m.n} | ${floor ?? '—'} | ${result} |`);
  }

  lines.push('', '## By tag', '', '| Tag | Items | Recall@k | Gate acc. | Status acc. |', '|---|---:|---:|---:|---:|');
  for (const [tag, t] of Object.entries(report.byTag)) {
    lines.push(`| ${tag} | ${t.items} | ${fmt(t.recallAtK)} | ${fmt(t.gateAccuracy)} | ${fmt(t.statusAccuracy)} |`);
  }

  const comparison = renderComparison(report, peers);
  if (comparison) lines.push('', comparison);

  const misses = report.items.filter(
    (i) => i.error || i.scores.recallAtK === 0 || i.scores.gateAccuracy === 0 || i.scores.statusAccuracy === 0,
  );
  if (misses.length) {
    lines.push('', '## Misses', '', '| Item | Expected | Gate passed | Top cosine | Retrieved docs | Actual | Error |', '|---|---|---|---:|---|---|---|');
    for (const i of misses) {
      lines.push(
        `| ${i.id} | ${i.expectStatus} | ${i.gatePassed} | ${i.topVectorScore} | ${i.retrievedDocIds.join(', ')} | ${i.actualStatus ?? '—'} | ${i.error ?? ''} |`,
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

/** Latest baseline vs latest rerank run, same mode and dataset, if both exist. */
function renderComparison(report: EvalReport, peers: EvalReport[]): string | null {
  const latest = (config: string) =>
    [...peers, report]
      .filter((r) => r.mode === report.mode && r.config === config && r.dataset.sha256 === report.dataset.sha256)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .at(-1);
  const base = latest('baseline');
  const rerank = latest('rerank');
  if (!base || !rerank) return null;
  const lines = [
    '## Baseline vs rerank',
    '',
    `Baseline \`${base.runId}\` vs rerank \`${rerank.runId}\`.`,
    '',
    '| Metric | Baseline | Rerank | Δ |',
    '|---|---:|---:|---:|',
  ];
  for (const name of METRIC_NAMES) {
    const a = base.metrics[name].value;
    const b = rerank.metrics[name].value;
    const delta = a === null || b === null ? '—' : `${b - a >= 0 ? '+' : ''}${(b - a).toFixed(3)}`;
    lines.push(`| ${LABELS[name]} | ${fmt(a)} | ${fmt(b)} | ${delta} |`);
  }
  return lines.join('\n');
}
