/**
 * PII redaction applied to everything sent to the LLM.
 *
 * Values are swapped for stable placeholders like `[EMAIL_1]`; the mapping is
 * held server-side in a per-conversation PiiVault so placeholders the model
 * echoes back (in replies or tool arguments) can be restored before they reach
 * the customer or a backend. The same value always maps to the same
 * placeholder, which keeps the transcript the model sees byte-stable across
 * turns (required for prompt caching and preserved thinking).
 *
 * Detection is pattern-based and deliberately biased toward over-redaction.
 * TODO: names and street addresses are not detected; evaluate an NER pass.
 */

export type PiiKind = 'EMAIL' | 'PHONE' | 'CARD';

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

// 13-19 digits, optionally grouped by spaces or dashes. Luhn-checked before redacting.
const CARD_CANDIDATE = /(?<![\d])\d(?:[ -]?\d){12,18}(?![\d])/g;

// Kenyan mobile/landline-style numbers: +254 / 254 / 0 prefix, then 7xx or 1xx
// and six more digits, with optional space/dash grouping.
//   +254712345678  +254 712 345 678  254-712-345-678  0712345678  0712 345 678  0110 123 456
const KENYAN_PHONE = /(?<![\d+])(?:\+254|254|0)[ -]?\(?[17]\d{2}\)?[ -]?\d{3}[ -]?\d{3}(?![\d])/g;

// Other international numbers in +CC form, e.g. +1 415 555 0100, +44 20 7946 0958.
const INTL_PHONE = /(?<![\w+])\+\d{1,3}(?:[ -]?\(?\d{1,4}\)?){2,5}(?![\d])/g;

const PLACEHOLDER = /\[(EMAIL|PHONE|CARD)_(\d+)\]/g;

export function luhnValid(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function normalize(kind: PiiKind, value: string): string {
  if (kind === 'EMAIL') return value.toLowerCase();
  const digits = value.replace(/\D/g, '');
  if (kind === 'PHONE' && /^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  return digits;
}

/** Server-side, per-conversation mapping between placeholders and real values. Never serialised to the model. */
export class PiiVault {
  private readonly byKey = new Map<string, string>();
  private readonly byPlaceholder = new Map<string, string>();
  private readonly counters: Record<PiiKind, number> = { EMAIL: 0, PHONE: 0, CARD: 0 };

  placeholderFor(kind: PiiKind, value: string): string {
    const key = `${kind}:${normalize(kind, value)}`;
    const existing = this.byKey.get(key);
    if (existing) return existing;
    const placeholder = `[${kind}_${++this.counters[kind]}]`;
    this.byKey.set(key, placeholder);
    this.byPlaceholder.set(placeholder, value);
    return placeholder;
  }

  /** Replaces known placeholders with their original values; unknown ones are left as-is. */
  restore(text: string): string {
    return text.replace(PLACEHOLDER, (match) => this.byPlaceholder.get(match) ?? match);
  }

  get size(): number {
    return this.byPlaceholder.size;
  }
}

export function redactText(text: string, vault: PiiVault): string {
  // Order matters: emails first (they can contain digits), then cards (a
  // 16-digit card must not be half-eaten by the phone patterns), then phones.
  let out = text.replace(EMAIL, (m) => vault.placeholderFor('EMAIL', m));
  out = out.replace(CARD_CANDIDATE, (m) => (luhnValid(m.replace(/[ -]/g, '')) ? vault.placeholderFor('CARD', m) : m));
  out = out.replace(KENYAN_PHONE, (m) => vault.placeholderFor('PHONE', m));
  out = out.replace(INTL_PHONE, (m) => (m.replace(/\D/g, '').length >= 8 ? vault.placeholderFor('PHONE', m) : m));
  return out;
}

/** Redacts every string inside a JSON-like value. Object keys are left alone. */
export function redactDeep<T>(value: T, vault: PiiVault): T {
  return mapStrings(value, (s) => redactText(s, vault));
}

/** Restores placeholders inside every string of a JSON-like value. */
export function restoreDeep<T>(value: T, vault: PiiVault): T {
  return mapStrings(value, (s) => vault.restore(s));
}

function mapStrings<T>(value: T, fn: (s: string) => string): T {
  if (typeof value === 'string') return fn(value) as T;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)])) as T;
  }
  return value;
}
