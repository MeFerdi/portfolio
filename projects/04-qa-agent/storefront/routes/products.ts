import type { FastifyInstance } from 'fastify';
import type { StorefrontDeps } from '../app';
import { formatPrice } from '../lib/pricing';
import { requireSession } from '../lib/session';
import { CATALOG } from '../store';
import { escapeHtml, page } from '../views/layout';

export function registerProductRoutes(app: FastifyInstance, { store }: StorefrontDeps): void {
  app.get('/', async (_request, reply) => reply.redirect('/products'));

  app.get('/products', async (request, reply) => {
    if (!requireSession(request, reply, store)) return reply;
    const items = CATALOG.map(
      (p) => `<li data-testid="product-${p.id}">
  <span class="name">${escapeHtml(p.name)}</span>
  <span class="price">${formatPrice(p.priceCents)}</span>
  <form method="post" action="/cart/add">
    <input type="hidden" name="productId" value="${p.id}">
    <button type="submit" data-testid="add-${p.id}">Add to cart</button>
  </form>
</li>`,
    ).join('\n');
    return reply.type('text/html').send(page('Products', `<ul>${items}</ul>`, 'page=products'));
  });
}
