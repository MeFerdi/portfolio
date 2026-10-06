import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { StorefrontDeps } from '../app';
import { formatPrice, orderTotalCents } from '../lib/pricing';
import { requireSession } from '../lib/session';
import { escapeHtml, page } from '../views/layout';

const OrderParams = z.object({ id: z.string() });

export function registerCheckoutRoutes(app: FastifyInstance, { store, fault }: StorefrontDeps): void {
  app.get('/checkout', async (request, reply) => {
    const sid = requireSession(request, reply, store);
    if (!sid) return reply;
    const lines = store.cartLines(sid);
    if (lines.length === 0) return reply.redirect('/cart');
    const total = orderTotalCents(lines, fault);
    const rows = lines
      .map(
        (l) =>
          `<tr><td>${escapeHtml(l.product.name)}</td><td>${l.quantity}</td><td>${formatPrice(l.product.priceCents * l.quantity)}</td></tr>`,
      )
      .join('');
    const body = `<table><thead><tr><th>Item</th><th>Qty</th><th>Line total</th></tr></thead><tbody>${rows}</tbody></table>
<p>Order total: <strong data-testid="order-total">${formatPrice(total)}</strong></p>
<form method="post" action="/checkout"><button type="submit" data-testid="place-order">Place order</button></form>`;
    return reply.type('text/html').send(page('Checkout', body, `page=checkout total=${total}`));
  });

  app.post('/checkout', async (request, reply) => {
    const sid = requireSession(request, reply, store);
    if (!sid) return reply;
    const lines = store.cartLines(sid);
    if (lines.length === 0) return reply.redirect('/cart');
    const order = store.placeOrder(sid, orderTotalCents(lines, fault));
    return reply.redirect(`/orders/${order.id}`);
  });

  app.get('/orders/:id', async (request, reply) => {
    if (!requireSession(request, reply, store)) return reply;
    const { id } = OrderParams.parse(request.params);
    const order = store.getOrder(id);
    if (!order) return reply.code(404).send('Order not found');
    return reply
      .type('text/html')
      .send(
        page(
          'Order confirmed',
          `<p data-testid="order-confirmation">Order <code>${escapeHtml(order.id)}</code> placed. Charged <strong data-testid="charged-total">${formatPrice(order.totalCents)}</strong>.</p>`,
          `page=order id=${order.id}`,
        ),
      );
  });
}
