/** Injectable time source so expiry and rate-limit logic is testable without sleeps. */
export interface Clock {
  now(): number;
}

export const systemClock: Clock = { now: () => Date.now() };

/** Manually advanced clock for tests. */
export class ManualClock implements Clock {
  constructor(private current = Date.parse('2026-01-01T00:00:00Z')) {}

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    this.current += ms;
  }
}
