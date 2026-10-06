/**
 * Reads a simulator run and reports completion per arm with a two-proportion
 * z-test, plus the duplicate-send rate. Input is SYNTHETIC; so is the output.
 *
 *   npm run measure -- data/synthetic-run.json
 */
import { readFile } from 'node:fs/promises';
import type { StoredEvent } from '../src/events/schema';
import { completionByCohort, duplicateSendRate, type FlaggedUser } from '../src/experiment/measure';

interface RunFile {
  synthetic: boolean;
  params: Record<string, unknown>;
  flagged: FlaggedUser[];
  mail: { attempts: number; transientFailures: number; deliveredByKey: Record<string, number> };
  deadLetters: unknown[];
  events: StoredEvent[];
}

async function main(): Promise<void> {
  const file = process.argv[2] ?? 'data/synthetic-run.json';
  const run = JSON.parse(await readFile(file, 'utf8')) as RunFile;
  const label = run.synthetic ? 'SYNTHETIC' : 'UNLABELLED (treat as synthetic)';
  const report = completionByCohort(run.flagged, run.events);
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

  console.log(`\n## Results [${label}] from ${file}`);
  console.log(`params: ${JSON.stringify(run.params)}\n`);
  console.log('| Arm | Flagged | Completed onboarding | Completion rate |');
  console.log('|---|---|---|---|');
  for (const arm of ['intervention', 'control'] as const) {
    const o = report[arm];
    console.log(`| ${arm} | ${o.flagged} | ${o.completed} | ${pct(o.rate)} |`);
  }
  if (report.test) {
    const t = report.test;
    console.log(`\nDifference: ${pct(t.diff)} (z = ${t.z.toFixed(2)}, two-sided p = ${t.pValue.toFixed(4)})`);
  }
  const sends = new Map(Object.entries(run.mail.deliveredByKey));
  console.log(`Duplicate-send rate: ${pct(duplicateSendRate(sends))} across ${sends.size} intervention keys`);
  console.log(`Mail attempts: ${run.mail.attempts} (${run.mail.transientFailures} injected transient failures)`);
  console.log(`Dead letters: ${run.deadLetters.length}`);
  console.log(`\nAll figures above are ${label}: they validate the pipeline, not real-world impact.`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
