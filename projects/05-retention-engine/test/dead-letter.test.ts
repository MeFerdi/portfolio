import { DEFAULT_RETRY, backoffDelayMs, PermanentJobError, runAttempt } from '../src/queue/jobs';
import { ev, hours } from './builders';
import { FakeLlm, FakeMailer } from './fakes';
import { buildPipeline, groundedDiagnosis } from './pipeline';

const trail = [ev('signed_up', 0)];
const KEY = 'user-1|verify_email|v1';

describe('retries and dead letters', () => {
  it('uses exponential backoff', () => {
    expect([1, 2, 3, 4].map((n) => backoffDelayMs(n, DEFAULT_RETRY))).toEqual([2000, 4000, 8000, 16000]);
  });

  it('recovers from transient send failures within the retry budget', async () => {
    const p = buildPipeline({ trail, mailer: new FakeMailer(2), retry: { attempts: 3, baseDelayMs: 1 } });
    await p.seed();
    await p.cycle(hours(30));
    expect(p.mailer.sent).toHaveLength(1);
    expect(p.interventions.deadLetters).toHaveLength(0);
    expect(p.interventions.records.get(KEY)?.status).toBe('sent');
  });

  it('dead-letters a send that keeps failing, and never retries it on later scans', async () => {
    const p = buildPipeline({ trail, mailer: new FakeMailer(99), retry: { attempts: 3, baseDelayMs: 1 } });
    await p.seed();
    await p.cycle(hours(30));

    expect(p.mailer.sent).toHaveLength(0);
    expect(p.interventions.deadLetters).toEqual([
      expect.objectContaining({ queue: 'deliver', jobId: KEY, interventionKey: KEY, attempts: 3, error: 'provider unavailable (503)' }),
    ]);
    expect(p.interventions.records.get(KEY)?.status).toBe('dead_lettered');

    await p.cycle(hours(60));
    expect(p.interventions.deadLetters).toHaveLength(1);
  });

  it('dead-letters a diagnosis whose LLM output is repeatedly ungrounded; nothing is sent', async () => {
    const llm = new FakeLlm({
      'stall-diagnosis': (req) => ({
        ...groundedDiagnosis(req.prompt),
        evidence: [{ eventId: 'not-a-real-event', observation: 'x' }],
      }),
    });
    const p = buildPipeline({ trail, llm });
    await p.seed();
    await p.cycle(hours(30));
    expect(llm.calls).toHaveLength(3);
    expect(p.mailer.sent).toHaveLength(0);
    expect(p.interventions.deadLetters[0]).toMatchObject({ queue: 'diagnose-and-draft', interventionKey: KEY });
    expect(p.interventions.records.get(KEY)?.status).toBe('dead_lettered');
  });

  it('dead-letters a permanent error on the first attempt', async () => {
    const dead: unknown[] = [];
    const ctx = { queue: 'q', jobId: 'j', data: {}, attempt: 1, maxAttempts: 5 };
    await expect(
      runAttempt(ctx, async () => { throw new PermanentJobError('bad address'); }, async (f) => { dead.push(f); }),
    ).rejects.toBeInstanceOf(PermanentJobError);
    expect(dead).toHaveLength(1);
  });

  it('does not dead-letter a transient error before the last attempt', async () => {
    const dead: unknown[] = [];
    const ctx = { queue: 'q', jobId: 'j', data: {}, attempt: 2, maxAttempts: 5 };
    await expect(runAttempt(ctx, async () => { throw new Error('blip'); }, async (f) => { dead.push(f); })).rejects.toThrow('blip');
    expect(dead).toHaveLength(0);
  });
});
