import type { Fault } from '../faults';
import type { CartLine } from '../store';

export function orderTotalCents(lines: CartLine[], fault: Fault | null): number {
  if (fault === 'checkout-total') {
    // Injected bug: quantity is ignored, so 2x of an item is charged once.
    return lines.reduce((sum, line) => sum + line.product.priceCents, 0);
  }
  return lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
