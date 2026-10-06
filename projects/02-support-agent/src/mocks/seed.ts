import { ALL_SCOPES, READ_SCOPES } from '../policy/types';
import { MockAuth } from './auth';
import { MockCrm } from './crm';
import { MockOrderDb } from './orders';
import { MockStripe } from './stripe';

export interface MockBackends {
  stripe: MockStripe;
  orders: MockOrderDb;
  crm: MockCrm;
  auth: MockAuth;
}

/** Fresh, isolated copies of the seeded backends. Each test gets its own. */
export function seedBackends(): MockBackends {
  return {
    crm: new MockCrm([
      {
        id: 'cus_001',
        name: 'Amina Wanjiru',
        preferredName: 'Amina',
        email: 'amina.wanjiru@example.co.ke',
        phone: '+254712345678',
        shippingAddress: 'Kilimani, Argwings Kodhek Rd, Nairobi',
        tier: 'gold',
        updatedAt: '2026-08-01T09:00:00.000Z',
      },
      {
        id: 'cus_002',
        name: 'Brian Otieno',
        preferredName: null,
        email: 'brian.otieno@example.com',
        phone: '0722000111',
        shippingAddress: 'Milimani, Kisumu',
        tier: 'standard',
        updatedAt: '2026-07-14T12:30:00.000Z',
      },
      {
        id: 'cus_042',
        name: 'Grace Mutua',
        preferredName: null,
        email: 'grace.mutua@example.org',
        phone: '+254 733 456 789',
        shippingAddress: 'Nyali, Mombasa',
        tier: 'standard',
        updatedAt: '2026-06-02T08:15:00.000Z',
      },
    ]),
    orders: new MockOrderDb({
      orders: [
        {
          id: 'ord_1001',
          customerId: 'cus_001',
          status: 'shipped',
          items: [{ sku: 'KB-01', name: 'Mechanical keyboard', quantity: 1 }],
          total: 12500,
          currency: 'KES',
          placedAt: '2026-09-28T10:00:00.000Z',
          tracking: { carrier: 'G4S Courier', number: 'G4S-883421', eta: '2026-10-09' },
        },
        {
          id: 'ord_1002',
          customerId: 'cus_001',
          status: 'cancelled',
          items: [{ sku: 'HS-02', name: 'Wireless headset', quantity: 1 }],
          total: 8900,
          currency: 'KES',
          placedAt: '2026-09-20T15:20:00.000Z',
          tracking: null,
        },
        {
          id: 'ord_2001',
          customerId: 'cus_002',
          status: 'delivered',
          items: [{ sku: 'MS-03', name: 'Ergonomic mouse', quantity: 2 }],
          total: 6400,
          currency: 'KES',
          placedAt: '2026-09-10T08:45:00.000Z',
          tracking: { carrier: 'Sendy', number: 'SND-55102', eta: null },
        },
      ],
      tickets: [
        { id: 'tkt_9001', customerId: 'cus_001', subject: 'Where is my refund for the headset?', status: 'open', resolution: null, resolvedAt: null },
        { id: 'tkt_9002', customerId: 'cus_002', subject: 'Second mouse arrived scratched', status: 'open', resolution: null, resolvedAt: null },
      ],
    }),
    stripe: new MockStripe([
      {
        id: 'pay_5001',
        customerId: 'cus_001',
        orderId: 'ord_1001',
        amount: 12500,
        currency: 'KES',
        status: 'succeeded',
        method: { brand: 'visa', last4: '4242' },
        createdAt: '2026-09-28T10:01:00.000Z',
        refunds: [],
      },
      {
        id: 'pay_5002',
        customerId: 'cus_001',
        orderId: 'ord_1002',
        amount: 8900,
        currency: 'KES',
        status: 'succeeded',
        method: { type: 'mpesa', reference: 'QJK4XY7Z2P' },
        createdAt: '2026-09-20T15:21:00.000Z',
        refunds: [
          {
            id: 're_7001',
            amount: 8900,
            status: 'pending',
            reason: 'order_cancelled',
            createdAt: '2026-09-22T11:00:00.000Z',
            expectedBy: '2026-10-10',
          },
        ],
      },
      {
        id: 'pay_6001',
        customerId: 'cus_002',
        orderId: 'ord_2001',
        amount: 6400,
        currency: 'KES',
        status: 'succeeded',
        method: { brand: 'mastercard', last4: '5454' },
        createdAt: '2026-09-10T08:46:00.000Z',
        refunds: [],
      },
    ]),
    auth: new MockAuth({
      tok_amina: { customerId: 'cus_001', scopes: ALL_SCOPES },
      tok_brian: { customerId: 'cus_002', scopes: ALL_SCOPES },
      // A session that may look but not change anything (e.g. an unverified login).
      tok_amina_readonly: { customerId: 'cus_001', scopes: READ_SCOPES },
    }),
  };
}
