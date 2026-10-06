import { z } from 'zod';
import { EDITABLE_FIELDS, type EditableField } from '../mocks/crm';
import { ToolRefusal } from '../policy/types';
import { defineTool } from './define';

export const getCustomerProfile = defineTool({
  name: 'get_customer_profile',
  description: "Read the authenticated customer's own CRM record. Takes no id: it can only ever return the caller's record.",
  access: 'read',
  scope: 'crm:read',
  input: z.strictObject({}),
  execute(ctx) {
    const c = ctx.backends.crm.getCustomer(ctx.customerId);
    if (!c) throw new ToolRefusal('out_of_scope', 'Customer record not found.');
    return c;
  },
});

const FIELD_VALUE: Record<EditableField, z.ZodType<string>> = {
  preferredName: z.string().min(1).max(80),
  email: z.email(),
  phone: z.string().regex(/^\+?[\d ()-]{9,20}$/, 'not a phone number'),
  shippingAddress: z.string().min(5).max(200),
};

function validateValue(field: EditableField, value: string): void {
  const result = FIELD_VALUE[field].safeParse(value);
  if (!result.success) {
    throw new ToolRefusal('invalid_arguments', `The new ${field} is not valid: ${result.error.issues[0]?.message ?? 'invalid'}`);
  }
}

export const updateCustomerRecord = defineTool({
  name: 'update_customer_record',
  description:
    "Change one field on the authenticated customer's own CRM record. Only preferredName, email, phone and shippingAddress are editable. Requires the customer's confirmation before it takes effect.",
  access: 'write',
  scope: 'crm:write',
  input: z.strictObject({
    field: z.enum(EDITABLE_FIELDS),
    value: z.string().min(1).max(200),
  }),
  describe(ctx, { field, value }) {
    validateValue(field, value);
    const current = ctx.backends.crm.getCustomer(ctx.customerId);
    if (!current) throw new ToolRefusal('out_of_scope', 'Customer record not found.');
    return `Change your ${field} from "${current[field] ?? '(not set)'}" to "${value}"`;
  },
  execute(ctx, { field, value }) {
    validateValue(field, value);
    const updated = ctx.backends.crm.updateCustomer(ctx.customerId, field, value, ctx.now, 'support-agent:customer-confirmed');
    return { customerId: updated.id, field, updatedAt: updated.updatedAt };
  },
});
