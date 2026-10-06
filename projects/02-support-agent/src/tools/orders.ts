import { z } from 'zod';
import { requireOwned } from '../policy/ownership';
import { ToolRefusal } from '../policy/types';
import { defineTool } from './define';

export const listMyOrders = defineTool({
  name: 'list_my_orders',
  description: "List the customer's orders (id, status, total, date).",
  access: 'read',
  scope: 'orders:read',
  input: z.strictObject({}),
  execute(ctx) {
    return ctx.backends.orders
      .listOrdersForCustomer(ctx.customerId)
      .map((o) => ({ orderId: o.id, status: o.status, total: o.total, currency: o.currency, placedAt: o.placedAt }));
  },
});

export const getOrderStatus = defineTool({
  name: 'get_order_status',
  description: "Get status, items and tracking for one of the customer's orders.",
  access: 'read',
  scope: 'orders:read',
  input: z.strictObject({ orderId: z.string().regex(/^ord_\w+$/).describe('Order id, e.g. ord_1001') }),
  execute(ctx, { orderId }) {
    const o = requireOwned(ctx.backends.orders.getOrder(orderId), ctx.customerId, 'order');
    return { orderId: o.id, status: o.status, items: o.items, total: o.total, currency: o.currency, placedAt: o.placedAt, tracking: o.tracking };
  },
});

export const markTicketResolved = defineTool({
  name: 'mark_ticket_resolved',
  description:
    "Mark one of the customer's support tickets as resolved with a short resolution note. Requires the customer's confirmation before it takes effect.",
  access: 'write',
  scope: 'tickets:write',
  input: z.strictObject({
    ticketId: z.string().regex(/^tkt_\w+$/),
    resolution: z.string().min(1).max(500),
  }),
  describe(ctx, { ticketId, resolution }) {
    const t = requireOwned(ctx.backends.orders.getTicket(ticketId), ctx.customerId, 'ticket');
    if (t.status === 'resolved') throw new ToolRefusal('invalid_state', `Ticket ${ticketId} is already resolved.`);
    return `Mark ticket ${t.id} ("${t.subject}") as resolved: ${resolution}`;
  },
  execute(ctx, { ticketId, resolution }) {
    // Re-check at execution time: state may have changed since the action was proposed.
    const t = requireOwned(ctx.backends.orders.getTicket(ticketId), ctx.customerId, 'ticket');
    if (t.status === 'resolved') throw new ToolRefusal('invalid_state', `Ticket ${ticketId} is already resolved.`);
    const updated = ctx.backends.orders.resolveTicket(ticketId, resolution, ctx.now);
    return { ticketId: updated.id, status: updated.status, resolvedAt: updated.resolvedAt };
  },
});
