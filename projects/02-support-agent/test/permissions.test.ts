import { AMINA, AMINA_READONLY, BRIAN, chat, confirm, setup } from './helpers';

const proposeEmailChange = { toolCalls: [{ name: 'update_customer_record', input: { field: 'email', value: 'amina@newmail.co.ke' } }] };

async function proposeWrite() {
  const ctx = setup([proposeEmailChange, { text: 'Please confirm.' }]);
  const res = await chat(ctx.app, AMINA, 'Change my email to amina@newmail.co.ke');
  const action = res.body.pendingActions[0];
  if (!action) throw new Error('expected a pending action');
  return { ...ctx, conversationId: res.body.conversationId, action };
}

describe('write actions require confirmation', () => {
  it('never executes a write without confirmation, however many turns pass', async () => {
    const { app, backends, model, conversationId } = await proposeWrite();
    model.enqueue({ text: 'Done! Your email has been updated.' }); // the model lying does not make it true
    await chat(app, AMINA, 'is it done?', conversationId);
    expect(backends.crm.getCustomer('cus_001')?.email).toBe('amina.wanjiru@example.co.ke');
    expect(backends.crm.auditLog).toHaveLength(0);
  });

  it('does not give the model the action id (only the customer can confirm)', async () => {
    const { model, action } = await proposeWrite();
    expect(model.seenText()).not.toContain(action.id);
    expect(model.lastToolResults()[0]?.body).toMatchObject({ status: 'pending_confirmation' });
  });

  it('executes exactly once on confirm; replay is rejected', async () => {
    const { app, backends, conversationId, action } = await proposeWrite();
    const first = await confirm(app, AMINA, conversationId, action.id);
    expect(first.status).toBe(200);
    const replay = await confirm(app, AMINA, conversationId, action.id);
    expect(replay.status).toBe(409);
    expect(replay.body).toEqual({ status: 'rejected', reason: 'already_used' });
    expect(backends.crm.auditLog).toHaveLength(1);
  });

  it('rejects an expired action', async () => {
    const { app, backends, clock, conversationId, action } = await proposeWrite();
    clock.advance(5 * 60_000);
    const res = await confirm(app, AMINA, conversationId, action.id);
    expect(res.status).toBe(410);
    expect(backends.crm.auditLog).toHaveLength(0);
  });

  it('rejects unknown action ids', async () => {
    const { app, conversationId } = await proposeWrite();
    const res = await confirm(app, AMINA, conversationId, 'act_doesnotexist');
    expect(res.status).toBe(404);
  });

  it('tells the agent about the confirmation on the next turn', async () => {
    const { app, model, conversationId, action } = await proposeWrite();
    await confirm(app, AMINA, conversationId, action.id);
    model.enqueue({ text: 'Your email is updated.' });
    await chat(app, AMINA, 'thanks', conversationId);
    const lastRequest = model.requests[model.requests.length - 1]!;
    expect(JSON.stringify(lastRequest.messages)).toContain('"status\\":\\"executed\\"');
  });
});

describe('customer scoping', () => {
  it("refuses reads of another customer's records, indistinguishably from missing ones", async () => {
    const { app, model } = setup([
      { toolCalls: [{ name: 'get_order_status', input: { orderId: 'ord_2001' } }, { name: 'get_order_status', input: { orderId: 'ord_9999' } }] },
      { text: 'Not found.' },
    ]);
    const res = await chat(app, AMINA, "what's in order ord_2001?");
    expect(res.body.toolEvents).toEqual([
      { tool: 'get_order_status', status: 'refused', code: 'out_of_scope' },
      { tool: 'get_order_status', status: 'refused', code: 'out_of_scope' },
    ]);
    const [foreign, missing] = model.lastToolResults();
    expect(foreign?.body.message).toBe(missing?.body.message);
    expect(model.seenText()).not.toContain('Ergonomic mouse');
  });

  it("refuses to propose writes against another customer's ticket", async () => {
    const { app, backends } = setup([
      { toolCalls: [{ name: 'mark_ticket_resolved', input: { ticketId: 'tkt_9002', resolution: 'closing' } }] },
      { text: 'Cannot.' },
    ]);
    const res = await chat(app, AMINA, 'close ticket tkt_9002');
    expect(res.body.pendingActions).toEqual([]);
    expect(res.body.toolEvents[0]).toMatchObject({ status: 'refused', code: 'out_of_scope' });
    expect(backends.orders.getTicket('tkt_9002')?.status).toBe('open');
  });

  it("does not let another customer confirm someone else's action", async () => {
    const { app, backends, model, conversationId, action } = await proposeWrite();
    // Brian cannot address Amina's conversation...
    const viaHers = await confirm(app, BRIAN, conversationId, action.id);
    expect(viaHers.status).toBe(404);
    // ...nor redeem her action id inside his own conversation.
    model.enqueue({ text: 'Hello Brian.' });
    const his = await chat(app, BRIAN, 'hi');
    const viaHis = await confirm(app, BRIAN, his.body.conversationId, action.id);
    expect(viaHis.status).toBe(404);
    expect(backends.crm.auditLog).toHaveLength(0);
    // The action is still redeemable by its owner: failed attempts did not burn it.
    expect((await confirm(app, AMINA, conversationId, action.id)).status).toBe(200);
  });

  it("returns 404 for another customer's conversation on /chat", async () => {
    const { app, conversationId } = await proposeWrite();
    const res = await chat(app, BRIAN, 'show me this chat', conversationId);
    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const { app } = setup();
    const res = await app.inject({ method: 'POST', url: '/chat', payload: { message: 'hi' } });
    expect(res.statusCode).toBe(401);
  });
});

describe('scopes', () => {
  it('a read-only session cannot even propose a write', async () => {
    const { app } = setup([proposeEmailChange, { text: 'Not allowed.' }]);
    const res = await chat(app, AMINA_READONLY, 'change my email');
    expect(res.body.pendingActions).toEqual([]);
    expect(res.body.toolEvents).toEqual([{ tool: 'update_customer_record', status: 'refused', code: 'scope_not_granted' }]);
  });
});
