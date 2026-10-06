/**
 * In-memory stand-in for the payments provider. Shapes loosely follow Stripe
 * (payment intents + refunds) but only what the agent needs. Card data is
 * stored as brand + last4 only, as a real integration would.
 */
export type PaymentStatus = 'succeeded' | 'processing' | 'requires_payment_method' | 'failed';
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface Refund {
  id: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  createdAt: string;
  expectedBy: string | null;
}

export interface Payment {
  id: string;
  customerId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: { brand: string; last4: string } | { type: 'mpesa'; reference: string };
  createdAt: string;
  refunds: Refund[];
}

export class MockStripe {
  private readonly payments: Map<string, Payment>;

  constructor(seed: Payment[]) {
    this.payments = new Map(seed.map((p) => [p.id, structuredClone(p)]));
  }

  getPayment(paymentId: string): Payment | undefined {
    const payment = this.payments.get(paymentId);
    return payment && structuredClone(payment);
  }

  // Deliberately no createRefund(): issuing refunds is outside the agent's
  // permission model (see docs/permission-model.md). It lives in the human
  // back-office path, not here.
}
