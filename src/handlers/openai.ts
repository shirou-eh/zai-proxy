import * as crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ProxyConfig } from '../config.js';
import type { Logger } from '../utils/logger.js';
import { resolveModel } from '../models.js';
import { backendFetchWithRetry, type BackendFetchConfig, type BackendGate } from '../backend.js';
import { resolveZaiEnableThinking, applyZaiThinkingEnvelope, isReasoningCapableModel } from '../thinking.js';
import { backendStreamAndAggregate } from '../upstream.js';
import { sseEncode, sseDone } from '../utils/sse.js';
import type { OpenAIChatRequest, OpenAIChatChunk, OpenAIChatResponse } from '../types/openai.js';

function sendJson(res: ServerResponse, code: number, obj: unknown): void {
  const b = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(b),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(b);
}

function errorShape(message: string, code?: number | string | null, type?: string): object {
  return {
    error: {
      message,
      ...(type !== undefined ? { type } : {}),
      ...(code !== undefined && code !== null ? { code } : {}),
    },
  };
}

const ALLOWED_OPENAI_KEYS = new Set([
  'model',
  'messages',
  'stream',
  'stream_options',
  'temperature',
  'top_p',
  'top_k',
  'n',
  'max_tokens',
  'max_completion_tokens',
  'stop',
  'presence_penalty',
  'frequency_penalty',
  'logit_bias',
  'user',
  'tools',
  'tool_choice',
  'parallel_tool_calls',
  'response_format',
  'seed',
  'logprobs',
  'top_logprobs',
  'reasoning_effort',
]);

function normalizeOpenAIRequest(body: OpenAIChatRequest): OpenAIChatRequest {
  const backendModel = resolveModel(body.model);
  const filtered: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as unknown as Record<string, unknown>)) {
    if (ALLOWED_OPENAI_KEYS.has(k)) filtered[k] = v;
  }
  filtered['model'] = backendModel;
  if (!Array.isArray(filtered['messages'])) filtered['messages'] = body.messages;

  // Sanitize tools
  if (Array.isArray(filtered['tools'])) {
    filtered['tools'] = (filtered['tools'] as OpenAIChatRequest['tools'])!.map((t) => ({
      type: 'function',
      function: {
        name: t.function.name,
        ...(t.function.description !== undefined ? { description: t.function.description } : {}),
        ...(t.function.parameters !== undefined ? { parameters: t.function.parameters } : {}),
        ...(t.function.strict !== undefined ? { strict: t.function.strict } : {}),
      },
    }));
  }

  return filtered as unknown as OpenAIChatRequest;
}

function backendConfig(config: ProxyConfig): BackendFetchConfig {
  return {
    backendUrl: config.backendUrl,
    backendTimeoutMs: config.backendTimeoutMs,
    backendTimeoutSeconds: config.backendTimeoutSeconds,
    backendMaxRetries: config.backendMaxRetries,
    backendRetryBaseMs: config.backendRetryBaseMs,
    reqHeadersPath: config.reqHeadersPath,
    staticHeaders: config.staticHeaders,
    originMode: config.originMode,
    agentId: config.agentId,
    sessionId: config.sessionId,
    sessionKey: config.sessionKey,
    proxyApiKey: config.proxyApiKey,
    normalizeMaxTokens: config.normalizeMaxTokens,
    debugDumpRequest: config.debugDumpRequest,
    jwtRefreshWaitMs: config.jwtRefreshWaitMs,
    jwtRefreshPollMs: config.jwtRefreshPollMs,
  };
}

export function makeBackendGate(config: ProxyConfig): BackendGate | undefined {
  if (config.backendMaxConcurrency <= 0) return undefined;
  // Lazy require keeps the module dependency-free when unlimited.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ConcurrencyLimiter } = require('../concurrency.js') as typeof import('../concurrency.js');
  return new ConcurrencyLimiter(config.backendMaxConcurrency);
}

export async function handleOpenAIChat(
  body: OpenAIChatRequest,
  _req: IncomingMessage,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
  gateOverride?: BackendGate,
): Promise<void> {
  const clientRequestedStream = body.stream === true;
  const clientModel = String(body.model || 'auto');

  // Validation
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    sendJson(res, 400, errorShape('messages is required and must be non-empty array', 400, 'invalid_request_error'));
    return;
  }
  for (const m of body.messages) {
    if (!m.role || !['system', 'user', 'assistant', 'tool'].includes(m.role)) {
      sendJson(res, 400, errorShape(`invalid role: ${(m as { role?: unknown }).role}`, 400, 'invalid_request_error'));
      return;
    }
  }

  const normalized = normalizeOpenAIRequest(body);
  const backendModel = normalized.model;
  const includeUsage = Boolean(
    (body as unknown as { stream_options?: { include_usage?: boolean } }).stream_options?.include_usage,
  );

  const backendBody: Record<string, unknown> = { ...(normalized as unknown as Record<string, unknown>) };
  delete backendBody['stream_options'];

  // zai thinking envelope (real-client buildParams):
  // enable_thinking = Boolean(reasoningEffort), reasoning_effort never forwarded.
  const thinkingDecision = resolveZaiEnableThinking({ explicitEffort: backendBody['reasoning_effort'] });
  applyZaiThinkingEnvelope(backendBody, thinkingDecision, isReasoningCapableModel(backendModel));

  // Upstream is ALWAYS streamed (real-client behavior) unless disabled via FORCE_UPSTREAM_STREAM=0.
  if (config.forceUpstreamStream) delete backendBody['stream'];

  const gate = gateOverride ?? makeBackendGate(config);

  if (clientRequestedStream || config.forceUpstreamStream) {
    await handleOpenAIStream(
      backendBody,
      clientModel,
      backendModel,
      clientRequestedStream ? includeUsage : false,
      clientRequestedStream,
      res,
      config,
      logger,
      requestId,
      gate,
    );
  } else {
    await handleOpenAINonStream(backendBody, clientModel, backendModel, res, config, logger, requestId);
  }
}

async function handleOpenAIStream(
  backendBody: Record<string, unknown>,
  clientModel: string,
  backendModel: string,
  includeUsage: boolean,
  clientRequestedStream: boolean,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
  gate?: BackendGate,
): Promise<void> {
  logger.debug(requestId, `OPENAI STREAM start model=${backendModel} client=${clientModel} clientStream=${clientRequestedStream}`);

  // SSE headers are sent ONLY for real streaming clients. Aggregated (non-stream) clients
  // get a normal JSON response after the upstream stream is fully consumed.
  if (clientRequestedStream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': config.corsAllowOrigin,
      'X-Accel-Buffering': 'no',
    });
  }

  let done = false;
  let clientClosed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const onClose = (): void => {
    clientClosed = true;
    if (heartbeat !== undefined) clearInterval(heartbeat);
  };
  res.on('close', onClose);

  // Heartbeat every 15s keeps intermediaries from closing the idle connection
  if (clientRequestedStream) {
    heartbeat = setInterval(() => {
      if (!clientClosed) {
        try {
          res.write(': keepalive\n\n');
        } catch {}
      }
    }, 15_000);
  }

  try {
    const r = await backendFetchWithRetry(backendBody, backendModel, backendConfig(config), logger, requestId, gate);

    if (!r.ok) {
      const t = await r.text().catch(() => '');
      const msg = `backend ${r.status}: ${t.slice(0, 600)}`;
      logger.error(requestId, `OPENAI STREAM backend error ${r.status}`, msg.slice(0, 400));
      if (!clientClosed) {
        if (clientRequestedStream) {
          res.write(sseEncode({ error: { message: msg, code: r.status, type: 'backend_error' } }));
          res.end(sseDone());
        } else {
          sendJson(res, r.status, errorShape(msg, r.status, 'backend_error'));
        }
      }
      return;
    }

    if (!r.body) {
      if (!clientClosed) {
        const msg = 'backend returned no body';
        if (clientRequestedStream) {
          res.write(sseEncode({ error: { message: msg, code: 502 } }));
          res.end(sseDone());
        } else {
          sendJson(res, 502, errorShape(msg, 502, 'proxy_error'));
        }
      }
      return;
    }

    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let lastFinish: string | null = null;
    let aggregated: OpenAIChatResponse | null = null;

    // Aggregation state for non-stream clients (upstream is streamed anyway)
    let aggContent = '';
    const aggToolNames = new Map<number, string>();
    const aggToolArgs = new Map<number, string>();
    const aggToolIds = new Map<number, string>();
    let aggUsage: OpenAIChatResponse['usage'] | undefined;
    let aggId = `chatcmpl-${crypto.randomUUID()}`;
    let aggCreated = Math.floor(Date.now() / 1000);
    let aggBackendModel = backendModel;

    while (true) {
      const { value, done: d2 } = await reader.read();
      if (d2) break;
      if (clientClosed) {
        try {
          await reader.cancel();
        } catch {}
        break;
      }
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const raw of lines) {
        const line = raw.replace(/\r$/, '').trim();
        if (!line) continue;
        if (line.startsWith(':')) continue; // SSE comment
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') {
          done = true;
          continue;
        }
        let p: unknown;
        try {
          p = JSON.parse(payload);
        } catch {
          continue;
        }
        const chunk = p as OpenAIChatChunk & { error?: unknown };

        if ((chunk as { error?: unknown }).error !== undefined) {
          if (!clientClosed && clientRequestedStream) res.write(`data: ${JSON.stringify(p)}\n\n`);
          continue;
        }

        if (chunk.usage !== undefined && chunk.usage !== null) aggUsage = chunk.usage;
        if (typeof chunk.id === 'string' && chunk.id) aggId = chunk.id;
        if (typeof chunk.created === 'number') aggCreated = chunk.created;
        if (typeof chunk.model === 'string' && chunk.model) aggBackendModel = chunk.model;

        if (chunk.choices !== undefined) {
          for (const c of chunk.choices) {
            if (c.finish_reason) lastFinish = c.finish_reason as string;
            if (!clientRequestedStream && c.delta) {
              // aggregate
              const d = c.delta as { content?: unknown; tool_calls?: Array<{ index?: number; id?: string; function?: { name?: string; arguments?: string } }> };
              if (typeof d.content === 'string' && d.content) aggContent += d.content;
              if (Array.isArray(d.tool_calls)) {
                for (const tc of d.tool_calls) {
                  const idx = typeof tc.index === 'number' ? tc.index : aggToolNames.size;
                  if (tc.id) aggToolIds.set(idx, tc.id);
                  if (tc.function?.name) aggToolNames.set(idx, (aggToolNames.get(idx) ?? '') + tc.function.name);
                  if (tc.function?.arguments) aggToolArgs.set(idx, (aggToolArgs.get(idx) ?? '') + tc.function.arguments);
                }
              }
            }
          }

          if (clientRequestedStream) {
            const outChunk: OpenAIChatChunk = {
              id: chunk.id || `chatcmpl-${crypto.randomUUID()}`,
              object: 'chat.completion.chunk',
              created: chunk.created || Math.floor(Date.now() / 1000),
              model: clientModel || chunk.model || backendModel,
              choices: chunk.choices.map((c) => ({
                index: c.index ?? 0,
                delta: c.delta ?? {},
                ...(c.finish_reason !== undefined ? { finish_reason: c.finish_reason } : {}),
                ...(c.logprobs !== undefined ? { logprobs: c.logprobs } : {}),
              })),
              ...(chunk.usage && includeUsage ? { usage: chunk.usage } : {}),
              ...(chunk.system_fingerprint !== undefined ? { system_fingerprint: chunk.system_fingerprint } : {}),
            };
            if (!clientClosed) res.write(sseEncode(outChunk));
          }
        } else if (!clientRequestedStream && (chunk as unknown as { usage?: unknown }).usage) {
          aggUsage = (chunk as unknown as { usage: OpenAIChatResponse['usage'] }).usage;
        }
      }
    }

    if (clientRequestedStream) {
      if (!done && !clientClosed) {
        const finishReason = (lastFinish as OpenAIChatChunk['choices'][number]['finish_reason']) ?? 'stop';
        res.write(
          sseEncode({
            id: `chatcmpl-${crypto.randomUUID()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: clientModel,
            choices: [{ index: 0, delta: {}, finish_reason: finishReason }],
          }),
        );
      }
      if (!clientClosed) res.end(sseDone());
    } else {
      // Synthesize the non-stream response from the aggregated stream
      const message: OpenAIChatResponse['choices'][number]['message'] = { role: 'assistant', content: aggContent || null };
      const toolCalls = [...aggToolNames.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([idx, name]) => ({
          id: aggToolIds.get(idx) ?? `call_${idx}_${crypto.randomUUID().slice(0, 8)}`,
          type: 'function' as const,
          function: { name, arguments: aggToolArgs.get(idx) ?? '' },
        }));
      if (toolCalls.length > 0) message.tool_calls = toolCalls;
      aggregated = {
        id: aggId,
        object: 'chat.completion',
        created: aggCreated,
        model: clientModel || aggBackendModel,
        choices: [
          {
            index: 0,
            message,
            finish_reason: (lastFinish as OpenAIChatResponse['choices'][number]['finish_reason']) ?? (toolCalls.length > 0 ? 'tool_calls' : 'stop'),
          },
        ],
        ...(aggUsage !== undefined ? { usage: aggUsage } : {}),
      };
      if (!clientClosed) sendJson(res, 200, aggregated);
    }

    logger.debug(requestId, `OPENAI STREAM done backend=${backendModel} done=${done} clientStream=${clientRequestedStream}`);
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === 'AbortError';
    logger.error(requestId, `OPENAI STREAM error model=${backendModel} abort=${isAbort}`, String(e).slice(0, 500));
    if (!isAbort && !clientClosed) {
      try {
        if (clientRequestedStream) {
          res.write(sseEncode({ error: { message: String(e).slice(0, 500), code: 502, type: 'proxy_error' } }));
          res.end(sseDone());
        } else if (!res.headersSent) {
          sendJson(res, 502, errorShape(String(e).slice(0, 600), 502, 'proxy_error'));
        } else {
          res.end();
        }
      } catch {}
    } else if (!clientClosed) {
      try {
        if (clientRequestedStream) res.end(sseDone());
        else if (!res.headersSent) sendJson(res, 504, errorShape('backend timeout', 504, 'timeout'));
        else res.end();
      } catch {}
    }
  } finally {
    if (heartbeat !== undefined) clearInterval(heartbeat);
    res.off('close', onClose);
  }
}

async function handleOpenAINonStream(
  backendBody: Record<string, unknown>,
  clientModel: string,
  backendModel: string,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
): Promise<void> {
  // Only reached when FORCE_UPSTREAM_STREAM=0.
  try {
    const r = await backendFetchWithRetry(
      { ...backendBody, stream: false },
      backendModel,
      backendConfig(config),
      logger,
      requestId,
    );
    const t = await r.text().catch(() => '');
    if (!r.ok) {
      logger.error(requestId, `OPENAI NONSTREAM backend ${r.status}`, t.slice(0, 600));
      try {
        const j: unknown = JSON.parse(t);
        if (j !== null && typeof j === 'object' && 'error' in j) return sendJson(res, r.status, j);
      } catch {}
      return sendJson(res, r.status, errorShape(`backend ${r.status}: ${t.slice(0, 600)}`, r.status, 'backend_error'));
    }
    let p: unknown;
    try {
      p = JSON.parse(t);
    } catch {
      return sendJson(res, 502, errorShape('bad json from backend', 502, 'proxy_error'));
    }
    if (p !== null && typeof p === 'object' && 'model' in p) (p as OpenAIChatResponse).model = clientModel || (p as OpenAIChatResponse).model;
    sendJson(res, 200, p);
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === 'AbortError';
    logger.error(requestId, `OPENAI NONSTREAM error model=${backendModel} abort=${isAbort}`, String(e).slice(0, 600));
    if (isAbort) sendJson(res, 504, errorShape('backend timeout', 504, 'timeout'));
    else sendJson(res, 502, errorShape(String(e).slice(0, 600), 502, 'proxy_error'));
  }
}
