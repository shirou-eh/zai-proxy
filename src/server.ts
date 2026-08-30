import * as http from 'node:http';
import * as crypto from 'node:crypto';
import type { ProxyConfig } from './config.js';
import type { Logger } from './utils/logger.js';
import { getModelsList, getModelMapSnapshot } from './models.js';
import { handleOpenAIChat } from './handlers/openai.js';
import { handleAnthropicMessages } from './handlers/anthropic.js';
import { getJwtCacheInfo } from './auth.js';
import { invalidateRequestHeadersCache } from './contract.js';
import { ConcurrencyLimiter } from './concurrency.js';
import * as fs from 'node:fs';
import type { OpenAIChatRequest } from './types/openai.js';
import type { AnthropicMessagesRequest } from './types/anthropic.js';

/** Process-wide request stats for /health. */
export interface ProxyStats {
  totalRequests: number;
  openaiRequests: number;
  anthropicRequests: number;
  lastBackendStatus: number | null;
  lastBackendAt: number | null;
  startedAt: number;
}

export const proxyStats: ProxyStats = {
  totalRequests: 0,
  openaiRequests: 0,
  anthropicRequests: 0,
  lastBackendStatus: null,
  lastBackendAt: null,
  startedAt: Date.now(),
};

let sharedGate: ConcurrencyLimiter | null = null;
export function getBackendGate(config: ProxyConfig): ConcurrencyLimiter | null {
  if (config.backendMaxConcurrency <= 0) return null;
  if (sharedGate === null) sharedGate = new ConcurrencyLimiter(config.backendMaxConcurrency);
  return sharedGate;
}

function sendJson(res: http.ServerResponse, code: number, obj: unknown, corsOrigin: string): void {
  const b = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(b),
    'Access-Control-Allow-Origin': corsOrigin,
  });
  res.end(b);
}

function parseAuthHeader(req: http.IncomingMessage): string {
  const h = req.headers['authorization'];
  if (typeof h === 'string' && h.startsWith('Bearer ')) return h.slice(7).trim();
  if (Array.isArray(h)) {
    for (const v of h) if (typeof v === 'string' && v.startsWith('Bearer ')) return v.slice(7).trim();
  }
  const x = req.headers['x-api-key'];
  if (typeof x === 'string' && x.trim()) return x.trim();
  if (Array.isArray(x) && x[0] && typeof x[0] === 'string') return x[0].trim();
  // AutoClaw legacy
  const alt = req.headers['x-authorization'] as string | undefined;
  if (typeof alt === 'string' && alt.trim()) return alt.trim();
  // query ?api_key=***
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const q = url.searchParams.get('api_key') ?? url.searchParams.get('key');
    if (q) return q.trim();
  } catch {}
  return '';
}

function watchRequestHeaders(config: ProxyConfig): void {
  // The desktop app refreshes request-headers.json periodically; on any mtime/size
  // change, drop both caches so the next request re-reads the fresh JWT + headers.
  let lastSig = '';
  try {
    const st = fs.statSync(config.reqHeadersPath);
    lastSig = `${st.mtimeMs}:${st.size}`;
  } catch {}
  setInterval(() => {
    try {
      const st = fs.statSync(config.reqHeadersPath);
      const sig = `${st.mtimeMs}:${st.size}`;
      if (sig !== lastSig) {
        lastSig = sig;
        invalidateRequestHeadersCache();
      }
    } catch {}
  }, 2000).unref();
}

export function createServer(config: ProxyConfig, logger: Logger): http.Server {
  watchRequestHeaders(config);

  const server = http.createServer(async (req, res) => {
    const requestId = crypto.randomUUID();
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    res.setHeader('X-Request-Id', requestId);
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': config.corsAllowOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-Authorization, Anthropic-Version, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
      });
      res.end();
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', config.corsAllowOrigin);
    res.setHeader('Vary', 'Origin');

    // Optional API key guard (health & root — public)
    const isPublic =
      url.pathname === '/' ||
      url.pathname === '/health' ||
      url.pathname === '/v1/health' ||
      url.pathname === '/ping';
    if (config.proxyApiKey !== undefined && !isPublic) {
      const token = parseAuthHeader(req);
      if (token !== config.proxyApiKey) {
        logger.debug(requestId, `AUTH fail path=${url.pathname} ip=${req.socket.remoteAddress} tokenLen=${token.length}`);
        sendJson(
          res,
          401,
          { error: { message: 'invalid api key', type: 'authentication_error', code: 401 } },
          config.corsAllowOrigin,
        );
        return;
      }
    }

    logger.debug(requestId, `${req.method} ${url.pathname} ip=${req.socket.remoteAddress ?? 'unknown'}`);

    // --- Root ---
    if (url.pathname === '/' && req.method === 'GET') {
      return sendJson(
        res,
        200,
        {
          name: 'zai-proxy',
          version: '3.0.0',
          uptime: Math.floor(process.uptime()),
          endpoints: ['/health', '/v1/models', '/v1/chat/completions', '/v1/messages'],
          contract: 'autoclaw-request-contract-v1',
        },
        config.corsAllowOrigin,
      );
    }

    // --- Health ---
    if ((url.pathname === '/health' || url.pathname === '/v1/health' || url.pathname === '/ping') && req.method === 'GET') {
      const base: Record<string, unknown> = { status: 'ok', uptime: process.uptime(), version: '3.0.0' };
      if (config.enableHealthDetails) {
        base['model_map'] = getModelMapSnapshot();
        base['jwt_cache'] = getJwtCacheInfo();
        base['config'] = {
          backend: config.backendUrl,
          bodyLimit: config.bodyLimitBytes,
          timeoutMs: config.backendTimeoutMs,
          maxRetries: config.backendMaxRetries,
          logLevel: config.logLevel,
          auth: config.proxyApiKey ? 'enabled' : 'disabled',
          cors: config.corsAllowOrigin,
          forceUpstreamStream: config.forceUpstreamStream,
          originMode: config.originMode,
          agentId: config.agentId,
          sessionKey: config.sessionKey,
          maxConcurrency: config.backendMaxConcurrency,
          normalizeMaxTokens: config.normalizeMaxTokens,
        };
        base['stats'] = {
          totalRequests: proxyStats.totalRequests,
          openaiRequests: proxyStats.openaiRequests,
          anthropicRequests: proxyStats.anthropicRequests,
          lastBackendStatus: proxyStats.lastBackendStatus,
          lastBackendAt: proxyStats.lastBackendAt === null ? null : new Date(proxyStats.lastBackendAt).toISOString(),
          uptimeSeconds: Math.floor((Date.now() - proxyStats.startedAt) / 1000),
          concurrency: sharedGate === null
            ? { mode: 'unlimited' }
            : { mode: 'limited', max: config.backendMaxConcurrency, active: sharedGate.activeCount, queued: sharedGate.queuedCount },
        };
        base['jwt_cache'] = getJwtCacheInfo();
        base['memory'] = process.memoryUsage();
      }
      return sendJson(res, 200, base, config.corsAllowOrigin);
    }

    // --- Models ---
    if (url.pathname === '/v1/models' || url.pathname.endsWith('/v1/models')) {
      if (req.method !== 'GET') {
        return sendJson(res, 405, { error: { message: 'GET only', code: 405 } }, config.corsAllowOrigin);
      }
      return sendJson(res, 200, getModelsList(), config.corsAllowOrigin);
    }

    // --- Anthropic ---
    if (url.pathname.endsWith('/v1/messages')) {
      if (req.method !== 'POST') {
        return sendJson(
          res,
          405,
          { type: 'error', error: { type: 'invalid_request_error', message: 'POST only' } },
          config.corsAllowOrigin,
        );
      }
      proxyStats.totalRequests += 1;
      proxyStats.anthropicRequests += 1;
      const body = await readJsonBody(req, config.bodyLimitBytes, res, config.corsAllowOrigin);
      if (body === null) return;
      const gate = getBackendGate(config);
      return handleAnthropicMessages(body as AnthropicMessagesRequest, req, res, config, logger, requestId, gate ?? undefined);
    }

    // --- OpenAI ---
    if (url.pathname.endsWith('/v1/chat/completions') || url.pathname.endsWith('/chat/completions')) {
      if (req.method !== 'POST') {
        return sendJson(res, 405, { error: { message: 'POST only', code: 405 } }, config.corsAllowOrigin);
      }
      proxyStats.totalRequests += 1;
      proxyStats.openaiRequests += 1;
      const body = await readJsonBody(req, config.bodyLimitBytes, res, config.corsAllowOrigin);
      if (body === null) return;
      const openAIbody = body as OpenAIChatRequest;
      if (!openAIbody.model) openAIbody.model = 'auto';
      if (!openAIbody.messages) {
        return sendJson(res, 400, { error: { message: 'messages is required', code: 400 } }, config.corsAllowOrigin);
      }
      const gate = getBackendGate(config);
      return handleOpenAIChat(openAIbody, req, res, config, logger, requestId, gate ?? undefined);
    }

    // --- 404 ---
    sendJson(res, 404, { error: { message: 'not found', path: url.pathname, code: 404 } }, config.corsAllowOrigin);
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.requestTimeout = 0;
  server.timeout = 0;

  return server;
}

async function readJsonBody(
  req: http.IncomingMessage,
  limit: number,
  res: http.ServerResponse,
  corsOrigin: string,
): Promise<unknown | null> {
  let raw = '';
  let total = 0;
  let truncated = false;

  try {
    for await (const chunk of req) {
      const c = typeof chunk === 'string' ? chunk : (chunk as Buffer).toString('utf8');
      const len = Buffer.byteLength(c);
      total += len;
      if (total > limit) {
        truncated = true;
        // Drain rest
        req.destroy();
        break;
      }
      raw += c;
    }
  } catch {
    if (!res.writableEnded) sendJson(res, 400, { error: { message: 'failed to read body', code: 400 } }, corsOrigin);
    return null;
  }

  if (truncated) {
    if (!res.writableEnded) sendJson(res, 413, { error: { message: `payload too large, limit ${limit} bytes`, code: 413 } }, corsOrigin);
    return null;
  }

  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 200) : 'bad json';
    if (!res.writableEnded) sendJson(res, 400, { error: { message: `bad json: ${msg}`, code: 400 } }, corsOrigin);
    return null;
  }
}
