import type { InterventionRecord } from '../src/interventions/types';
import { LlmOutputError } from '../src/llm/client';
import { buildDiagnosisPrompt, diagnoseStall, DIAGNOSIS_TASK } from '../src/workers/diagnose-and-draft';
import { ev } from './builders';
import { FakeLlm } from './fakes';
import { groundedDiagnosis } from './pipeline';

const trail = [
  ev('signed_up', 0, { id: 'evt-signup' }),
  ev('payment_failed', 5, { id: 'evt-pay-1', reason: 'card_declined' }),
  ev('payment_failed', 6, { id: 'evt-pay-2', reason: 'card_declined' }),
];
const record: InterventionRecord = {
  key: 'user-1|add_payment|v1',
  userId: 'user-1',
  stalledAtStep: 'add_payment',
  ruleVersion: 'v1',
  cohort: 'intervention',
  riskScore: 0.5,
  signals: [{ code: 'repeated_failures', failureCount: 2, reasons: ['card_declined'], eventIds: ['evt-pay-1', 'evt-pay-2'] }],
  status: 'pending',
  diagnosis: null,
  providerMessageId: null,
  createdAt: '',
  updatedAt: '',
};

describe('stall-diagnosis contract', () => {
  it('renders the trail with event ids and no contact details', () => {
    const prompt = buildDiagnosisPrompt(record, trail);
    expect(prompt).toContain('[evt-pay-2]');
    expect(prompt).toContain('reason=card_declined');
    expect(prompt).not.toMatch(/@/);
  });

  it('accepts a schema-valid diagnosis whose evidence cites trail events', async () => {
    const llm = new FakeLlm({ [DIAGNOSIS_TASK]: (req) => groundedDiagnosis(req.prompt) });
    const d = await diagnoseStall(llm, record, trail);
    expect(d.evidence[0]?.eventId).toBe('evt-pay-2');
    expect(llm.calls[0]?.task).toBe(DIAGNOSIS_TASK);
  });

  it('rejects evidence that cites event ids not in the trail', async () => {
    const llm = new FakeLlm({
      [DIAGNOSIS_TASK]: (req) => ({
        ...groundedDiagnosis(req.prompt),
        evidence: [
          { eventId: 'evt-pay-1', observation: 'real' },
          { eventId: 'evt-hallucinated', observation: 'made up' },
        ],
      }),
    });
    const err = await diagnoseStall(llm, record, trail).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LlmOutputError);
    expect((err as Error).message).toContain('evt-hallucinated');
  });

  it('rejects output that drifts from the schema', async () => {
    const llm = new FakeLlm({ [DIAGNOSIS_TASK]: () => ({ likelyReason: 'x', evidence: [] }) });
    await expect(diagnoseStall(llm, record, trail)).rejects.toThrow();
  });

  it('rejects an email draft that hard-codes a greeting instead of the name token', async () => {
    const llm = new FakeLlm({
      [DIAGNOSIS_TASK]: (req) => ({ ...groundedDiagnosis(req.prompt), email: { subject: 's', body: 'Hi Bob' } }),
    });
    await expect(diagnoseStall(llm, record, trail)).rejects.toBeInstanceOf(LlmOutputError);
  });
});
