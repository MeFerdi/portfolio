import { isAllowedByRobots } from '../src/scraper/robots';

const UA = 'GrowthPipelineBot/0.1 (+https://example.com/bot)';

describe('isAllowedByRobots', () => {
  it('allows everything when robots.txt is empty', () => {
    expect(isAllowedByRobots('', UA, '/about')).toBe(true);
  });

  it('applies the wildcard group', () => {
    const robots = 'User-agent: *\nDisallow: /private\n';
    expect(isAllowedByRobots(robots, UA, '/private/team')).toBe(false);
    expect(isAllowedByRobots(robots, UA, '/about')).toBe(true);
  });

  it('prefers a group naming our bot over the wildcard', () => {
    const robots = 'User-agent: *\nDisallow: /\n\nUser-agent: GrowthPipelineBot\nAllow: /about\nDisallow: /\n';
    expect(isAllowedByRobots(robots, UA, '/about')).toBe(true);
    expect(isAllowedByRobots(robots, UA, '/pricing')).toBe(false);
  });

  it('uses the longest matching rule and supports * and $', () => {
    const robots = 'User-agent: *\nDisallow: /*.pdf$\nDisallow: /docs\nAllow: /docs/public\n';
    expect(isAllowedByRobots(robots, UA, '/files/report.pdf')).toBe(false);
    expect(isAllowedByRobots(robots, UA, '/files/report.pdf?x=1')).toBe(true);
    expect(isAllowedByRobots(robots, UA, '/docs/internal')).toBe(false);
    expect(isAllowedByRobots(robots, UA, '/docs/public/intro')).toBe(true);
  });

  it('blocks a site that disallows all crawlers', () => {
    expect(isAllowedByRobots('User-agent: *\nDisallow: /', UA, '/')).toBe(false);
  });
});
