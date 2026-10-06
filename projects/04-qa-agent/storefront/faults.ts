/**
 * Deliberate, env-driven bugs so the demo loop can break the app on purpose.
 * Each fault lives in exactly one place in the code, so a diagnosis can be
 * scored against a known root cause.
 */
export const FAULTS = {
  /** Checkout total ignores line quantities. Root cause: storefront/lib/pricing.ts */
  'checkout-total': 'storefront/lib/pricing.ts',
  /** "Add to cart" silently does nothing. Root cause: storefront/routes/cart.ts */
  'add-to-cart-noop': 'storefront/routes/cart.ts',
  /** Valid credentials are rejected. Root cause: storefront/routes/login.ts */
  'login-rejects-valid': 'storefront/routes/login.ts',
} as const;

export type Fault = keyof typeof FAULTS;

/** Unknown values fail loudly: a typo in BUG= must not produce a "healthy" demo. */
export function parseFault(raw: string | undefined): Fault | null {
  if (raw === undefined || raw.trim() === '') return null;
  const value = raw.trim();
  if (!(value in FAULTS)) {
    throw new Error(`Unknown BUG="${value}". Expected one of: ${Object.keys(FAULTS).join(', ')}`);
  }
  return value as Fault;
}
