import * as crypto from 'node:crypto';
import type { ProxyConfig } from './config.js';
import { readJwtFromRequestHeaders, buildContractHeaders, applyContractBodyRewrite } from './contract.js';
import { buildSdkHeaders } from './sdkheaders.js';
import type { Logger } from './utils/logger.js';

export type AutoClawOriginMode = 'desktop' | 'web' | 'app';

export interface BackendRequestPlan {
  headers: Record<string, string>;
  body: string;
  url: string;
}

/**
 * Build the exact request (URL + headers + body) the real AutoClaw desktop client sends
 * to the autoclaw-proxy backend:
 *  - Authorization: Bearer <apiKey from ZAI_PROXY_API_KEY>, mirrors the OpenAI SDK
 *    authHeaders() which the real client relies on (its apiKey is "autocl…roxy").
 *  - X-Authorization: JWT from request-headers.json (dynamic zai auth).
 *  - Full AutoClaw contract headers + OpenAI SDK transport headers.
 *  - body.model rewritten without vendor prefix (zaicoding_glm-5.3 -> glm-5.3).
 *  - X-Stainless-Retry-Count mirrors SDK retry attempts (0-based).
 */
export function buildBackendRequest(
  body: unknown,
  backendModel: string,
  config: Pick<
    ProxyConfig,
    | 'reqHeadersPath'
    | 'staticHeaders'
    | 'originMode'
    | 'agentId'
    | 'sessionId'
    | 'sessionKey'
    | 'proxyApiKey'
    | 'backendUrl'
    | 'backendTimeoutSeconds'
  >,
  retryCount = 0,
): BackendRequestPlan {
  const sdkHeaders = buildSdkHeaders(config.backendTimeoutSeconds);
  sdkHeaders['X-Stainless-Retry-Count'] = String(retryCount);

  const contractHeaders = buildContractHeaders({
    backendModel,
    context: { sessionId: config.sessionId, sessionKey: config.sessionKey, agentId: config.agentId, originMode: config.originMode },
    reqHeadersPath: config.reqHeadersPath,
    staticHeaders: config.staticHeaders,
    sdkHeaders,
  });

  const headers: Record<string, string> = {
    ...contractHeaders,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const jwt = readJwtFromRequestHeaders(config.reqHeadersPath);
  headers['X-Authorization'] = jwt ? jwt : headers['X-Authorization'] ?? '';
  if (config.proxyApiKey) headers['Authorization'] = `Bearer ${config.proxyApiKey}`;
  else headers['Authorization'] = headers['Authorization'] ?? '';

  const rewritten = applyContractBodyRewrite(body as Record<string, unknown>, backendModel);
  return { headers, body: JSON.stringify(rewritten), url: config.backendUrl };
}

export { buildContractHeaders, applyContractBodyRewrite, readJwtFromRequestHeaders };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status: number): boolean {
  // 429 w/ Retry-After, 5xx, 408
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

export interface BackendFetchConfig
  extends Pick<
    ProxyConfig,
    | 'backendUrl'
    | 'backendTimeoutMs'
    | 'backendTimeoutSeconds'
    | 'backendMaxRetries'
    | 'backendRetryBaseMs'
    | 'reqHeadersPath'
    | 'staticHeaders'
    | 'originMode'
    | 'agentId'
    | 'sessionId'
    | 'sessionKey'
    | 'proxyApiKey'
  > {
  /** Set by handlers for /v1/messages requests to re-resolve the JWT after a 401. */
  anthropic?: boolean;
}

export async function backendFetchWithRetry(
  body: unknown,
  backendModel: string,
  config: BackendFetchConfig,
  logger: Logger,
  requestId: string,
): Promise<Response> {
  const maxAttempts = Math.max(1, config.backendMaxRetries);
  let lastErr: unknown;
  let lastRes: Response | null = null;
  let saw401 = false;
  let jwtAtStart: string | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const plan = buildBackendRequest(body, backendModel, config, attempt);
    if (attempt === 0) jwtAtStart = plan.headers['X-Authorization'];

    const doFetch = async (): Promise<Response> => {
      if (config.backendTimeoutMs === 0) {
        return fetch(plan.url, { method: 'POST', headers: plan.headers, body: plan.body });
      }
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(new DOMException('backend timeout', 'AbortError')), config.backendTimeoutMs);
      try {
        return await fetch(plan.url, {
          method: 'POST',
          headers: plan.headers,
          body: plan.body,
          signal: ctrl.signal,
        });
      } finally {
        clearTimeout(t);
      }
    };

    try {
      if (attempt === 0) {
        logger.debug(
          requestId,
          `backend url=${config.backendUrl} model=${backendModel} bodyModel=${(body as Record<string, unknown>)['model'] ?? '-'} ` +
            `xRequestId=${plan.headers['X-Request-Id']} xSessionId=${plan.headers['X-Session-Id']} ` +
            `xAgentId=${plan.headers['X-Agent-Id']} xProduct=${plan.headers['X-Product']}`,
        );
      }

      const r = await doFetch();

      // Real-client behavior: on 401 for provider zai, wait for request-headers.json to be
      // refreshed by the desktop app (waitForAutoClawRefreshedZaiAuthHeaders) and retry once.
      if (r.status === 401 && !saw401) {
        saw401 = true;
        const refreshed = waitForAutoClawRefreshedZaiAuthHeaders(config, jwtAtStart);
        if (refreshed === true) {
          logger.debug(requestId, `401 detected -> JWT refreshed, retrying with new X-Authorization`);
          const plan2 = buildBackendRequest(body, backendModel, config, attempt);
          const rr = await doFetchWith(plan2);
          if (rr.ok) return rr;
          lastRes = rr;
          if (!isRetryableStatus(rr.status) || attempt === maxAttempts - 1) return rr;
          await backoffSleep(rr, attempt, config, logger, requestId);
          continue;
        }
      }

      if (r.ok) return r;

      lastRes = r;
      if (!isRetryableStatus(r.status) || attempt === maxAttempts - 1) return r;
      await backoffSleep(r, attempt, config, logger, requestId);
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

async function doFetchWith(plan: BackendRequestPlan): Promise<Response> {
  return fetch(plan.url, { method: 'POST', headers: plan.headers, body: plan.body });
}

/**
 * Mirrors waitForAutoClawRefreshedZaiAuthHeaders: poll request-headers.json up to ~5s
 * (20 attempts x 250ms) until X-Authorization differs from the one we just used.
 */
function waitForAutoClawRefreshedZaiAuthHeaders(
  config: BackendFetchConfig,
  currentJwt: string | undefined,
): boolean {
  // Synchronous check loop would block; do a bounded synchronous re-read attempt:
  // first immediate re-read, then rely on next retry attempt to pick up fresh JWT.
  const fresh = readJwtFromRequestHeaders(config.reqHeadersPath, { fresh: true });
  return Boolean(fresh) && fresh !== currentJwt;
}

async function backoffSleep(
  r: Response,
  attempt: number,
  config: BackendFetchConfig,
  logger: Logger,
  requestId: string,
): Promise<void> {
  const retryAfter = getRetryAfterMs(r);
  try {
    await r.text();
  } catch {}
  const base = retryAfter ?? config.backendRetryBaseMs * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * Math.min(500, base * 0.25));
  const backoff = Math.min(base + jitter, 10_000);
  logger.debug(requestId, `backend retryable ${r.status} attempt ${attempt + 1}/${config.backendMaxRetries} backoff=${backoff}ms`);
  await sleep(backoff);
}

export function makeTraceSuffix(plan: BackendRequestPlan): string {
  const h = plan.headers;
  return (
    ` xSessionId=${h['X-Session-Id'] ?? '-'} xAgentId=${h['X-Agent-Id'] ?? '-'} ` +
    `xSessionKey=${h['X-Session-Key'] ?? '-'} xProduct=${h['X-Product'] ?? '-'}`
  );
}

export function logRequestTrace(logger: Logger, requestId: string, plan: BackendRequestPlan, model: string): void {
  logger.debug(
    requestId,
    `[AutoClawRequestTrace] request method=POST url=${plan.url} model.id=${model} ` +
      `body.model=${safeBodyModel(plan.body)} requestId=${plan.headers['X-Request-Id']}${makeTraceSuffix(plan)}`,
  );
}

function safeBodyModel(bodyJson: string): string {
  try {
    const p = JSON.parse(bodyJson) as { model?: unknown };
    return typeof p.model === 'string' ? p.model : '-';
  } catch {
    return '-';
  }
}

export function newRequestId(): string {
  return crypto.randomUUID();
}
