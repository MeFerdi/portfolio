export interface CustomerRecord {
  id: string;
  name: string;
  preferredName: string | null;
  email: string;
  phone: string;
  shippingAddress: string;
  tier: 'standard' | 'gold';
  updatedAt: string;
}

/** Fields a customer may change about themselves through the agent. */
export const EDITABLE_FIELDS = ['preferredName', 'email', 'phone', 'shippingAddress'] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];

/** In-memory CRM. Every write is appended to an audit log. */
export class MockCrm {
  private readonly customers: Map<string, CustomerRecord>;
  readonly auditLog: { customerId: string; field: EditableField; at: string; actor: string }[] = [];

  constructor(seed: CustomerRecord[]) {
    this.customers = new Map(seed.map((c) => [c.id, structuredClone(c)]));
  }

  getCustomer(customerId: string): CustomerRecord | undefined {
    const customer = this.customers.get(customerId);
    return customer && structuredClone(customer);
  }

  updateCustomer(customerId: string, field: EditableField, value: string, at: Date, actor: string): CustomerRecord {
    const customer = this.customers.get(customerId);
    if (!customer) throw new Error(`Customer ${customerId} not found`);
    customer[field] = value;
    customer.updatedAt = at.toISOString();
    // The audit log records which field changed, not the values (they are PII).
    this.auditLog.push({ customerId, field, at: customer.updatedAt, actor });
    return structuredClone(customer);
  }
}
