import { z } from 'zod';
import type { StoredEvent } from '../events/schema';
import type { EventStore } from '../events/store';
import type { InterventionRecord, InterventionRepository } from '../interventions/types';
import { LlmOutputError, type LlmClient } from '../llm/client';
import { PermanentJobError, type JobQueue } from '../queue/jobs';
import type { InterventionJob } from './jobs';

export const DIAGNOSIS_TASK = 'stall-diagnosis';

/** Placeholder the model must use instead of a name; filled in at send time. */
export const FIRST_NAME_TOKEN = '{{first_name}}';

export const StallDiagnosis = z.object({
  likelyReason: z.string().min(1).max(600),
  evidence: z
    .array(
      z.object({
        eventId: z.string().describe('Exact id of an event from the trail'),
        observation: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(8),
  recommendedAction: z.string().min(1).max(400),
  email: z.object({
    subject: z.string().min(1).max(90),
    body: z.string().min(1).max(2000),
  }),
});
export type StallDiagnosis = z.infer<typeof StallDiagnosis>;

const SYSTEM_PROMPT = `You help a B2B SaaS product recover users who stalled during onboarding.
Onboarding steps, in order: signup, verify_email, create_project, invite_teammate, add_payment, first_success.
You receive one user's event trail and the rule signals that flagged them.

Rules:
- Diagnose the most likely reason they stalled using only the trail. Do not speculate beyond it.
- Every evidence item must cite the exact event id (the value in square brackets) of an event in the trail.
- Recommend one concrete action the product team or email can take.
- Draft a short plain-text email (under 150 words) addressing the specific blocker, with one clear next step.
  Greet the user with the literal token ${FIRST_NAME_TOKEN}. Do not invent features, discounts, deadlines or people.`;

export function buildDiagnosisPrompt(record: InterventionRecord, trail: readonly StoredEvent[]): string {
  const lines = trail.map((e) => {
    const reason = 'reason' in e ? ` reason=${e.reason}` : '';
    return `[${e.id}] ${e.occurredAt} ${e.type}${reason}`;
  });
  return [
    `Stalled at step: ${record.stalledAtStep}`,
    `Risk score: ${record.riskScore}`,
    `Rule signals: ${JSON.stringify(record.signals)}`,
    '',
    'Event trail (oldest first):',
    ...lines,
  ].join('\n');
}

/** Schema validation proves shape; this proves the evidence is grounded in real events. */
export function assertEvidenceGrounded(diagnosis: StallDiagnosis, trail: readonly StoredEvent[]): void {
  const known = new Set(trail.map((e) => e.id));
  const unknown = diagnosis.evidence.map((e) => e.eventId).filter((id) => !known.has(id));
  if (unknown.length > 0) {
    throw new LlmOutputError(DIAGNOSIS_TASK, `evidence cites event ids not in the trail: ${unknown.join(', ')}`);
  }
  if (!diagnosis.email.body.includes(FIRST_NAME_TOKEN)) {
    throw new LlmOutputError(DIAGNOSIS_TASK, `email body is missing the ${FIRST_NAME_TOKEN} greeting token`);
  }
}

export async function diagnoseStall(
  llm: LlmClient,
  record: InterventionRecord,
  trail: readonly StoredEvent[],
): Promise<StallDiagnosis> {
  const diagnosis = await llm.structured({
    task: DIAGNOSIS_TASK,
    system: SYSTEM_PROMPT,
    prompt: buildDiagnosisPrompt(record, trail),
    schema: StallDiagnosis,
    effort: 'medium',
  });
  assertEvidenceGrounded(diagnosis, trail);
  return diagnosis;
}

export interface DiagnoseDeps {
  events: EventStore;
  interventions: InterventionRepository;
  llm: LlmClient;
  deliverQueue: JobQueue<InterventionJob>;
}

/**
 * Rejected LLM output throws, so the queue retries (a fresh sample often passes)
 * and eventually dead-letters; an ungrounded draft is never saved or sent.
 */
export function makeDiagnoseProcessor(deps: DiagnoseDeps) {
  return async ({ interventionKey }: InterventionJob): Promise<void> => {
    const record = await deps.interventions.get(interventionKey);
    if (!record) throw new PermanentJobError(`No intervention ${interventionKey}`);
    if (record.cohort !== 'intervention') throw new PermanentJobError(`${interventionKey} is in the control arm`);

    if (record.status === 'pending') {
      const trail = await deps.events.listByUser(record.userId);
      const diagnosis = await diagnoseStall(deps.llm, record, trail);
      await deps.interventions.saveDiagnosis(interventionKey, diagnosis);
    } else if (record.status !== 'drafted') {
      return; // sent or dead-lettered: nothing to do
    }
    // Reached for fresh and previously-drafted records alike, which covers a crash
    // between saving the draft and enqueueing delivery. jobId dedupes the rest.
    await deps.deliverQueue.add(interventionKey, { interventionKey });
  };
}
