import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { chat, confirm, setup } from './helpers';

/**
 * Replays recorded conversations through the real app with a scripted agent.
 * The script pins the model's behaviour, so any diff in tool outputs, policy
 * decisions, redaction or HTTP shape shows up as a failure here.
 * TODO: record fixtures from real (redacted) transcripts and add a live-model
 * eval mode that checks the model reaches the same tool calls.
 */
const Fixture = z.object({
  name: z.string(),
  description: z.string(),
  customerToken: z.string(),
  turns: z.array(
    z.object({
      user: z.string(),
      agentScript: z.array(
        z.object({
          text: z.string().optional(),
          toolCalls: z.array(z.object({ name: z.string(), input: z.unknown() })).optional(),
        }),
      ),
      expect: z.object({
        status: z.number(),
        end: z.string(),
        toolEvents: z.array(z.object({ tool: z.string(), status: z.string(), code: z.string().optional() })),
        toolResultsContain: z.array(z.string()).default([]),
        replyContains: z.array(z.string()).default([]),
        modelNeverSees: z.array(z.string()).default([]),
        pendingActions: z.number(),
      }),
      confirm: z.object({ expectStatus: z.number() }).optional(),
    }),
  ),
  finalState: z.object({ tickets: z.record(z.string(), z.string()).default({}) }).default({ tickets: {} }),
});

const dir = join(__dirname, 'fixtures', 'conversations');
const fixtures = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => Fixture.parse(JSON.parse(readFileSync(join(dir, f), 'utf8'))));

describe.each(fixtures.map((f) => [f.name, f] as const))('conversation fixture: %s', (_name, fixture) => {
  it('replays with identical outcomes', async () => {
    const { app, model, backends } = setup();
    let conversationId: string | undefined;

    for (const [i, turn] of fixture.turns.entries()) {
      const requestsBefore = model.requests.length;
      model.enqueue(...turn.agentScript);

      const res = await chat(app, fixture.customerToken, turn.user, conversationId);
      const label = `turn ${i + 1}`;
      expect({ label, status: res.status }).toEqual({ label, status: turn.expect.status });
      conversationId = res.body.conversationId;

      expect(res.body.end).toBe(turn.expect.end);
      expect(res.body.toolEvents).toEqual(turn.expect.toolEvents);
      expect(res.body.pendingActions).toHaveLength(turn.expect.pendingActions);
      expect(model.remaining).toBe(0);

      const sentThisTurn = JSON.stringify(model.requests.slice(requestsBefore).map((r) => r.messages));
      for (const needle of turn.expect.toolResultsContain) expect(sentThisTurn).toContain(JSON.stringify(needle).slice(1, -1));
      for (const needle of turn.expect.modelNeverSees) expect(model.seenText()).not.toContain(needle);
      for (const needle of turn.expect.replyContains) expect(res.body.reply).toContain(needle);

      if (turn.confirm) {
        for (const action of res.body.pendingActions) {
          const ok = await confirm(app, fixture.customerToken, conversationId, action.id);
          expect(ok.status).toBe(turn.confirm.expectStatus);
        }
      }
    }

    for (const [ticketId, status] of Object.entries(fixture.finalState.tickets)) {
      expect(backends.orders.getTicket(ticketId)?.status).toBe(status);
    }
  });
});
