import { canonicalIdentity, leadKey, normaliseDomain, normaliseEmail, normaliseName, stageJobId } from '../src/pipeline/idempotency';
import { normaliseLead } from '../src/pipeline/stages/ingest';

describe('lead identity normalisation', () => {
  it.each([
    ['  Jane.Doe@Acme.COM ', 'jane.doe@acme.com'],
    ['JANE@acme.example', 'jane@acme.example'],
  ])('normaliseEmail(%p) = %p', (input, expected) => {
    expect(normaliseEmail(input)).toBe(expected);
  });

  it.each([
    ['acme.com', 'acme.com'],
    ['HTTPS://www.Acme.com:443/about?x=1#team', 'acme.com'],
    ['http://acme.com.', 'acme.com'],
    ['www.acme.co.uk/', 'acme.co.uk'],
    ['sales@acme.com', 'acme.com'],
  ])('normaliseDomain(%p) = %p', (input, expected) => {
    expect(normaliseDomain(input)).toBe(expected);
  });

  it('normalises names across case, accents, punctuation and spacing', () => {
    expect(normaliseName("  José  O'Brien-Smith ")).toBe('jose obrien smith');
    expect(normaliseName('JOSE OBRIEN SMITH')).toBe('jose obrien smith');
  });

  it('gives the same key to the same email however it is written', () => {
    expect(leadKey({ email: 'Jane@Acme.com' })).toBe(leadKey({ email: ' jane@acme.com' }));
  });

  it('falls back to domain + name when there is no email', () => {
    const a = leadKey({ companyDomain: 'https://www.acme.com/', fullName: 'José Díaz' });
    const b = leadKey({ companyDomain: 'acme.com', fullName: 'jose diaz' });
    expect(a).toBe(b);
    expect(a).not.toBe(leadKey({ companyDomain: 'acme.com', fullName: 'Maria Diaz' }));
  });

  it('prefers email over domain + name so enrichment later does not change identity', () => {
    expect(canonicalIdentity({ email: 'a@acme.com', companyDomain: 'acme.com', fullName: 'A' })).toBe('email:a@acme.com');
  });

  it('produces opaque keys with no PII and valid BullMQ job ids', () => {
    const key = leadKey({ email: 'jane@acme.com' });
    expect(key).toMatch(/^[0-9a-f]{32}$/);
    const jobId = stageJobId('research', key);
    expect(jobId).toBe(`research-${key}`);
    expect(jobId).not.toContain(':'); // BullMQ rejects ':' in custom ids
  });

  it('refuses leads with no usable identity', () => {
    expect(() => leadKey({ fullName: 'Nobody' })).toThrow();
    expect(() => normaliseLead({ fullName: 'Nobody', source: 'test' })).toThrow('Invalid lead');
  });

  it('normaliseLead derives the domain from websiteUrl when none is given', () => {
    const lead = normaliseLead({ email: 'X@Acme.com', websiteUrl: 'https://www.acme.com/about', source: 'test' });
    expect(lead).toMatchObject({ email: 'x@acme.com', companyDomain: 'acme.com', leadKey: leadKey({ email: 'x@acme.com' }) });
  });
});
