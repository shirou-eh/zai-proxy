import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ProxyConfig } from '../config.js';
import type { Logger } from '../utils/logger.js';
import { backendFetchWithRetry } from '../backend.js';
import { sseDone } from '../utils/sse.js';
import { convertAnthropicRequestToOpenAI } from '../convert/anthropic-to-openai.js';
import { convertOpenAIResponseToAnthropic, OpenAIToAnthropicStreamConverter } from '../convert/openai-to-anthropic.js';
import type { AnthropicMessagesRequest } from '../types/anthropic.js';
import type { OpenAIChatChunk, OpenAIChatResponse } from '../types/openai.js';

function sendJson(res: ServerResponse, code: number, obj: unknown): void {
  const b = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(b),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(b);
}

function anthropicErrorShape(message: string, type = 'api_error'): object {
  return { type: 'error', error: { type, message } };
}

function openAIErrorToAnthropic(status: number, bodyText: string): object {
  let msg = bodyText.slice(0, 700);
  try {
    const j = JSON.parse(bodyText) as { error?: { message?: string; type?: string } };
    if (j.error?.message) msg = j.error.message;
  } catch {}
  let type = 'api_error';
  if (status === 400) type = 'invalid_request_error';
  else if (status === 401) type = 'authentication_error';
  else if (status === 403) type = 'permission_error';
  else if (status === 404) type = 'not_found_error';
  else if (status === 413) type = 'invalid_request_error';
  else if (status === 429) type = 'rate_limit_error';
  else if (status >= 500) type = 'api_error';
  return anthropicErrorShape(`backend ${status}: ${msg}`, type);
}

function validateAnthropicRequest(body: AnthropicMessagesRequest): string | null {
  if (!body.model || typeof body.model !== 'string') return 'model is required';
  if (!Array.isArray(body.messages)) return 'messages must be array';
  // max_tokens требуется, но ставим дефолт позже — не ошибка
  for (let i = 0; i < body.messages.length; i++) {
    const m = body.messages[i] as unknown as Record<string, unknown>;
    if (m === null || typeof m !== 'object') return `messages[${i}] must be object`;
    if (m['role'] !== 'user' && m['role'] !== 'assistant') return `messages[${i}].role must be user|assistant`;
    if (m['content'] === undefined || m['content'] === null) return `messages[${i}].content is required`;
  }
  if (body.tools !== undefined && !Array.isArray(body.tools)) return 'tools must be array';
  if (body.stop_sequences !== undefined && !Array.isArray(body.stop_sequences)) return 'stop_sequences must be array';
  return null;
}

export async function handleAnthropicMessages(
  body: AnthropicMessagesRequest,
  _req: IncomingMessage,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
): Promise<void> {
  const vErr = validateAnthropicRequest(body);
  if (vErr !== null) {
    sendJson(res, 400, anthropicErrorShape(vErr, 'invalid_request_error'));
    return;
  }

  if (body.max_tokens === undefined || body.max_tokens === null) {
    (body as unknown as Record<string, unknown>)['max_tokens'] = 4096;
  } else if (typeof body.max_tokens !== 'number' || body.max_tokens < 1) {
    sendJson(res, 400, anthropicErrorShape('max_tokens must be positive integer', 'invalid_request_error'));
    return;
  }

  const anthropicModel = String(body.model);

  let conv;
  try {
    conv = convertAnthropicRequestToOpenAI(body);
  } catch (e) {
    logger.error(requestId, 'ANTHROPIC convert error', String(e).slice(0, 600));
    sendJson(res, 400, anthropicErrorShape(String(e).slice(0, 600), 'invalid_request_error'));
    return;
  }

  const { openAIRequest, backendModel, stream } = conv;
  const backendBody: Record<string, unknown> = { ...openAIRequest } as unknown as Record<string, unknown>;
  delete backendBody['stream_options'];

  logger.debug(requestId, `ANTHROPIC ${stream ? 'STREAM' : 'NONSTREAM'} model=${anthropicModel} -> ${backendModel} msgs=${openAIRequest.messages.length}`);

  if (stream) await handleAnthropicStream(backendBody, anthropicModel, backendModel, res, config, logger, requestId);
  else await handleAnthropicNonStream(backendBody, anthropicModel, backendModel, res, config, logger, requestId);
}

async function handleAnthropicStream(
  backendBody: Record<string, unknown>,
  anthropicModel: string,
  backendModel: string,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
): Promise<void> {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': config.corsAllowOrigin,
    'X-Accel-Buffering': 'no',
  });

  let clientClosed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const onClose = (): void => {
    clientClosed = true;
    if (heartbeat !== undefined) clearInterval(heartbeat);
  };
  res.on('close', onClose);
  heartbeat = setInterval(() => {
    if (!clientClosed) try { res.write(': keepalive\n\n'); } catch {}
  }, 15_000);

  const converter = new OpenAIToAnthropicStreamConverter({ anthropicModel, openAIModel: anthropicModel });

  try {
    const r = await backendFetchWithRetry(backendBody, backendModel, config, logger, requestId);

    if (!r.ok) {
      const t = await r.text().catch(() => '');
      logger.error(requestId, `ANTHROPIC STREAM backend ${r.status}`, t.slice(0, 600));
      if (!clientClosed) {
        res.write(`event: error\ndata: ${JSON.stringify(openAIErrorToAnthropic(r.status, t))}\n\n`);
        res.end(sseDone());
      }
      return;
    }

    if (!r.body) {
      if (!clientClosed) {
        res.write(`event: error\ndata: ${JSON.stringify(anthropicErrorShape('backend returned no body'))}\n\n`);
        res.end(sseDone());
      }
      return;
    }

    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let done = false;

    while (true) {
      const { value, done: d2 } = await reader.read();
      if (d2) break;
      if (clientClosed) {
        try { await reader.cancel(); } catch {}
        break;
      }
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const raw of lines) {
        const line = raw.replace(/\r$/, '').trim();
        if (!line) continue;
        if (line.startsWith(':')) continue;
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
        // Пробрасываем бэкенд-ошибки как anthropic error
        if (p !== null && typeof p === 'object' && 'error' in p) {
          const msg = JSON.stringify(p).slice(0, 600);
          if (!clientClosed) res.write(`event: error\ndata: ${JSON.stringify(anthropicErrorShape(msg))}\n\n`);
          continue;
        }
        const chunk = p as OpenAIChatChunk;
        if (chunk.choices !== undefined || chunk.usage !== undefined) {
          const events = converter.pushChunk(chunk);
          for (const ev of events) if (!clientClosed) res.write(ev);
        }
      }
    }

    if (!done) logger.debug(requestId, 'ANTHROPIC STREAM backend finished without DONE, flushing');

    const finalEvents = converter.flush();
    for (const ev of finalEvents) if (!clientClosed) res.write(ev);
    if (!clientClosed) res.end();
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === 'AbortError';
    logger.error(requestId, `ANTHROPIC STREAM error abort=${isAbort}`, String(e).slice(0, 600));
    if (!clientClosed) {
      try {
        if (!isAbort) res.write(`event: error\ndata: ${JSON.stringify(anthropicErrorShape(String(e).slice(0, 600)))}\n\n`);
      } catch {}
      try { res.end(); } catch {}
    }
  } finally {
    if (heartbeat !== undefined) clearInterval(heartbeat);
    res.off('close', onClose);
  }
}

async function handleAnthropicNonStream(
  backendBody: Record<string, unknown>,
  anthropicModel: string,
  backendModel: string,
  res: ServerResponse,
  config: ProxyConfig,
  logger: Logger,
  requestId: string,
): Promise<void> {
  try {
    const r = await backendFetchWithRetry(backendBody, backendModel, config, logger, requestId);
    const t = await r.text().catch(() => '');
    if (!r.ok) {
      logger.error(requestId, `ANTHROPIC NONSTREAM backend ${r.status}`, t.slice(0, 700));
      return sendJson(res, r.status, openAIErrorToAnthropic(r.status, t));
    }
    let p: unknown;
    try {
      p = JSON.parse(t);
    } catch {
      return sendJson(res, 502, anthropicErrorShape('bad json from backend', 'api_error'));
    }
    const openAI = p as OpenAIChatResponse;
    if (!openAI.choices || !Array.isArray(openAI.choices) || openAI.choices.length === 0) {
      return sendJson(res, 502, anthropicErrorShape('invalid backend response: missing choices', 'api_error'));
    }
    try {
      const anth = convertOpenAIResponseToAnthropic(openAI, anthropicModel);
      sendJson(res, 200, anth);
    } catch (e) {
      logger.error(requestId, 'ANTHROPIC convert response error', String(e).slice(0, 600));
      sendJson(res, 500, anthropicErrorShape(String(e).slice(0, 600)));
    }
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === 'AbortError';
    logger.error(requestId, `ANTHROPIC NONSTREAM error abort=${isAbort}`, String(e).slice(0, 600));
    if (isAbort) sendJson(res, 504, anthropicErrorShape('backend timeout', 'api_error'));
    else sendJson(res, 502, anthropicErrorShape(String(e).slice(0, 600)));
  }
}
