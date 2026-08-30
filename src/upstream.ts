/**
 * Always-upstream-streaming for non-stream clients: the real AutoClaw client sends
 * stream:true on every request and parses the SSE stream. For clients that asked
 * for a non-stream response, we still go upstream with stream:true and aggregate
 * the chunk stream into a single chat.completion object
 * (delta fields hoisted to message fields, tool_calls reassembled, usage preserved).
 */
import * as crypto from 'node:crypto';
import type { Logger } from './utils/logger.js';
import { backendFetchWithRetry, type BackendFetchConfig, type BackendGate } from './backend.js';
import type { OpenAIChatChunk, OpenAIChatResponse } from './types/openai.js';

export interface StreamAggregateError extends Error {
  status?: number;
}

function aggregateError(message: string, status?: number): StreamAggregateError {
  const e = new Error(message) as StreamAggregateError;
  if (status !== undefined) e.status = status;
  return e;
}

/**
 * Perform the backend call with stream:true forced, consume the OpenAI SSE stream,
 * and aggregate it into an OpenAI chat.completion response object.
 */
export async function backendStreamAndAggregate(
  backendBody: Record<string, unknown>,
  backendModel: string,
  config: BackendFetchConfig,
  logger: Logger,
  requestId: string,
  gate?: BackendGate,
): Promise<OpenAIChatResponse> {
  const body: Record<string, unknown> = { ...backendBody, stream: true };
  // NOTE: the real client does NOT set stream_options for the zai provider —
  // include_usage injection only happens for minimax/moonshot base URLs.
  // Usage still arrives in the final chunk for zai.

  const r = await backendFetchWithRetry(body, backendModel, config, logger, requestId, gate);

  if (!r.ok || !r.body) {
    const t = await r.text().catch(() => '');
    throw aggregateError(`backend ${r.status}: ${t.slice(0, 600)}`, r.status);
  }

  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = '';

  let id = `chatcmpl-${crypto.randomUUID()}`;
  let created = Math.floor(Date.now() / 1000);
  let model = backendModel;
  let systemFingerprint: string | undefined;
  let finishReason: OpenAIChatResponse['choices'][number]['finish_reason'] = null;

  let content = '';
  let reasoning = '';
  const toolCallNamesByIndex = new Map<number, string>();
  const toolCallArgsByIndex = new Map<number, string>();
  const toolCallIdsByIndex = new Map<number, string>();
  let usage: OpenAIChatResponse['usage'] | undefined;

  const applyDelta = (delta: OpenAIChatChunk['choices'][number]['delta']): void => {
    if (!delta) return;
    if (typeof delta.content === 'string') content += delta.content;
    const rc = delta as { reasoning_content?: unknown; reasoning?: unknown };
    if (typeof rc.reasoning_content === 'string') reasoning += rc.reasoning_content;
    else if (typeof rc.reasoning === 'string') reasoning += rc.reasoning;
    if (Array.isArray(delta.tool_calls)) {
      for (const tc of delta.tool_calls) {
        const idx = typeof tc.index === 'number' ? tc.index : toolCallNamesByIndex.size;
        if (tc.id) toolCallIdsByIndex.set(idx, tc.id);
        if (tc.function?.name) toolCallNamesByIndex.set(idx, (toolCallNamesByIndex.get(idx) ?? '') + tc.function.name);
        if (tc.function?.arguments)
          toolCallArgsByIndex.set(idx, (toolCallArgsByIndex.get(idx) ?? '') + tc.function.arguments);
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.replace(/\r$/, '').trim();
      if (!line || line.startsWith(':') || !line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') continue;
      let p: unknown;
      try {
        p = JSON.parse(payload);
      } catch {
        continue;
      }
      if (p !== null && typeof p === 'object' && 'error' in p) {
        const msg = JSON.stringify(p).slice(0, 600);
        throw aggregateError(`backend stream error: ${msg}`, 502);
      }
      const chunk = p as OpenAIChatChunk;
      if (typeof chunk.id === 'string' && chunk.id) id = chunk.id;
      if (typeof chunk.created === 'number') created = chunk.created;
      if (typeof chunk.model === 'string' && chunk.model) model = chunk.model;
      if (typeof chunk.system_fingerprint === 'string') systemFingerprint = chunk.system_fingerprint;
      if (chunk.usage !== undefined && chunk.usage !== null) usage = chunk.usage;
      if (Array.isArray(chunk.choices)) {
        for (const c of chunk.choices) {
          if (c.delta) applyDelta(c.delta);
          if (c.finish_reason) finishReason = c.finish_reason;
        }
      }
    }
  }

  const toolCalls: OpenAIChatResponse['choices'][number]['message']['tool_calls'] = [];
  for (const [idx, nameAcc] of [...toolCallNamesByIndex.entries()].sort((a, b) => a[0] - b[0])) {
    toolCalls.push({
      id: toolCallIdsByIndex.get(idx) ?? `call_${idx}_${crypto.randomUUID().slice(0, 8)}`,
      type: 'function',
      function: { name: nameAcc, arguments: toolCallArgsByIndex.get(idx) ?? '' },
    });
  }

  const message: OpenAIChatResponse['choices'][number]['message'] = { role: 'assistant', content: content || null };
  if (reasoning) (message as { reasoning_content?: string }).reasoning_content = reasoning;
  if (toolCalls.length > 0) message.tool_calls = toolCalls;

  return {
    id,
    object: 'chat.completion',
    created,
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: finishReason ?? (toolCalls.length > 0 ? 'tool_calls' : 'stop'),
      },
    ],
    ...(usage !== undefined ? { usage } : {}),
    ...(systemFingerprint !== undefined ? { system_fingerprint: systemFingerprint } : {}),
  };
}
