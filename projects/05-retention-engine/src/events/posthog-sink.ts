import type { StoredEvent } from './schema';
import type { EventSink } from './sink';

/**
 * Product-analytics sink (funnels, cohorts, session replay). Postgres stays the
 * system of record; this only receives copies.
 *
 * Options: PostHog Cloud, self-hosted PostHog (keeps user PII inside our infra),
 * or Segment as a router in front of several tools. The adapter shape is the
 * same for all three.
 */
export class PostHogSink implements EventSink {
  readonly name = 'posthog';

  constructor(private readonly config: { host: string; projectApiKey: string }) {}

  async send(_event: StoredEvent): Promise<void> {
    // TODO: POST to `${host}/i/v0/e/` (or use posthog-node) with distinct_id = userId
    // and uuid = event.id, so PostHog dedupes our at-least-once redeliveries.
    void this.config;
    throw new Error('Not implemented: PostHog sink');
  }
}
