import type { FastifyInstance } from 'fastify';
import { buildStorefront } from '../storefront/app';
import { type Fault, parseFault } from '../storefront/faults';
import { DEMO_USER } from '../storefront/store';

async function signIn(app: FastifyInstance): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/login',
    payload: `email=${encodeURIComponent(DEMO_USER.email)}&password=${DEMO_USER.password}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });
  const cookie = res.headers['set-cookie'];
  if (typeof cookie !== 'string') throw new Error(`login failed: ${res.statusCode}`);
  return cookie.split(';')[0] ?? '';
}

async function add(app: FastifyInstance, cookie: string, productId: string) {
  return app.inject({
    method: 'POST',
    url: '/cart/add',
    payload: `productId=${productId}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie },
  });
}

/** 2 x mug ($14.99) + 1 x cap ($19.99). */
async function checkoutTotal(fault: Fault | null): Promise<string> {
  const app = buildStorefront({ fault });
  const cookie = await signIn(app);
  await add(app, cookie, 'mug');
  await add(app, cookie, 'mug');
  await add(app, cookie, 'cap');
  const res = await app.inject({ method: 'GET', url: '/checkout', headers: { cookie } });
  const match = /data-testid="order-total">([^<]+)</.exec(res.body);
  return match?.[1] ?? 'not found';
}

describe('storefront', () => {
  it('computes the correct checkout total with no fault', async () => {
    expect(await checkoutTotal(null)).toBe('$49.97');
  });

  it('BUG=checkout-total makes the checkout total wrong', async () => {
    expect(await checkoutTotal(parseFault('checkout-total'))).toBe('$34.98');
  });

  it('redirects anonymous users to /login', async () => {
    const res = await buildStorefront().inject({ method: 'GET', url: '/products' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('BUG=add-to-cart-noop leaves the cart empty', async () => {
    const app = buildStorefront({ fault: 'add-to-cart-noop' });
    const cookie = await signIn(app);
    await add(app, cookie, 'tee');
    const res = await app.inject({ method: 'GET', url: '/cart', headers: { cookie } });
    expect(res.body).toContain('data-testid="cart-empty"');
  });

  it('BUG=login-rejects-valid rejects the demo user', async () => {
    const app = buildStorefront({ fault: 'login-rejects-valid' });
    await expect(signIn(app)).rejects.toThrow('login failed: 401');
  });

  it('places an order and charges the same total as shown at checkout', async () => {
    const app = buildStorefront();
    const cookie = await signIn(app);
    await add(app, cookie, 'tee');
    const placed = await app.inject({ method: 'POST', url: '/checkout', headers: { cookie } });
    expect(placed.statusCode).toBe(302);
    const confirmation = await app.inject({ method: 'GET', url: String(placed.headers.location), headers: { cookie } });
    expect(confirmation.body).toContain('data-testid="charged-total">$24.99<');
  });

  describe('fault switch parsing', () => {
    it('treats unset or blank as no fault', () => {
      expect(parseFault(undefined)).toBeNull();
      expect(parseFault(' ')).toBeNull();
    });
    it('fails loudly on unknown values', () => {
      expect(() => parseFault('checkout-totl')).toThrow('Unknown BUG');
    });
  });
});
