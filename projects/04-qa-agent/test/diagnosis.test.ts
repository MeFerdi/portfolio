import type { Diagnosis } from '../src/contracts/diagnosis';
import type { FileReader } from '../src/diagnosis/context';
import { DEFAULT_LIMITS, gatherContext } from '../src/diagnosis/context';
import { DIAGNOSE_TASK, enforceRepoPaths } from '../src/diagnosis/diagnose';
import { FailurePipeline } from '../src/diagnosis/pipeline';
import { extractStackFiles } from '../src/diagnosis/stack-files';
import type { BugReport } from '../src/reporting/bug-report';
import { Deduplicator } from '../src/reporting/dedup';
import type { Notifier } from '../src/reporting/notifier';
import { FakeLlm } from './fakes';
import { checkoutTotalFailure, checkoutTotalFailureRepeat, REPO_INDEX, REPO_ROOT } from './fixtures/failure-events';

const SCREENSHOT_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

/** In-memory filesystem keyed by absolute path. */
function fakeReader(files: Record<string, string | Buffer>): FileReader {
  const get = (p: string) => {
    const content = files[p];
    if (content === undefined) throw new Error(`ENOENT: ${p}`);
    return Buffer.isBuffer(content) ? content : Buffer.from(content);
  };
  return { readFile: async (p) => get(p), size: async (p) => get(p).length };
}

const FILES = {
  '/repo/e2e/checkout.spec.ts': "await expect(page.getByTestId('order-total')).toHaveText('$49.97');",
  '/repo/test-results/checkout/test-failed-1.png': SCREENSHOT_BYTES,
};

const groundedDiagnosis: Diagnosis = {
  summary: 'Checkout total is lower than the sum of line items.',
  likelyRootCause: 'Order total ignores line quantity.',
  suspectedFiles: [{ path: 'storefront/lib/pricing.ts', reason: 'computes the order total' }],
  confidence: 'high',
  suggestedNextStep: 'Check orderTotalCents multiplies price by quantity.',
};

class RecordingNotifier implements Notifier {
  readonly name = 'recording';
  readonly sent: BugReport[] = [];
  async send(report: BugReport): Promise<void> {
    this.sent.push(report);
  }
}

const quietLog = { info: () => undefined, warn: () => undefined, error: () => undefined };

function pipelineWith(llm: FakeLlm, notifier: Notifier = new RecordingNotifier(), now = new Date('2026-10-07T09:30:00Z')) {
  return new FailurePipeline({
    llm,
    notifier,
    dedup: new Deduplicator(30 * 60_000),
    repoRoot: REPO_ROOT,
    getRepoIndex: async () => REPO_INDEX,
    log: quietLog,
    reader: fakeReader(FILES),
    now: () => now,
  });
}

describe('stack trace file extraction', () => {
  it('keeps repo files in order and drops node_modules frames', () => {
    const frames = extractStackFiles(checkoutTotalFailure.error.stack ?? '', REPO_ROOT, new Set(REPO_INDEX));
    expect(frames).toEqual([{ path: 'e2e/checkout.spec.ts', line: 14 }]);
  });
});

describe('context gathering', () => {
  it('reads the spec, attaches the screenshot as an image and respects byte limits', async () => {
    const ctx = await gatherContext(checkoutTotalFailure, {
      repoRoot: REPO_ROOT,
      repoIndex: REPO_INDEX,
      reader: fakeReader(FILES),
      limits: { ...DEFAULT_LIMITS, maxBytesPerFile: 20 },
    });
    expect(ctx.sourceFiles).toEqual([{ path: 'e2e/checkout.spec.ts', content: FILES['/repo/e2e/checkout.spec.ts'].slice(0, 20), truncated: true }]);
    expect(ctx.screenshot).toEqual({ mediaType: 'image/png', base64: SCREENSHOT_BYTES.toString('base64') });
  });

  it('continues without the screenshot when it cannot be read', async () => {
    const ctx = await gatherContext(
      { ...checkoutTotalFailure, screenshotPath: '/elsewhere/missing.png' },
      { repoRoot: REPO_ROOT, repoIndex: REPO_INDEX, reader: fakeReader(FILES) },
    );
    expect(ctx.screenshot).toBeNull();
    expect(ctx.notes.join()).toContain('screenshot unreadable');
  });

  it('skips screenshots over the size limit', async () => {
    const ctx = await gatherContext(checkoutTotalFailure, {
      repoRoot: REPO_ROOT,
      repoIndex: REPO_INDEX,
      reader: fakeReader(FILES),
      limits: { ...DEFAULT_LIMITS, maxScreenshotBytes: 2 },
    });
    expect(ctx.screenshot).toBeNull();
  });
});

describe('suspected-file post-validation', () => {
  const index = new Set(REPO_INDEX);

  it('keeps grounded paths and confidence untouched', () => {
    expect(enforceRepoPaths(groundedDiagnosis, index)).toEqual({ diagnosis: groundedDiagnosis, droppedPaths: [] });
  });

  it('drops hallucinated paths and downgrades confidence one level', () => {
    const { diagnosis, droppedPaths } = enforceRepoPaths(
      {
        ...groundedDiagnosis,
        suspectedFiles: [
          { path: './storefront/lib/pricing.ts', reason: 'real' },
          { path: 'src/services/checkoutService.ts', reason: 'invented' },
        ],
      },
      index,
    );
    expect(diagnosis.suspectedFiles).toEqual([{ path: 'storefront/lib/pricing.ts', reason: 'real' }]);
    expect(droppedPaths).toEqual(['src/services/checkoutService.ts']);
    expect(diagnosis.confidence).toBe('medium');
  });

  it('drops confidence to low when every path was hallucinated', () => {
    const { diagnosis } = enforceRepoPaths(
      { ...groundedDiagnosis, suspectedFiles: [{ path: 'app/checkout.py', reason: 'invented' }] },
      index,
    );
    expect(diagnosis.suspectedFiles).toEqual([]);
    expect(diagnosis.confidence).toBe('low');
  });
});

describe('failure pipeline', () => {
  it('diagnoses with the screenshot attached and reports to chat', async () => {
    const llm = new FakeLlm({ [DIAGNOSE_TASK]: () => groundedDiagnosis });
    const notifier = new RecordingNotifier();
    const outcome = await pipelineWith(llm, notifier).handle(checkoutTotalFailure);

    expect(outcome.status).toBe('reported');
    expect(notifier.sent).toHaveLength(1);
    expect(notifier.sent[0]?.diagnosis).toEqual(groundedDiagnosis);

    const call = llm.calls[0];
    expect(call?.images).toEqual([{ mediaType: 'image/png', base64: SCREENSHOT_BYTES.toString('base64') }]);
    expect(call?.prompt).toContain('storefront/lib/pricing.ts'); // repo index is in the prompt
    expect(call?.prompt).toContain('Received: "$34.98"');
  });

  it('filters hallucinated paths before they reach chat', async () => {
    const llm = new FakeLlm({
      [DIAGNOSE_TASK]: () => ({
        ...groundedDiagnosis,
        suspectedFiles: [{ path: 'src/cart/totals.ts', reason: 'invented' }, ...groundedDiagnosis.suspectedFiles],
      }),
    });
    const notifier = new RecordingNotifier();
    await pipelineWith(llm, notifier).handle(checkoutTotalFailure);

    const report = notifier.sent[0];
    expect(report?.diagnosis?.suspectedFiles.map((f) => f.path)).toEqual(['storefront/lib/pricing.ts']);
    expect(report?.droppedPaths).toEqual(['src/cart/totals.ts']);
    expect(report?.diagnosis?.confidence).toBe('medium');
  });

  it('still reports the raw failure when the model output is off-schema', async () => {
    const llm = new FakeLlm({ [DIAGNOSE_TASK]: () => ({ summary: 'missing fields' }) });
    const notifier = new RecordingNotifier();
    const outcome = await pipelineWith(llm, notifier).handle(checkoutTotalFailure);

    expect(outcome.status).toBe('reported');
    expect(notifier.sent[0]?.diagnosis).toBeNull();
    expect(notifier.sent[0]?.diagnosisError).toBeTruthy();
  });

  it('suppresses a repeat of the same failure without calling the model again', async () => {
    const llm = new FakeLlm({ [DIAGNOSE_TASK]: () => groundedDiagnosis });
    const notifier = new RecordingNotifier();
    const pipeline = pipelineWith(llm, notifier);

    await pipeline.handle(checkoutTotalFailure);
    const second = await pipeline.handle(checkoutTotalFailureRepeat);

    expect(second).toEqual({ status: 'suppressed', occurrences: 2 });
    expect(llm.calls).toHaveLength(1);
    expect(notifier.sent).toHaveLength(1);
  });

  it('un-suppresses a failure whose report could not be delivered', async () => {
    const llm = new FakeLlm({ [DIAGNOSE_TASK]: () => groundedDiagnosis });
    const failing: Notifier = { name: 'down', send: async () => Promise.reject(new Error('webhook 500')) };
    const pipeline = pipelineWith(llm, failing);

    expect((await pipeline.handle(checkoutTotalFailure)).status).toBe('notify-failed');
    expect((await pipeline.handle(checkoutTotalFailureRepeat)).status).toBe('notify-failed');
    expect(llm.calls).toHaveLength(2);
  });
});
