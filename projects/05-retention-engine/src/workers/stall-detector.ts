import type { EventStore } from '../events/store';
import { assignCohort, type ExperimentConfig } from '../experiment/cohort';
import { interventionKey } from '../interventions/key';
import type { InterventionRepository } from '../interventions/types';
import type { JobQueue } from '../queue/jobs';
import { assessRisk, type RiskRules } from './assess-risk';
import type { InterventionJob } from './jobs';

export interface StallScanDeps {
  events: EventStore;
  interventions: InterventionRepository;
  diagnoseQueue: JobQueue<InterventionJob>;
  rules: RiskRules;
  experiment: ExperimentConfig;
  /** Only users who signed up within this window are scanned. */
  lookbackDays: number;
  log: (obj: object, msg: string) => void;
}

export interface ScanSummary {
  scanned: number;
  stalled: number;
  newInterventions: number;
  newControls: number;
  enqueued: number;
}

/**
 * Scheduled scan: assess every in-flight user, record each stall once (both arms),
 * and enqueue a diagnosis for intervention-arm stalls that are still pending.
 * Safe to run concurrently or repeatedly: the intervention key dedupes the record
 * and the BullMQ jobId dedupes the job.
 */
export async function scanForStalls(deps: StallScanDeps, now: Date): Promise<ScanSummary> {
  const since = new Date(now.getTime() - deps.lookbackDays * 86_400_000);
  const userIds = await deps.events.listOnboardingUserIds(since);
  const summary: ScanSummary = { scanned: 0, stalled: 0, newInterventions: 0, newControls: 0, enqueued: 0 };

  for (const userId of userIds) {
    summary.scanned++;
    const assessment = assessRisk(await deps.events.listByUser(userId), now, deps.rules);
    if (!assessment.stalledAtStep) continue;
    summary.stalled++;

    const key = interventionKey(userId, assessment.stalledAtStep, deps.rules.version);
    const cohort = assignCohort(userId, deps.experiment);
    const { record, created } = await deps.interventions.createIfAbsent({
      key,
      userId,
      stalledAtStep: assessment.stalledAtStep,
      ruleVersion: deps.rules.version,
      cohort,
      riskScore: assessment.riskScore,
      signals: assessment.signals,
    });

    if (created) {
      if (cohort === 'control') summary.newControls++;
      else summary.newInterventions++;
      deps.log({ key, cohort, riskScore: assessment.riskScore, signals: assessment.signals.map((s) => s.code) }, 'stall recorded');
    }
    // Re-enqueueing a still-pending record covers a crash between insert and enqueue.
    if (record.status === 'pending') {
      await deps.diagnoseQueue.add(key, { interventionKey: key });
      summary.enqueued++;
    }
  }
  return summary;
}
