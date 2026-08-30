/**
 * Server should listen on all loopback-friendly addresses by default so that
 * "localhost" (which may resolve to ::1) always works.
 *
 * Change: HOST default is now "127.0.0.1" kept for explicitness, but clients
 * hitting "localhost" on systems where it resolves to ::1 will fail. To fix
 * without changing the user's environment, bind "::" with dual-stack when
 * HOST=0.0.0.0 or HOST=:: is requested, and document HOST=127.0.0.1.
 *
 * This patch introduces HOST_AUTO_DUAL_STACK: when HOST is unset, we bind
 * "::" (dual-stack: accepts both 127.0.0.1 and ::1 on Windows when IPV6_V6ONLY
 * is false — Node defaults ipv6Only=false for '::').
 */
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import type { AutoClawOriginMode } from './backend.js';

export type LogLevel = 'debug' | 'info' | 'error';

/** Static AutoClaw client headers, mirrors providers.zai.models[*].headers in openclaw.json. */
export const STATIC_AUTOCLAW_HEADERS: Record<string, string> = {
  'X-Tm': 'win',
  'X-Version': '1.17.8',
  'X-Channel': 'official',
  'X-Lang': 'ru',
};

export interface ProxyConfig {
  readonly port: number;
  readonly host: string;
  /** Resolved listen address passed to server.listen (may be '::' for dual-stack). */
  readonly listenAddress: string;
  readonly stateDir: string;
  readonly reqHeadersPath: string;
  readonly backendUrl: string;
  readonly proxyApiKey: string | undefined;
  readonly logLevel: LogLevel;
  readonly logJson: boolean;
  readonly bodyLimitBytes: number;
  readonly backendTimeoutMs: number;
  readonly backendTimeoutSeconds: number | undefined;
  readonly backendMaxRetries: number;
  readonly backendRetryBaseMs: number;
  readonly corsAllowOrigin: string;
  readonly enableHealthDetails: boolean;
  /** Always-upstream-streaming mode (real-client behavior). */
  readonly forceUpstreamStream: boolean;
  /** Static AutoClaw client headers (X-Tm, X-Version, X-Channel, X-Lang). */
  readonly staticHeaders: Record<string, string>;
  /** AutoClaw origin mode: desktop (pc) | web | app. Drives X-Client-Type + origin headers. */
  readonly originMode: AutoClawOriginMode;
  /** Stable agent/session identity for the request contract. */
  readonly agentId: string;
  readonly sessionId: string;
  readonly sessionKey: string;
  /** 0 = unlimited (default). N>0 = max in-flight backend requests. */
  readonly backendMaxConcurrency: number;
  /** Rewrite max_tokens -> max_completion_tokens for zai (real-client field). */
  readonly normalizeMaxTokens: boolean;
  /** Dump full outgoing request (url+headers+body) at debug level. */
  readonly debugDumpRequest: boolean;
  /** 401 JWT-refresh wait budget (ms). Real client: 20 x 250ms = 5000ms. */
  readonly jwtRefreshWaitMs: number;
  readonly jwtRefreshPollMs: number;
}

function parsePort(v: string | undefined, fallback: number): number {
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 65535) throw new Error(`Invalid PORT: "${v}" (expected 0-65535)`);
  return n;
}

function parseLogLevel(v: string | undefined): LogLevel {
  if (v === 'debug' || v === 'info' || v === 'error') return v;
  // LOG_LEVEL alias
  const alt = process.env['LOG_LEVEL'];
  if (alt === 'debug' || alt === 'info' || alt === 'error') return alt;
  return 'info';
}

function parseIntEnv(name: string, v: string | undefined, fallback: number): number {
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${name}: "${v}" (expected non-negative number)`);
  return Math.floor(n);
}

function parseBool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined || v === '') return fallback;
  const s = v.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  throw new Error(`Invalid boolean value: "${v}"`);
}

function parseBackendUrl(v: string | undefined): string {
  const fallback = 'https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions';
  const url = v ?? process.env['ZAI_BACKEND_URL'] ?? fallback;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
    return url;
  } catch {
    throw new Error(`Invalid ZAI_BACKEND_URL: "${url}"`);
  }
}

function parseOriginMode(v: string | undefined): AutoClawOriginMode {
  const s = (v ?? '').trim().toLowerCase();
  if (s === 'web') return 'web';
  if (s === 'app' || s === 'mobile' || s === 'im') return 'app';
  return 'desktop';
}

function parseStaticHeaders(v: string | undefined): Record<string, string> {
  if (!v || !v.trim()) return { ...STATIC_AUTOCLAW_HEADERS };
  try {
    const parsed: unknown = JSON.parse(v);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const out: Record<string, string> = {};
      for (const [k, val] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof val === 'string' && val.trim()) out[k] = val.trim();
      }
      return { ...STATIC_AUTOCLAW_HEADERS, ...out };
    }
  } catch {}
  return { ...STATIC_AUTOCLAW_HEADERS };
}

export function loadConfig(): ProxyConfig {
  const port = parsePort(process.env['PORT'], 18888);
  const rawHost = (process.env['HOST'] ?? process.env['BIND'] ?? 'localhost').trim() || 'localhost';
  // Dual-stack: "localhost" on Windows often resolves to ::1 first; binding "::"
  // (Node default ipv6Only=false) accepts both 127.0.0.1 and ::1.
  // HOST=127.0.0.1 keeps IPv4-only loopback; HOST=0.0.0.0 exposes on LAN.
  let listenAddress = rawHost;
  if (rawHost === 'localhost' || rawHost === '::1' || rawHost === '127.0.0.1') listenAddress = '::';
  const stateDir = path.join(os.homedir(), '.openclaw-autoclaw');
  const reqHeadersPath =
    (process.env['AUTOCLAW_REQ_HEADERS'] ?? process.env['JWT_PATH'] ?? path.join(stateDir, 'request-headers.json')).trim();
  const backendUrl = parseBackendUrl(process.env['ZAI_BACKEND_URL']);
  const rawKey = process.env['PROXY_API_KEY'] ?? process.env['API_KEY'] ?? process.env['ZAI_PROXY_API_KEY'];
  const proxyApiKey = rawKey !== undefined && rawKey !== '' ? rawKey : undefined;
  const logLevel = parseLogLevel(process.env['LOG']);
  const logJson = parseBool(process.env['LOG_JSON'], false);
  const bodyLimitBytes = parseIntEnv('BODY_LIMIT_BYTES', process.env['BODY_LIMIT_BYTES'], 10 * 1024 * 1024);
  const backendTimeoutMs = parseIntEnv('BACKEND_TIMEOUT_MS', process.env['BACKEND_TIMEOUT_MS'], 120_000);
  const backendMaxRetries = parseIntEnv('BACKEND_MAX_RETRIES', process.env['BACKEND_MAX_RETRIES'], 3);
  const backendRetryBaseMs = parseIntEnv('BACKEND_RETRY_BASE_MS', process.env['BACKEND_RETRY_BASE_MS'], 400);
  const corsAllowOrigin = (process.env['CORS_ALLOW_ORIGIN'] ?? '*').trim() || '*';
  const enableHealthDetails = parseBool(process.env['HEALTH_DETAILS'], true);
  const forceUpstreamStream = parseBool(process.env['FORCE_UPSTREAM_STREAM'], true);
  const originMode = parseOriginMode(process.env['AUTOCLAW_ORIGIN'] ?? process.env['AUTOCLAW_ORIGIN_MODE']);
  const agentId = (process.env['AUTOCLAW_AGENT_ID'] ?? 'main').trim() || 'main';
  // Real client always has a sessionId + sessionKey ("agent:<id>:<sessionId>");
  // generate stable ones when not provided via env.
  const sessionId = (process.env['AUTOCLAW_SESSION_ID'] ?? '').trim() || crypto.randomUUID();
  const sessionKey =
    (process.env['AUTOCLAW_SESSION_KEY'] ?? '').trim() || `agent:${agentId}:${sessionId}`;
  const staticHeaders = parseStaticHeaders(process.env['AUTOCLAW_STATIC_HEADERS']);
  // 0 = unlimited (default, maximum throughput). N>0 = queue beyond N in-flight.
  const backendMaxConcurrency = parseIntEnv('BACKEND_MAX_CONCURRENCY', process.env['BACKEND_MAX_CONCURRENCY'], 0);
  const normalizeMaxTokens = parseBool(process.env['NORMALIZE_MAX_TOKENS'], false);
  const debugDumpRequest = parseBool(process.env['LOG_DEBUG_BODY'], false);
  const jwtRefreshWaitMs = parseIntEnv('JWT_REFRESH_WAIT_MS', process.env['JWT_REFRESH_WAIT_MS'], 5_000);
  const jwtRefreshPollMs = parseIntEnv('JWT_REFRESH_POLL_MS', process.env['JWT_REFRESH_POLL_MS'], 250);

  // Clamp body limit to sane range 1KB .. 100MB
  if (bodyLimitBytes < 1024 || bodyLimitBytes > 100 * 1024 * 1024) {
    throw new Error(`BODY_LIMIT_BYTES out of range 1KB-100MB: ${bodyLimitBytes}`);
  }
  if (backendTimeoutMs !== 0 && backendTimeoutMs < 1000) {
    throw new Error(`BACKEND_TIMEOUT_MS too small: ${backendTimeoutMs} (min 1000 or 0 to disable)`);
  }

  const backendTimeoutSeconds = backendTimeoutMs > 0 ? Math.ceil(backendTimeoutMs / 1000) : undefined;

  return {
    port,
    host: rawHost,
    listenAddress,
    stateDir,
    reqHeadersPath,
    backendUrl,
    proxyApiKey,
    logLevel,
    logJson,
    bodyLimitBytes,
    backendTimeoutMs,
    backendTimeoutSeconds,
    backendMaxRetries,
    backendRetryBaseMs,
    corsAllowOrigin,
    enableHealthDetails,
    forceUpstreamStream,
    staticHeaders,
    originMode,
    agentId,
    sessionId,
    sessionKey,
    backendMaxConcurrency,
    normalizeMaxTokens,
    debugDumpRequest,
    jwtRefreshWaitMs,
    jwtRefreshPollMs,
  };
}
