import { randomUUID } from 'node:crypto';

export interface Product {
  id: string;
  name: string;
  priceCents: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  email: string;
  lines: CartLine[];
  totalCents: number;
}

interface Session {
  email: string;
  cart: Map<string, number>;
}

export const DEMO_USER = { email: 'demo@shop.test', password: 'correct-horse' } as const;

export const CATALOG: readonly Product[] = [
  { id: 'mug', name: 'Enamel Mug', priceCents: 1499 },
  { id: 'tee', name: 'Logo T-Shirt', priceCents: 2499 },
  { id: 'cap', name: 'Canvas Cap', priceCents: 1999 },
];

/** Process-local state. Restarting the storefront resets everything, which is what a test target wants. */
export class InMemoryStore {
  private readonly sessions = new Map<string, Session>();
  private readonly orders = new Map<string, Order>();

  findProduct(id: string): Product | undefined {
    return CATALOG.find((p) => p.id === id);
  }

  createSession(email: string): string {
    const sid = randomUUID();
    this.sessions.set(sid, { email, cart: new Map() });
    return sid;
  }

  sessionEmail(sid: string | undefined): string | undefined {
    return sid ? this.sessions.get(sid)?.email : undefined;
  }

  addToCart(sid: string, productId: string): void {
    const session = this.requireSession(sid);
    session.cart.set(productId, (session.cart.get(productId) ?? 0) + 1);
  }

  cartLines(sid: string): CartLine[] {
    const session = this.requireSession(sid);
    const lines: CartLine[] = [];
    for (const [productId, quantity] of session.cart) {
      const product = this.findProduct(productId);
      if (product) lines.push({ product, quantity });
    }
    return lines;
  }

  placeOrder(sid: string, totalCents: number): Order {
    const session = this.requireSession(sid);
    const order: Order = {
      id: randomUUID().slice(0, 8),
      email: session.email,
      lines: this.cartLines(sid),
      totalCents,
    };
    this.orders.set(order.id, order);
    session.cart.clear();
    return order;
  }

  getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  private requireSession(sid: string): Session {
    const session = this.sessions.get(sid);
    if (!session) throw new Error(`Unknown session ${sid}`);
    return session;
  }
}
