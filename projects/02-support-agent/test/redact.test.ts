import { luhnValid, PiiVault, redactDeep, redactText, restoreDeep } from '../src/policy/redact';

const redact = (text: string, vault = new PiiVault()) => redactText(text, vault);

describe('redactText', () => {
  it('redacts email addresses', () => {
    expect(redact('Reach me at amina.wanjiru@example.co.ke please')).toBe('Reach me at [EMAIL_1] please');
  });

  it.each([
    '+254712345678',
    '+254 712 345 678',
    '+254-712-345-678',
    '254712345678',
    '0712345678',
    '0712 345 678',
    '0110 123 456',
    '+254 110 123 456',
  ])('redacts Kenyan phone format %s', (phone) => {
    expect(redact(`call ${phone} now`)).toBe('call [PHONE_1] now');
  });

  it('redacts other international numbers', () => {
    expect(redact('US office +1 415 555 0100')).toBe('US office [PHONE_1]');
    expect(redact('UK +44 20 7946 0958.')).toBe('UK [PHONE_1].');
  });

  it('redacts Luhn-valid card numbers in common groupings', () => {
    expect(redact('card 4242 4242 4242 4242')).toBe('card [CARD_1]');
    expect(redact('card 4242-4242-4242-4242')).toBe('card [CARD_1]');
    expect(redact('amex 378282246310005')).toBe('amex [CARD_1]');
  });

  it('leaves Luhn-invalid long digit runs alone', () => {
    expect(redact('ref 4242 4242 4242 4241')).toBe('ref 4242 4242 4242 4241');
  });

  it('does not touch ids, amounts, dates or M-Pesa references', () => {
    const text = 'Order ord_1002, KES 8900, refund re_7001 expected 2026-10-10, created 2026-09-22T11:00:00.000Z, ref QJK4XY7Z2P, tracking G4S-883421';
    expect(redact(text)).toBe(text);
  });

  it('reuses one placeholder for the same value, including different phone spellings', () => {
    const vault = new PiiVault();
    expect(redact('a@b.co and A@B.CO', vault)).toBe('[EMAIL_1] and [EMAIL_1]');
    expect(redact('0712345678 or +254712345678', vault)).toBe('[PHONE_1] or [PHONE_1]');
    expect(vault.size).toBe(2);
  });

  it('is stable across calls (byte-identical transcripts turn to turn)', () => {
    const vault = new PiiVault();
    const text = 'x@y.com 0712345678 4242424242424242';
    expect(redact(text, vault)).toBe(redact(text, vault));
  });

  it('is idempotent on already-redacted text', () => {
    const vault = new PiiVault();
    const once = redact('mail a@b.co', vault);
    expect(redact(once, vault)).toBe(once);
  });
});

describe('PiiVault.restore', () => {
  it('restores known placeholders and leaves unknown ones', () => {
    const vault = new PiiVault();
    redact('a@b.co', vault);
    expect(vault.restore('send to [EMAIL_1] not [EMAIL_9]')).toBe('send to a@b.co not [EMAIL_9]');
  });
});

describe('redactDeep / restoreDeep', () => {
  it('round-trips nested tool results', () => {
    const vault = new PiiVault();
    const value = { customer: { email: 'grace@example.org', phones: ['+254 733 456 789'] }, amount: 6400 };
    const redacted = redactDeep(value, vault);
    expect(JSON.stringify(redacted)).not.toContain('grace@example.org');
    expect(redacted.amount).toBe(6400);
    expect(restoreDeep(redacted, vault)).toEqual(value);
  });
});

describe('luhnValid', () => {
  it.each([
    ['4242424242424242', true],
    ['5555555555554444', true],
    ['4242424242424241', false],
    ['123', false],
  ])('%s -> %s', (digits, expected) => {
    expect(luhnValid(digits)).toBe(expected);
  });
});
