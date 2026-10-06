import { chromium, type Browser } from 'playwright';
import { parseCompanyProfile, type CompanyProfile } from './profile-parser';
import { isAllowedByRobots } from './robots';

/** Anything that can turn a public company URL into a CompanyProfile. */
export interface ProfileSource {
  fetchProfile(url: string): Promise<CompanyProfile>;
  close(): Promise<void>;
}

export class RobotsDisallowedError extends Error {
  constructor(readonly url: string) {
    super(`robots.txt disallows fetching ${url}`);
  }
}

export interface PlaywrightSourceOptions {
  userAgent: string;
  timeoutMs: number;
  executablePath?: string;
}

/**
 * Renders public company pages (many are client-side rendered) and hands the
 * HTML to the pure parser. Only for a company's own public pages: never point
 * this at LinkedIn or any site whose terms prohibit automated access.
 *
 * Requires a browser binary: `npx playwright install chromium`.
 */
export class PlaywrightProfileSource implements ProfileSource {
  // A promise, not a Browser, so concurrent jobs share one launch instead of racing.
  private browser: Promise<Browser> | null = null;

  constructor(private readonly opts: PlaywrightSourceOptions) {}

  async fetchProfile(url: string): Promise<CompanyProfile> {
    if (!(await this.robotsAllows(url))) throw new RobotsDisallowedError(url);

    const browser = await this.getBrowser();
    const context = await browser.newContext({ userAgent: this.opts.userAgent });
    try {
      const page = await context.newPage();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.opts.timeoutMs });
      if (!response || !response.ok()) {
        throw new Error(`Fetching ${url} failed with status ${response?.status() ?? 'no response'}`);
      }
      return parseCompanyProfile(await page.content(), page.url());
    } finally {
      await context.close();
    }
  }

  async close(): Promise<void> {
    const browser = this.browser;
    this.browser = null;
    if (browser) await (await browser).close();
  }

  private getBrowser(): Promise<Browser> {
    this.browser ??= chromium.launch({ headless: true, executablePath: this.opts.executablePath });
    return this.browser;
  }

  private async robotsAllows(url: string): Promise<boolean> {
    const target = new URL(url);
    const res = await fetch(new URL('/robots.txt', target.origin), {
      headers: { 'user-agent': this.opts.userAgent },
      signal: AbortSignal.timeout(this.opts.timeoutMs),
    });
    // No robots.txt means no restrictions; any other failure means we don't know, so don't fetch.
    if (res.status === 404 || res.status === 410) return true;
    if (!res.ok) return false;
    return isAllowedByRobots(await res.text(), this.opts.userAgent, target.pathname + target.search);
  }
}
