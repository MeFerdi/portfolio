export interface TwoProportionResult {
  p1: number;
  p2: number;
  /** p1 - p2 */
  diff: number;
  z: number;
  /** Two-sided. */
  pValue: number;
}

/**
 * Pooled two-proportion z-test (H0: p1 == p2). Fine for the sample sizes a
 * simulator produces; for small cells (n*p < ~10) prefer Fisher's exact test.
 */
export function twoProportionZTest(x1: number, n1: number, x2: number, n2: number): TwoProportionResult {
  for (const [name, x, n] of [['group 1', x1, n1], ['group 2', x2, n2]] as const) {
    if (!Number.isInteger(x) || !Number.isInteger(n) || n <= 0 || x < 0 || x > n) {
      throw new Error(`Invalid counts for ${name}: ${x}/${n}`);
    }
  }
  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pooled = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  // Both groups all-0 or all-1: no variance, no evidence of a difference.
  if (se === 0) return { p1, p2, diff: p1 - p2, z: 0, pValue: 1 };
  const z = (p1 - p2) / se;
  const pValue = Math.min(1, 2 * (1 - normalCdf(Math.abs(z))));
  return { p1, p2, diff: p1 - p2, z, pValue };
}

/** Standard normal CDF via the Abramowitz & Stegun 7.1.26 erf approximation (|error| < 1.5e-7). */
export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const poly =
    t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - poly * Math.exp(-ax * ax));
}
