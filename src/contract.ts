/**
 * AutoClaw request-contract emulation.
 *
 * Mirrors the real desktop client (gateway-bundle applyAutoClawRequestContract):
 *  - dynamic headers merged from request-headers.json (incl. per-session headers)
 *  - X-Request-Id / X-Session-Id / X-Agent-Id / X-Session-Key contract
 *  - origin headers: X-Autoclaw-Source / X-Autoclaw-Channel / X-Autoclaw-Chat-Type /
 *    X-Autoclaw-Session-Key / X-Autoclaw-Agent-Id
 *  - X-Client-Type derived from origin mode (desktop -> pc), X-Product forced to "autoclaw"
 *  - body rewrite: payload.model = normalizeAutoClawRequestBodyModel(model.id)
 *    (strip ^[a-z]+_ vendor prefix: zaicoding_glm-5.3 -> glm-5.3)
 *  - client-sign (X-Client-Sig / PoW) is intentionally NOT applied: the real client
 *    skips it for provider "zai".
 */
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';

export type OriginMode = 'desktop' | 'web' | 'app';

export interface ContractContext {
  sessionId: string;
  sessionKey: string;
  agentId: string;
  originMode: OriginMode;
}

export interface RequestHeadersFile {
  headers: Record<string, string>;
  sessionHeaders: Record<string, Record<string, string>> | null;
}

interface CachedHeadersFile {
  mtimeMs: number;
  size: number;
  data: RequestHeadersFile | null;
}

let fileCache: CachedHeadersFile | null = null;

export function invalidateRequestHeadersCache(): void {
  fileCache = null;
}

/**
 * Read request-headers.json ({"headers": {...}, "sessionHeaders": {<key>: {...}}})
 * with mtime+size caching, mirroring auth.ts semantics.
 */
export function readRequestHeadersFile(reqHeadersPath: string, opts?: { fresh?: boolean }): RequestHeadersFile | null {
  try {
    const stat = fs.statSync(reqHeadersPath);
    if (!opts?.fresh && fileCache !== null && fileCache.mtimeMs === stat.mtimeMs && fileCache.size === stat.size) {
      return fileCache.data;
    }
    const raw = fs.readFileSync(reqHeadersPath, 'utf8').trim();
    if (!raw) return fileCache?.data ?? null;
    const parsed: unknown = JSON.parse(raw);
    let data: RequestHeadersFile | null = null;
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const rec = parsed as { headers?: unknown; sessionHeaders?: unknown };
      if (rec.headers !== null && typeof rec.headers === 'object' && !Array.isArray(rec.headers)) {
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(rec.headers as Record<string, unknown>)) {
          if (typeof v === 'string' && v.trim()) headers[k] = v.trim();
        }
        let sessionHeaders: Record<string, Record<string, string>> | null = null;
        if (rec.sessionHeaders !== null && typeof rec.sessionHeaders === 'object' && !Array.isArray(rec.sessionHeaders)) {
          sessionHeaders = {};
          for (const [sess, hdrs] of Object.entries(rec.sessionHeaders as Record<string, unknown>)) {
            if (hdrs !== null && typeof hdrs === 'object' && !Array.isArray(hdrs)) {
              const m: Record<string, string> = {};
              for (const [k2, v2] of Object.entries(hdrs as Record<string, unknown>)) {
                if (typeof v2 === 'string' && v2.trim()) m[k2] = v2.trim();
              }
              sessionHeaders[sess] = m;
            }
          }
        }
        data = { headers, sessionHeaders };
      }
    }
    fileCache = { mtimeMs: stat.mtimeMs, size: stat.size, data };
    return data;
  } catch {
    return fileCache?.data ?? null;
  }
}

export function readJwtFromRequestHeaders(reqHeadersPath: string, opts?: { fresh?: boolean }): string {
  const data = readRequestHeadersFile(reqHeadersPath, opts);
  if (!data) return '';
  return data.headers['X-Authorization'] ?? data.headers['x-authorization'] ?? '';
}

/** normalizeAutoClawRequestBodyModel: strip vendor prefix (zaicoding_ / zai_ / tdpsk_ ...) */
export function stripModelPrefix(id: string): string {
  return id.replace(/^[a-z]+_/, '');
}

export function deriveAgentIdFromSessionKey(sessionKey: string): string {
  const m = /^agent:([^:]+):/.exec(sessionKey);
  return m && m[1] ? m[1] : 'main';
}

export function normalizeClientType(v: string): '' | 'pc' | 'web' | 'app' {
  const t = v.trim().toLowerCase();
  if (t === 'desktop' || t === 'pc') return 'pc';
  if (t === 'web') return 'web';
  if (t === 'app' || t === 'mobile') return 'app';
  return '';
}

export function createSessionContext(
  originMode: OriginMode,
  agentIdEnv: string | undefined,
  sessionIdEnv: string | undefined,
  sessionKeyEnv: string | undefined,
): ContractContext {
  const sessionId = (sessionIdEnv ?? '').trim() || crypto.randomUUID();
  const agentId = (agentIdEnv ?? '').trim() || 'main';
  const sessionKey = (sessionKeyEnv ?? '').trim() || `agent:${agentId}:${sessionId.slice(0, 8)}`;
  return { sessionId, sessionKey, agentId, originMode };
}

export interface ContractHeaderInput {
  backendModel: string;
  context: ContractContext;
  reqHeadersPath: string;
  staticHeaders: Record<string, string>;
  sdkHeaders: Record<string, string>;
}

/**
 * buildAutoClawRequestHeaders + readAutoClawDynamicRequestHeaders + applyAutoClawOriginHeaders.
 * Order matters: static/SDK headers -> contract ids -> origin headers -> dynamic file -> client-type -> X-Product.
 */
export function buildContractHeaders(input: ContractHeaderInput): Record<string, string> {
  const ctx = input.context;
  const headers: Record<string, string> = {
    ...input.sdkHeaders,
    ...input.staticHeaders,
  };

  headers['X-Request-Id'] = crypto.randomUUID();
  headers['X-Request-Model'] = input.backendModel;
  headers['X-Session-Id'] = ctx.sessionId;
  headers['X-Agent-Id'] = ctx.agentId || deriveAgentIdFromSessionKey(ctx.sessionKey);
  headers['X-Session-Key'] = ctx.sessionKey;

  // applyAutoClawOriginHeaders (fallback source/channel derived from origin mode)
  if (ctx.originMode === 'desktop') {
    if (!headers['X-Autoclaw-Source']) headers['X-Autoclaw-Source'] = 'desktop';
    if (!headers['X-Autoclaw-Chat-Type']) headers['X-Autoclaw-Chat-Type'] = 'direct';
  } else if (ctx.originMode === 'web') {
    if (!headers['X-Autoclaw-Source']) headers['X-Autoclaw-Source'] = 'web';
    if (!headers['X-Autoclaw-Chat-Type']) headers['X-Autoclaw-Chat-Type'] = 'direct';
  } else {
    if (!headers['X-Autoclaw-Source']) headers['X-Autoclaw-Source'] = 'app';
    if (!headers['X-Autoclaw-Channel']) headers['X-Autoclaw-Channel'] = 'tencent_im';
  }
  if (!headers['X-Autoclaw-Session-Key']) headers['X-Autoclaw-Session-Key'] = ctx.sessionKey;
  if (!headers['X-Autoclaw-Agent-Id']) headers['X-Autoclaw-Agent-Id'] = headers['X-Agent-Id'];

  // dynamic headers from request-headers.json (highest priority, except forced ones below)
  const parsed = readRequestHeadersFile(input.reqHeadersPath);
  if (parsed !== null) {
    for (const [k, v] of Object.entries(parsed.headers)) headers[k] = v;
    const perSession = parsed.sessionHeaders?.[ctx.sessionKey] ?? parsed.sessionHeaders?.[ctx.sessionId];
    if (perSession) {
      for (const [k, v] of Object.entries(perSession)) headers[k] = v;
    }
  }

  // origin client-type wins (desktop -> pc / web -> web / app -> app)
  const ct = ctx.originMode === 'desktop' ? 'pc' : ctx.originMode === 'web' ? 'web' : 'app';
  headers['X-Client-Type'] = ct;

  headers['X-Product'] = 'autoclaw';
  return headers;
}

/**
 * rewriteAutoClawJsonRequestBody model part: payload.model = normalizeAutoClawRequestBodyModel(...).
 * Real client always sends the model WITHOUT the vendor prefix in the body.
 */
export function applyContractBodyRewrite<T extends Record<string, unknown>>(body: T, backendModel: string): T {
  const current = body['model'];
  const normalized =
    typeof current === 'string' && current.trim() ? stripModelPrefix(current.trim()) : stripModelPrefix(backendModel);
  if (current !== normalized) return { ...body, model: normalized } as T;
  return body;
}
