import * as cheerio from 'cheerio';

/** What we extract from a company's own public web page. */
export interface CompanyProfile {
  url: string;
  name: string | null;
  description: string | null;
  industry: string | null;
  employeeCount: number | null;
  location: string | null;
  socialLinks: string[];
  hasCareersPage: boolean;
  headings: string[];
  /** Visible text, whitespace-collapsed and truncated, for the research prompt. */
  textExcerpt: string;
}

const MAX_EXCERPT_CHARS = 2000;
const MAX_HEADINGS = 10;
const SOCIAL_HOSTS = ['github.com', 'x.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'mastodon.social'];
const ORG_TYPES = new Set(['Organization', 'Corporation', 'LocalBusiness', 'SoftwareApplication']);

/**
 * Pure: HTML in, typed record out. No network, no browser, so it is tested
 * against fixture pages in test/fixtures/. Prefers schema.org JSON-LD, then
 * Open Graph / meta tags, then visible markup.
 */
export function parseCompanyProfile(html: string, url: string): CompanyProfile {
  const $ = cheerio.load(html);
  const org = findOrganisationJsonLd($);

  const name =
    stringOrNull(org?.['name']) ??
    clean($('meta[property="og:site_name"]').attr('content')) ??
    clean($('title').first().text().split(/[|\-–—]/)[0]);

  const description =
    stringOrNull(org?.['description']) ??
    clean($('meta[name="description"]').attr('content')) ??
    clean($('meta[property="og:description"]').attr('content'));

  const socialLinks = new Set<string>();
  for (const link of asArray(org?.['sameAs'])) {
    if (typeof link === 'string' && isSocial(link)) socialLinks.add(link);
  }
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && isSocial(href)) socialLinks.add(href);
  });

  const hasCareersPage =
    $('a[href]')
      .toArray()
      .some((el) => /\/(careers|jobs)\b/i.test($(el).attr('href') ?? '') || /^\s*(careers|jobs|we.?re hiring)\s*$/i.test($(el).text()));

  const headings = $('h1, h2')
    .toArray()
    .map((el) => collapse($(el).text()))
    .filter((t) => t.length > 0)
    .slice(0, MAX_HEADINGS);

  $('script, style, noscript, nav, footer, svg').remove();
  const textExcerpt = collapse($('body').text()).slice(0, MAX_EXCERPT_CHARS);

  return {
    url,
    name,
    description,
    industry: stringOrNull(org?.['industry']),
    employeeCount: parseEmployeeCount(org?.['numberOfEmployees']),
    location: parseLocation(org?.['address']),
    socialLinks: [...socialLinks].sort(),
    hasCareersPage,
    headings,
    textExcerpt,
  };
}

type JsonObject = Record<string, unknown>;

function findOrganisationJsonLd($: cheerio.CheerioAPI): JsonObject | null {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    let parsed: unknown;
    try {
      parsed = JSON.parse($(el).text());
    } catch {
      continue; // malformed JSON-LD is common in the wild; fall back to meta tags
    }
    const candidates = asArray(parsed).flatMap((node) =>
      isObject(node) && Array.isArray(node['@graph']) ? node['@graph'] : [node],
    );
    for (const node of candidates) {
      if (isObject(node) && asArray(node['@type']).some((t) => typeof t === 'string' && ORG_TYPES.has(t))) {
        return node;
      }
    }
  }
  return null;
}

function parseEmployeeCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value);
  if (isObject(value)) {
    if (value['value'] !== undefined) return parseEmployeeCount(value['value']);
    const min = parseEmployeeCount(value['minValue']);
    const max = parseEmployeeCount(value['maxValue']);
    if (min !== null && max !== null) return Math.round((min + max) / 2);
    return min ?? max;
  }
  return null;
}

function parseLocation(address: unknown): string | null {
  if (typeof address === 'string') return clean(address);
  if (!isObject(address)) return null;
  const parts = ['addressLocality', 'addressRegion', 'addressCountry']
    .map((k) => stringOrNull(address[k]))
    .filter((p): p is string => p !== null);
  return parts.length > 0 ? parts.join(', ') : null;
}

function isSocial(href: string): boolean {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function isObject(v: unknown): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asArray(v: unknown): unknown[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

function stringOrNull(v: unknown): string | null {
  return typeof v === 'string' ? clean(v) : null;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function clean(text: string | undefined): string | null {
  if (text === undefined) return null;
  const c = collapse(text);
  return c.length > 0 ? c : null;
}
