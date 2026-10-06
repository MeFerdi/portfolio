import { z } from 'zod';
import type { Payment } from '../mocks/stripe';
import { requireOwned } from '../policy/ownership';
import { defineTool } from './define';

const PaymentRef = z.strictObject({
  paymentId: z.string().regex(/^pay_\w+$/).describe('Payment id, e.g. pay_5001'),
});

function describeMethod(method: Payment['method']): string {
  return 'brand' in method ? `${method.brand} card ending ${method.last4}` : `M-Pesa (ref ${method.reference})`;
}

export const getPaymentStatus = defineTool({
  name: 'get_payment_status',
  description: "Look up the status of one of the customer's payments.",
  access: 'read',
  scope: 'payments:read',
  input: PaymentRef,
  execute(ctx, { paymentId }) {
    const p = requireOwned(ctx.backends.stripe.getPayment(paymentId), ctx.customerId, 'payment');
    return {
      paymentId: p.id,
      orderId: p.orderId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: describeMethod(p.method),
      createdAt: p.createdAt,
      refundCount: p.refunds.length,
    };
  },
});

export const getRefundStatus = defineTool({
  name: 'get_refund_status',
  description: "List refunds on one of the customer's payments and their status. Read-only: cannot issue refunds.",
  access: 'read',
  scope: 'payments:read',
  input: PaymentRef,
  execute(ctx, { paymentId }) {
    const p = requireOwned(ctx.backends.stripe.getPayment(paymentId), ctx.customerId, 'payment');
    return { paymentId: p.id, currency: p.currency, refunds: p.refunds };
  },
});
