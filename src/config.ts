import * as path from 'node:path';
import * as os from 'node:os';

export type LogLevel = 'debug' | 'info' | 'error';

export interface ProxyConfig {
  readonly port: number;
  readonly host: string;
  readonly stateDir: string;
  readonly reqHeadersPath: string;
  readonly backendUrl: string;
  readonly proxyApiKey: string | undefined;
  readonly logLevel: LogLevel;
  readonly logJson: boolean;
  readonly bodyLimitBytes: number;
  readonly backendTimeoutMs: number;
  readonly backendMaxRetries: number;
  readonly backendRetryBaseMs: number;
  readonly corsAllowOrigin: string;
  readonly enableHealthDetails: boolean;
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

export function loadConfig(): ProxyConfig {
  const port = parsePort(process.env['PORT'], 18888);
  const host = (process.env['HOST'] ?? process.env['BIND'] ?? '127.0.0.1').trim() || '127.0.0.1';
  const stateDir = path.join(os.homedir(), '.openclaw-autoclaw');
  const reqHeadersPath =
    (process.env['AUTOCLAW_REQ_HEADERS'] ?? process.env['JWT_PATH'] ?? path.join(stateDir, 'request-headers.json')).trim();
  const backendUrl = parseBackendUrl(process.env['ZAI_BACKEND_URL']);
  const rawKey = process.env['PROXY_API_KEY'] ?? process.env['API_KEY'];
  const proxyApiKey = rawKey !== undefined && rawKey !== '' ? rawKey : undefined;
  const logLevel = parseLogLevel(process.env['LOG']);
  const logJson = parseBool(process.env['LOG_JSON'], false);
  const bodyLimitBytes = parseIntEnv('BODY_LIMIT_BYTES', process.env['BODY_LIMIT_BYTES'], 10 * 1024 * 1024);
  const backendTimeoutMs = parseIntEnv('BACKEND_TIMEOUT_MS', process.env['BACKEND_TIMEOUT_MS'], 120_000);
  const backendMaxRetries = parseIntEnv('BACKEND_MAX_RETRIES', process.env['BACKEND_MAX_RETRIES'], 3);
  const backendRetryBaseMs = parseIntEnv('BACKEND_RETRY_BASE_MS', process.env['BACKEND_RETRY_BASE_MS'], 400);
  const corsAllowOrigin = (process.env['CORS_ALLOW_ORIGIN'] ?? '*').trim() || '*';
  const enableHealthDetails = parseBool(process.env['HEALTH_DETAILS'], true);

  // Clamp body limit to sane range 1KB .. 100MB
  if (bodyLimitBytes < 1024 || bodyLimitBytes > 100 * 1024 * 1024) {
    throw new Error(`BODY_LIMIT_BYTES out of range 1KB-100MB: ${bodyLimitBytes}`);
  }
  if (backendTimeoutMs !== 0 && backendTimeoutMs < 1000) {
    throw new Error(`BACKEND_TIMEOUT_MS too small: ${backendTimeoutMs} (min 1000 or 0 to disable)`);
  }

  return {
    port,
    host,
    stateDir,
    reqHeadersPath,
    backendUrl,
    proxyApiKey,
    logLevel,
    logJson,
    bodyLimitBytes,
    backendTimeoutMs,
    backendMaxRetries,
    backendRetryBaseMs,
    corsAllowOrigin,
    enableHealthDetails,
  };
}
