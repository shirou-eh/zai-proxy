import * as crypto from 'node:crypto';
import type { ProxyConfig } from './config.js';
import { readJwtCached } from './auth.js';
import type { Logger } from './utils/logger.js';

export function buildBackendHeaders(
  model: string,
  config: Pick<ProxyConfig, 'reqHeadersPath'>,
): Record<string, string> {
  return {
    Authorization: 'Bearer autoclaw-internal-proxy',
    'X-Authorization': readJwtCached(config.reqHeadersPath),
    'X-Request-Id': crypto.randomUUID(),
    'X-Request-Model': model,
    'X-Client-Type': 'pc',
    'X-Product': 'autoclaw',
    'X-Harness-Type': 'zcode',
    'X-Tm': 'win',
    'X-Version': '1.17.8',
    'X-Lang': 'ru',
    'X-Channel': 'official',
    x_trace_id: 'autoclaw-desktop',
    Accept: '*/*',
    'Content-Type': 'application/json',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status: number): boolean {
  // 429 с Retry-After, 5xx, 408
  return status === 408 || status === 429 || status >= 500;
}

function getRetryAfterMs(res: Response): number | null {
  const v = res.headers.get('retry-after');
  if (!v) return null;
  const sec = Number(v);
  if (Number.isFinite(sec)) return Math.min(sec * 1000, 30_000);
  // HTTP-date
  const date = Date.parse(v);
  if (!Number.isNaN(date)) {
    const diff = date - Date.now();
    if (diff > 0 && diff < 30_000) return diff;
  }
  return null;
}

function isRetryableError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === 'AbortError') return false;
  if (e instanceof TypeError) return true; // fetch network error
  if (e instanceof Error) {
    const m = e.message.toLowerCase();
    if (
      m.includes('fetch failed') ||
      m.includes('aborted') ||
      m.includes('econn') ||
      m.includes('socket hang up') ||
      m.includes('terminated') ||
      m.includes('other side closed')
    )
      return true;
    const cause = (e as unknown as { cause?: unknown }).cause;
    if (cause instanceof Error && isRetryableError(cause)) return true;
  }
  return false;
}

export async function backendFetchWithRetry(
  body: unknown,
  backendModel: string,
  config: Pick<ProxyConfig, 'backendUrl' | 'backendTimeoutMs' | 'backendMaxRetries' | 'backendRetryBaseMs' | 'reqHeadersPath'>,
  logger: Logger,
  requestId: string,
): Promise<Response> {
  const maxAttempts = Math.max(1, config.backendMaxRetries);
  let lastErr: unknown;
  let lastRes: Response | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const headers = buildBackendHeaders(backendModel, config);

    const doFetch = async (): Promise<Response> => {
      if (config.backendTimeoutMs === 0) {
        return fetch(config.backendUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      }
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(new DOMException('backend timeout', 'AbortError')), config.backendTimeoutMs);
      try {
        return await fetch(config.backendUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(t);
      }
    };

    try {
      const r = await doFetch();
      if (r.ok) return r;

      lastRes = r;

      // 401/403/404/422 — не ретраим, это ошибка запроса
      if (!isRetryableStatus(r.status) || attempt === maxAttempts - 1) return r;

      const retryAfter = getRetryAfterMs(r);
      try {
        await r.text();
      } catch {}
      const base = retryAfter ?? config.backendRetryBaseMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * Math.min(500, base * 0.25));
      const backoff = Math.min(base + jitter, 10_000);
      logger.debug(requestId, `backend retryable ${r.status} attempt ${attempt + 1}/${maxAttempts} backoff=${backoff}ms`);
      await sleep(backoff);
      continue;
    } catch (e) {
      lastErr = e;
      const retryable = isRetryableError(e);
      if (!retryable || attempt === maxAttempts - 1) throw e;
      const base = config.backendRetryBaseMs * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * Math.min(400, base * 0.3));
      const backoff = Math.min(base + jitter, 8000);
      const msg = String((e as Error).cause ?? e).slice(0, 280);
      logger.debug(requestId, `backend fetch attempt ${attempt + 1}/${maxAttempts} failed: ${msg} backoff=${backoff}ms`);
      await sleep(backoff);
    }
  }

  if (lastRes !== null) return lastRes;
  throw lastErr ?? new Error('backend fetch failed');
}
