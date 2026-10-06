export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type TicketStatus = 'open' | 'resolved';

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  items: { sku: string; name: string; quantity: number }[];
  total: number;
  currency: string;
  placedAt: string;
  tracking: { carrier: string; number: string; eta: string | null } | null;
}

export interface Ticket {
  id: string;
  customerId: string;
  subject: string;
  status: TicketStatus;
  resolution: string | null;
  resolvedAt: string | null;
}

/** In-memory order + ticket database. */
export class MockOrderDb {
  private readonly orders: Map<string, Order>;
  private readonly tickets: Map<string, Ticket>;

  constructor(seed: { orders: Order[]; tickets: Ticket[] }) {
    this.orders = new Map(seed.orders.map((o) => [o.id, structuredClone(o)]));
    this.tickets = new Map(seed.tickets.map((t) => [t.id, structuredClone(t)]));
  }

  getOrder(orderId: string): Order | undefined {
    const order = this.orders.get(orderId);
    return order && structuredClone(order);
  }

  listOrdersForCustomer(customerId: string): Order[] {
    return [...this.orders.values()].filter((o) => o.customerId === customerId).map((o) => structuredClone(o));
  }

  getTicket(ticketId: string): Ticket | undefined {
    const ticket = this.tickets.get(ticketId);
    return ticket && structuredClone(ticket);
  }

  resolveTicket(ticketId: string, resolution: string, at: Date): Ticket {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    ticket.status = 'resolved';
    ticket.resolution = resolution;
    ticket.resolvedAt = at.toISOString();
    return structuredClone(ticket);
  }
}
