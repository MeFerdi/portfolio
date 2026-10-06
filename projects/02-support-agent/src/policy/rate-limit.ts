import type { Clock } from '../lib/clock';

export interface RateLimitConfig {
  capacity: number;
  refillPerMinute: number;
}

/** Classic token bucket: `capacity` burst, refilled continuously. */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly config: RateLimitConfig,
    private readonly clock: Clock,
  ) {
    this.tokens = config.capacity;
    this.lastRefill = clock.now();
  }

  tryTake(): { allowed: true } | { allowed: false; retryAfterMs: number } {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true };
    }
    const msPerToken = 60_000 / this.config.refillPerMinute;
    return { allowed: false, retryAfterMs: Math.ceil((1 - this.tokens) * msPerToken) };
  }

  private refill(): void {
    const now = this.clock.now();
    const elapsedMinutes = (now - this.lastRefill) / 60_000;
    this.tokens = Math.min(this.config.capacity, this.tokens + elapsedMinutes * this.config.refillPerMinute);
    this.lastRefill = now;
  }
}

/**
 * One bucket per conversation, charged for every tool invocation the model
 * attempts (including refused ones), so a looping or adversarial model is
 * throttled rather than allowed to hammer backends or probe the policy.
 * TODO: buckets live in process memory; move to Redis when running >1 instance.
 */
export class ToolRateLimiter {
  private readonly buckets = new Map<string, TokenBucket>();

  constructor(
    private readonly config: RateLimitConfig,
    private readonly clock: Clock,
  ) {}

  tryTake(conversationId: string) {
    let bucket = this.buckets.get(conversationId);
    if (!bucket) {
      bucket = new TokenBucket(this.config, this.clock);
      this.buckets.set(conversationId, bucket);
    }
    return bucket.tryTake();
  }
}
