import { ManualClock } from '../src/lib/clock';
import { TokenBucket } from '../src/policy/rate-limit';
import { AMINA, chat, setup } from './helpers';

describe('TokenBucket', () => {
  it('allows a burst up to capacity, then refuses until refilled', () => {
    const clock = new ManualClock();
    const bucket = new TokenBucket({ capacity: 2, refillPerMinute: 6 }, clock);
    expect(bucket.tryTake().allowed).toBe(true);
    expect(bucket.tryTake().allowed).toBe(true);
    const denied = bucket.tryTake();
    expect(denied).toEqual({ allowed: false, retryAfterMs: 10_000 });

    clock.advance(10_000);
    expect(bucket.tryTake().allowed).toBe(true);
    expect(bucket.tryTake().allowed).toBe(false);
  });

  it('never refills above capacity', () => {
    const clock = new ManualClock();
    const bucket = new TokenBucket({ capacity: 1, refillPerMinute: 60 }, clock);
    clock.advance(10 * 60_000);
    expect(bucket.tryTake().allowed).toBe(true);
    expect(bucket.tryTake().allowed).toBe(false);
  });
});

describe('per-conversation tool rate limit', () => {
  it('refuses tool calls beyond the budget without touching backends', async () => {
    const getOrder = { name: 'get_order_status', input: { orderId: 'ord_1001' } };
    const { app, model, clock } = setup(
      [{ toolCalls: [getOrder, getOrder, getOrder] }, { text: 'done' }, { toolCalls: [getOrder] }, { text: 'done again' }],
      { rateLimit: { capacity: 2, refillPerMinute: 6 } },
    );

    const first = await chat(app, AMINA, 'status of ord_1001 x3');
    expect(first.body.toolEvents.map((e) => e.code ?? e.status)).toEqual(['executed', 'executed', 'rate_limited']);
    expect(model.requests[1]).toBeDefined();
    const results = model.lastToolResults();
    expect(results[2]).toMatchObject({ isError: true, body: { status: 'refused', code: 'rate_limited' } });

    clock.advance(10_000);
    const second = await chat(app, AMINA, 'and once more', first.body.conversationId);
    expect(second.body.toolEvents).toEqual([{ tool: 'get_order_status', status: 'executed' }]);
  });

  it('keeps budgets separate per conversation', async () => {
    const getOrder = { name: 'get_order_status', input: { orderId: 'ord_1001' } };
    const { app } = setup(
      [{ toolCalls: [getOrder] }, { text: 'a' }, { toolCalls: [getOrder] }, { text: 'b' }],
      { rateLimit: { capacity: 1, refillPerMinute: 1 } },
    );
    const a = await chat(app, AMINA, 'one');
    const b = await chat(app, AMINA, 'two'); // new conversation
    expect(a.body.toolEvents[0]?.status).toBe('executed');
    expect(b.body.toolEvents[0]?.status).toBe('executed');
  });
});
