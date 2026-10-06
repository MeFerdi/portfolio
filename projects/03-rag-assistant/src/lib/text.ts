const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can could did do does for from had has have how i if in into is it its ' +
    'me my no not of on or our should so than that the their them then there these they this to was we were ' +
    'what when where which who whom why will with would you your about any all also am may must per'
  ).split(' '),
);

/** Collapse runs of whitespace so quotes survive chunk re-wrapping. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Lowercase content terms with a deliberately crude plural fold. Used by both
 * the BM25 index and the hashing embedder, so query and document sides agree.
 */
export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const out: string[] = [];
  for (const word of words) {
    if (STOPWORDS.has(word)) continue;
    out.push(foldPlural(word));
  }
  return out;
}

function foldPlural(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);
  return word;
}
