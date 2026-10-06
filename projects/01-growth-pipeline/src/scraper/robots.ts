/**
 * Minimal robots.txt evaluation: groups, Allow/Disallow, longest-match wins,
 * `*` and `$` wildcards. Pure so it can be unit tested; the fetcher calls it
 * before every page load and refuses disallowed paths.
 */

interface Rule {
  allow: boolean;
  pattern: string;
}

export function isAllowedByRobots(robotsTxt: string, userAgent: string, path: string): boolean {
  const rules = rulesFor(robotsTxt, userAgent.toLowerCase());
  let best: Rule | null = null;
  for (const rule of rules) {
    if (rule.pattern === '' || !matches(rule.pattern, path)) continue;
    if (
      best === null ||
      rule.pattern.length > best.pattern.length ||
      (rule.pattern.length === best.pattern.length && rule.allow)
    ) {
      best = rule;
    }
  }
  return best === null ? true : best.allow;
}

function rulesFor(robotsTxt: string, ua: string): Rule[] {
  const groups: { agents: string[]; rules: Rule[] }[] = [];
  let current: { agents: string[]; rules: Rule[] } | null = null;
  let lastWasAgent = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const field = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();

    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((field === 'allow' || field === 'disallow') && current) {
      current.rules.push({ allow: field === 'allow', pattern: value });
      lastWasAgent = false;
    }
  }

  // Product token match beats the wildcard group.
  const token = ua.split('/')[0] ?? ua;
  const specific = groups.filter((g) => g.agents.some((a) => a !== '*' && token.includes(a)));
  const chosen = specific.length > 0 ? specific : groups.filter((g) => g.agents.includes('*'));
  return chosen.flatMap((g) => g.rules);
}

function matches(pattern: string, path: string): boolean {
  const anchored = pattern.endsWith('$');
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const regex = body
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${regex}${anchored ? '$' : ''}`).test(path);
}
