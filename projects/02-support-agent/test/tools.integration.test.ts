import { AMINA, chat, confirm, setup } from './helpers';

/**
 * One end-to-end test per tool, through POST /chat with fastify.inject. The
 * scripted agent calls the tool; assertions cover the HTTP response, what the
 * model was sent back, and backend state.
 */
describe('GET /health', () => {
  it('returns ok', async () => {
    const { app } = setup();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });
});

describe('read tools', () => {
  it('get_payment_status returns the payment with masked card details', async () => {
    const { app, model } = setup([{ toolCalls: [{ name: 'get_payment_status', input: { paymentId: 'pay_5001' } }] }, { text: 'Paid.' }]);
    const res = await chat(app, AMINA, 'Did my keyboard payment go through?');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ reply: 'Paid.', end: 'completed', toolEvents: [{ tool: 'get_payment_status', status: 'executed' }] });
    expect(model.lastToolResults()[0]?.body).toMatchObject({
      status: 'ok',
      data: { paymentId: 'pay_5001', status: 'succeeded', method: 'visa card ending 4242' },
    });
  });

  it('get_refund_status lists refunds on a payment', async () => {
    const { app, model } = setup([{ toolCalls: [{ name: 'get_refund_status', input: { paymentId: 'pay_5002' } }] }, { text: 'Pending.' }]);
    await chat(app, AMINA, 'Where is my refund?');
    expect(model.lastToolResults()[0]?.body).toMatchObject({
      data: { paymentId: 'pay_5002', refunds: [{ id: 're_7001', status: 'pending', expectedBy: '2026-10-10' }] },
    });
  });

  it("list_my_orders returns only the caller's orders", async () => {
    const { app, model } = setup([{ toolCalls: [{ name: 'list_my_orders', input: {} }] }, { text: 'Two orders.' }]);
    await chat(app, AMINA, 'What have I ordered?');
    const data = model.lastToolResults()[0]?.body.data as { orderId: string }[];
    expect(data.map((o) => o.orderId)).toEqual(['ord_1001', 'ord_1002']);
  });

  it('get_order_status returns tracking', async () => {
    const { app, model } = setup([{ toolCalls: [{ name: 'get_order_status', input: { orderId: 'ord_1001' } }] }, { text: 'Shipped.' }]);
    await chat(app, AMINA, 'Where is ord_1001?');
    expect(model.lastToolResults()[0]?.body).toMatchObject({
      data: { orderId: 'ord_1001', status: 'shipped', tracking: { carrier: 'G4S Courier' } },
    });
  });

  it('get_customer_profile returns the record with PII redacted for the model', async () => {
    const { app, model } = setup([
      { toolCalls: [{ name: 'get_customer_profile', input: {} }] },
      { text: 'Your email on file is [EMAIL_1].' },
    ]);
    const res = await chat(app, AMINA, 'What email do you have for me?');
    const data = model.lastToolResults()[0]?.body.data as Record<string, string>;
    expect(data.id).toBe('cus_001');
    expect(data.email).toBe('[EMAIL_1]');
    expect(data.phone).toBe('[PHONE_1]');
    expect(model.seenText()).not.toContain('amina.wanjiru@example.co.ke');
    // ...but the customer sees their real value.
    expect(res.body.reply).toBe('Your email on file is amina.wanjiru@example.co.ke.');
  });
});

describe('write tools', () => {
  it('update_customer_record proposes, then applies only on confirm', async () => {
    const { app, backends, model } = setup([
      { toolCalls: [{ name: 'update_customer_record', input: { field: 'email', value: '[EMAIL_1]' } }] },
      { text: 'Please confirm the change.' },
    ]);
    const res = await chat(app, AMINA, 'Change my email to amina@newmail.co.ke');
    expect(res.body.end).toBe('awaiting_confirmation');
    const [action] = res.body.pendingActions;
    expect(action).toMatchObject({ tool: 'update_customer_record' });
    // The model's placeholder was restored server-side for the customer-facing summary.
    expect(action?.summary).toBe('Change your email from "amina.wanjiru@example.co.ke" to "amina@newmail.co.ke"');
    expect(model.seenText()).not.toContain('amina@newmail.co.ke');
    expect(backends.crm.getCustomer('cus_001')?.email).toBe('amina.wanjiru@example.co.ke');

    const ok = await confirm(app, AMINA, res.body.conversationId, action!.id);
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ status: 'executed', tool: 'update_customer_record' });
    expect(backends.crm.getCustomer('cus_001')?.email).toBe('amina@newmail.co.ke');
    expect(backends.crm.auditLog).toEqual([expect.objectContaining({ customerId: 'cus_001', field: 'email' })]);
  });

  it('update_customer_record rejects an invalid value before proposing', async () => {
    const { app } = setup([
      { toolCalls: [{ name: 'update_customer_record', input: { field: 'email', value: 'not-an-email' } }] },
      { text: 'That email looks wrong.' },
    ]);
    const res = await chat(app, AMINA, 'set my email to not-an-email');
    expect(res.body.pendingActions).toEqual([]);
    expect(res.body.toolEvents).toEqual([{ tool: 'update_customer_record', status: 'refused', code: 'invalid_arguments' }]);
  });

  it('mark_ticket_resolved proposes, then resolves on confirm', async () => {
    const { app, backends } = setup([
      { toolCalls: [{ name: 'mark_ticket_resolved', input: { ticketId: 'tkt_9001', resolution: 'Refund status explained.' } }] },
      { text: 'Confirm to close the ticket.' },
    ]);
    const res = await chat(app, AMINA, 'You can close my ticket');
    const action = res.body.pendingActions[0]!;
    expect(backends.orders.getTicket('tkt_9001')?.status).toBe('open');

    const ok = await confirm(app, AMINA, res.body.conversationId, action.id);
    expect(ok.status).toBe(200);
    expect(backends.orders.getTicket('tkt_9001')).toMatchObject({ status: 'resolved', resolution: 'Refund status explained.' });
  });
});
