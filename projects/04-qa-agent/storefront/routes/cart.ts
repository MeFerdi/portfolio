import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { StorefrontDeps } from '../app';
import { formatPrice } from '../lib/pricing';
import { requireSession } from '../lib/session';
import { escapeHtml, page } from '../views/layout';

const AddToCartForm = z.object({ productId: z.string().min(1) });

export function registerCartRoutes(app: FastifyInstance, { store, fault }: StorefrontDeps): void {
  app.post('/cart/add', async (request, reply) => {
    const sid = requireSession(request, reply, store);
    if (!sid) return reply;
    const form = AddToCartForm.safeParse(request.body);
    if (!form.success || !store.findProduct(form.data.productId)) {
      return reply.code(400).send('Unknown product');
    }
    // Injected bug: the add is acknowledged but never persisted.
    if (fault !== 'add-to-cart-noop') store.addToCart(sid, form.data.productId);
    return reply.redirect('/cart');
  });

  app.get('/cart', async (request, reply) => {
    const sid = requireSession(request, reply, store);
    if (!sid) return reply;
    const lines = store.cartLines(sid);
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const body =
      lines.length === 0
        ? '<p data-testid="cart-empty">Your cart is empty.</p>'
        : `<ul>${lines
            .map(
              (l) =>
                `<li data-testid="cart-line-${l.product.id}">${escapeHtml(l.product.name)} × <span data-testid="qty-${l.product.id}">${l.quantity}</span> — ${formatPrice(l.product.priceCents)}</li>`,
            )
            .join('')}</ul>
<p>Items: <span data-testid="cart-count">${count}</span></p>
<a href="/checkout" data-testid="go-checkout">Checkout</a>`;
    return reply.type('text/html').send(page('Cart', body, `page=cart items=${count}`));
  });
}
