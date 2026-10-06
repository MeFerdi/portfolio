import { makeDeliverProcessor } from '../src/workers/deliver';
import { ev, hours } from './builders';
import { ALL_CONTROL, buildPipeline } from './pipeline';
import { FakeMailer } from './fakes';

// User stuck on add_payment after two declines.
const trail = [
  ev('signed_up', 0),
  ev('email_verified', 1),
  ev('project_created', 2),
  ev('teammate_invited', 3),
  ev('payment_failed', 4, { reason: 'card_declined' }),
  ev('payment_failed', 5, { reason: 'card_declined' }),
];

describe('intervention idempotency', () => {
  it('sends exactly one email when the same stall is processed repeatedly', async () => {
    const p = buildPipeline({ trail });
    await p.seed();
    await p.cycle(hours(100));
    await p.cycle(hours(101));
    await p.cycle(hours(500)); // still stalled at the same step, more signals: same key

    expect(p.mailer.sent).toHaveLength(1);
    expect(p.mailer.sent[0]).toMatchObject({
      to: 'user-1@example.test',
      idempotencyKey: 'user-1|add_payment|v1',
    });
    expect(p.mailer.sent[0]?.body).toContain('Hi Ada,');
    expect([...p.interventions.records.values()].map((r) => r.status)).toEqual(['sent']);
  });

  it('dedupes concurrent scans before any job runs', async () => {
    const p = buildPipeline({ trail });
    await p.seed();
    // Two scans interleave: record creation and jobId both dedupe the second.
    await Promise.all([p.cycle(hours(100)), p.cycle(hours(100))]);
    expect(p.mailer.sent).toHaveLength(1);
  });

  it('does not resend when a deliver job is replayed after success', async () => {
    const p = buildPipeline({ trail });
    await p.seed();
    await p.cycle(hours(100));
    const deliver = makeDeliverProcessor({ interventions: p.interventions, users: p.users, mailer: p.mailer });
    await deliver({ interventionKey: 'user-1|add_payment|v1' }); // e.g. BullMQ redelivery after a stalled worker
    expect(p.mailer.sent).toHaveLength(1);
  });

  it('opens a new intervention only when the user stalls at a different step', async () => {
    const p = buildPipeline({ trail });
    await p.seed();
    await p.cycle(hours(100));
    await p.events.write({ type: 'payment_added', userId: 'user-1', occurredAt: hours(101).toISOString(), idempotencyKey: 'pay-ok-1' });
    await p.cycle(hours(400));
    expect(p.mailer.sent.map((m) => m.idempotencyKey)).toEqual(['user-1|add_payment|v1', 'user-1|first_success|v1']);
  });

  it('logs control-arm stalls but never emails them', async () => {
    const p = buildPipeline({ trail, experiment: ALL_CONTROL, mailer: new FakeMailer() });
    await p.seed();
    const summary = await p.cycle(hours(100));
    expect(summary).toMatchObject({ stalled: 1, newControls: 1, enqueued: 0 });
    expect([...p.interventions.records.values()][0]?.status).toBe('control_logged');
    expect(p.mailer.sent).toHaveLength(0);
  });
});
