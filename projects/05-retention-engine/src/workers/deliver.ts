import type { InterventionRepository } from '../interventions/types';
import type { Mailer } from '../mail/mailer';
import { PermanentJobError } from '../queue/jobs';
import type { UserDirectory } from '../users/directory';
import { FIRST_NAME_TOKEN } from './diagnose-and-draft';
import type { InterventionJob } from './jobs';

export interface DeliverDeps {
  interventions: InterventionRepository;
  users: UserDirectory;
  mailer: Mailer;
}

/**
 * At-most-once email per intervention key, layered:
 *   1. status check: a record already 'sent' is skipped;
 *   2. the provider idempotency key (= intervention key) dedupes a resend after a
 *      crash between "provider accepted" and "markSent committed";
 *   3. markSent is a conditional drafted -> sent update.
 */
export function makeDeliverProcessor(deps: DeliverDeps) {
  return async ({ interventionKey }: InterventionJob): Promise<void> => {
    const record = await deps.interventions.get(interventionKey);
    if (!record) throw new PermanentJobError(`No intervention ${interventionKey}`);
    if (record.status === 'sent') return;
    if (record.cohort !== 'intervention') {
      throw new PermanentJobError(`Refusing to email control-arm user (${interventionKey})`);
    }
    if (record.status !== 'drafted' || !record.diagnosis) {
      throw new PermanentJobError(`Intervention ${interventionKey} is ${record.status}, expected drafted`);
    }
    const user = await deps.users.get(record.userId);
    if (!user) throw new PermanentJobError(`No contact details for user ${record.userId}`);

    const firstName = user.name?.split(' ')[0] || 'there';
    const { providerMessageId } = await deps.mailer.send({
      to: user.email,
      subject: record.diagnosis.email.subject,
      body: record.diagnosis.email.body.replaceAll(FIRST_NAME_TOKEN, firstName),
      idempotencyKey: interventionKey,
    });
    await deps.interventions.markSent(interventionKey, providerMessageId);
  };
}
