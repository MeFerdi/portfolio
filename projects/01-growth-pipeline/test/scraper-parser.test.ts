import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseCompanyProfile } from '../src/scraper/profile-parser';

const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures', name), 'utf8');

describe('parseCompanyProfile', () => {
  it('extracts a typed profile from a JSON-LD rich page', () => {
    const profile = parseCompanyProfile(fixture('acme-about.html'), 'https://acme.example/about');

    expect(profile).toMatchSnapshot();
    // Explicit checks for the rules the snapshot encodes, so a careless snapshot update can't hide a regression.
    expect(profile.description).toBe('Managed data pipelines for B2B SaaS teams.'); // JSON-LD beats meta
    expect(profile.employeeCount).toBe(150); // midpoint of minValue/maxValue
    expect(profile.hasCareersPage).toBe(true);
    expect(profile.socialLinks).not.toContain('https://acme.example/blog');
    expect(profile.textExcerpt).not.toContain('should not appear'); // scripts stripped
    expect(profile.textExcerpt).not.toContain('Follow us'); // footer stripped
  });

  it('falls back to meta tags when JSON-LD is malformed', () => {
    const profile = parseCompanyProfile(fixture('minimal-company.html'), 'https://globex.example/');

    expect(profile).toMatchSnapshot();
    expect(profile.name).toBe('Globex Consulting');
    expect(profile.description).toBe('Independent strategy consultancy for retail brands.');
    expect(profile.employeeCount).toBeNull();
    expect(profile.hasCareersPage).toBe(false);
  });

  it('is pure: the same input always yields the same output', () => {
    const html = fixture('acme-about.html');
    expect(parseCompanyProfile(html, 'https://acme.example/')).toEqual(parseCompanyProfile(html, 'https://acme.example/'));
  });
});
