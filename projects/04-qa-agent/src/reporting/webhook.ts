export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export interface PostOptions {
  fetch?: FetchLike;
  attempts?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

/** POST JSON to a chat webhook, retrying network errors, 429 and 5xx with exponential backoff. */
export async function postJson(url: string, body: unknown, options: PostOptions = {}): Promise<void> {
  const doFetch = options.fetch ?? (fetch as unknown as FetchLike);
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const sleep = options.sleep ?? defaultSleep;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await sleep(baseDelayMs * 2 ** (attempt - 1));
    try {
      const res = await doFetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
      });
      if (res.ok) return;
      const detail = `webhook responded ${res.status}: ${(await res.text()).slice(0, 200)}`;
      if (!isRetryable(res.status)) throw new NonRetryableError(detail);
      lastError = new Error(detail);
    } catch (err) {
      if (err instanceof NonRetryableError) throw err;
      lastError = err;
    }
  }
  throw new Error(`webhook POST failed after ${attempts} attempts: ${String(lastError)}`);
}

class NonRetryableError extends Error {}
