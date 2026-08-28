import * as crypto from 'node:crypto';
import type {
  OpenAIChatResponse,
  OpenAIChatChunk,
  OpenAIUsage,
  OpenAIChatChoice,
  OpenAIMessage,
} from '../types/openai.js';
import type {
  AnthropicMessagesResponse,
  AnthropicStreamEvent,
  AnthropicTextBlock,
  AnthropicToolUseBlock,
  AnthropicThinkingBlock,
} from '../types/anthropic.js';

function mapFinishReasonToStopReason(
  fr: OpenAIChatChoice['finish_reason'],
): AnthropicMessagesResponse['stop_reason'] {
  if (fr === 'tool_calls' || fr === 'function_call') return 'tool_use';
  if (fr === 'length') return 'max_tokens';
  if (fr === 'stop' || fr === 'content_filter' || fr === null) return 'end_turn';
  return 'end_turn';
}

function mapChunkFinishToStopReason(
  fr: OpenAIChatChunk['choices'][number]['finish_reason'],
): AnthropicMessagesResponse['stop_reason'] {
  if (fr === 'tool_calls' || fr === 'function_call') return 'tool_use';
  if (fr === 'length') return 'max_tokens';
  if (fr === 'stop' || fr === 'content_filter') return 'end_turn';
  if (fr === null || fr === undefined) return 'end_turn';
  return 'end_turn';
}

function openAIUsageToAnthropic(u: OpenAIUsage | undefined): { input_tokens: number; output_tokens: number } {
  if (!u) return { input_tokens: 0, output_tokens: 0 };
  return { input_tokens: u.prompt_tokens, output_tokens: u.completion_tokens };
}

export function convertOpenAIResponseToAnthropic(
  openAI: OpenAIChatResponse,
  anthropicModel: string,
): AnthropicMessagesResponse {
  const choice = openAI.choices[0];
  const msg: OpenAIMessage | undefined = choice?.message;
  const content: Array<AnthropicTextBlock | AnthropicToolUseBlock | AnthropicThinkingBlock> = [];

  // Собираем текст: reasoning (thinking) + content
  let textContent = '';
  let thinkingContent = '';

  if (msg?.reasoning_content) thinkingContent += msg.reasoning_content;
  if (msg?.reasoning && msg.reasoning !== msg.reasoning_content) thinkingContent += (thinkingContent ? '\n\n' : '') + msg.reasoning;

  if (msg?.content !== null && msg?.content !== undefined) {
    if (typeof msg.content === 'string') textContent = msg.content;
    else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'text') textContent += part.text;
        else if (part.type === 'image_url') textContent += `![image](${part.image_url.url})\n`;
      }
    }
  }

  // thinking блок отдельно если есть
  if (thinkingContent) {
    content.push({ type: 'thinking', thinking: thinkingContent } as AnthropicThinkingBlock);
  }
  if (textContent) content.push({ type: 'text', text: textContent });

  if (msg?.tool_calls && msg.tool_calls.length > 0) {
    for (const tc of msg.tool_calls) {
      let input: Record<string, unknown> = {};
      const raw = tc.function.arguments || '{}';
      try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          input = parsed as Record<string, unknown>;
        } else if (raw.trim() && raw.trim() !== '{}') {
          // Non-object JSON (например строка) — оборачиваем
          input = { _raw: raw } as unknown as Record<string, unknown>;
        }
      } catch {
        // Невалидный JSON — передаем как есть через _raw чтобы не терять
        if (raw.trim()) input = { _raw: raw } as unknown as Record<string, unknown>;
      }
      content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input });
    }
  } else if (msg?.function_call) {
    let input: Record<string, unknown> = {};
    const raw = msg.function_call.arguments || '{}';
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) input = parsed as Record<string, unknown>;
    } catch {}
    content.push({
      type: 'tool_use',
      id: `call_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      name: msg.function_call.name,
      input,
    });
  }

  if (content.length === 0) content.push({ type: 'text', text: '' });

  const stop_reason = mapFinishReasonToStopReason(choice?.finish_reason ?? null);
  const usageAnth = openAIUsageToAnthropic(openAI.usage);

  return {
    id: `msg_${(openAI.id || crypto.randomUUID()).replace(/^chatcmpl-/, '').replace(/-/g, '').slice(0, 24)}`,
    type: 'message',
    role: 'assistant',
    content: content as AnthropicMessagesResponse['content'],
    model: anthropicModel,
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: usageAnth.input_tokens, output_tokens: usageAnth.output_tokens },
  };
}

// ------- Streaming converter -------------------------------------------------

export interface StreamConverterOptions {
  anthropicModel: string;
  openAIModel: string;
}

interface ToolCallState {
  anthropicIndex: number;
  id: string;
  name: string;
  argsBuffer: string;
  started: boolean;
  hasEmittedArgs: boolean;
}

export class OpenAIToAnthropicStreamConverter {
  private readonly anthropicModel: string;
  private readonly messageId: string;
  private textBlockIndex: number | null = null;
  private textStarted = false;
  private thinkingBlockIndex: number | null = null;
  private thinkingStarted = false;
  private nextBlockIndex = 0;
  private readonly toolStates: Map<number, ToolCallState> = new Map();
  private inputTokens = 0;
  private outputTokens = 0;
  private readonly closedBlocks = new Set<number>();
  private emittedMessageStart = false;
  private finishStopReason: AnthropicMessagesResponse['stop_reason'] | null = null;
  private stopSequence: string | null = null;

  constructor(opts: StreamConverterOptions) {
    this.anthropicModel = opts.anthropicModel;
    this.messageId = `msg_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
  }

  pushChunk(chunk: OpenAIChatChunk): string[] {
    const out: string[] = [];

    if (chunk.usage) {
      this.inputTokens = chunk.usage.prompt_tokens;
      this.outputTokens = chunk.usage.completion_tokens;
    }

    if (!this.emittedMessageStart) {
      this.emittedMessageStart = true;
      const msgStart: AnthropicStreamEvent = {
        type: 'message_start',
        message: {
          id: this.messageId,
          type: 'message',
          role: 'assistant',
          content: [],
          model: this.anthropicModel,
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: this.inputTokens, output_tokens: 0 },
        },
      };
      out.push(`event: message_start\ndata: ${JSON.stringify(msgStart)}\n\n`);
    }

    for (const choice of chunk.choices) {
      const delta = choice.delta;
      const finish = choice.finish_reason ?? null;

      // --- thinking / reasoning ---
      const thinkingDelta: string | undefined = (delta as unknown as { reasoning_content?: string; reasoning?: string }).reasoning_content ?? (delta as unknown as { reasoning?: string }).reasoning ?? undefined;
      if (thinkingDelta) {
        if (!this.thinkingStarted) {
          // Закрываем текст если был
          if (this.textStarted && this.textBlockIndex !== null && !this.closedBlocks.has(this.textBlockIndex)) {
            out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.textBlockIndex })}\n\n`);
            this.closedBlocks.add(this.textBlockIndex);
            this.textBlockIndex = null;
          }
          this.thinkingBlockIndex = this.nextBlockIndex++;
          this.thinkingStarted = true;
          out.push(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: this.thinkingBlockIndex,
              content_block: { type: 'thinking', thinking: '' },
            })}\n\n`,
          );
        }
        if (this.thinkingBlockIndex !== null) {
          out.push(
            `event: content_block_delta\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              index: this.thinkingBlockIndex,
              delta: { type: 'thinking_delta', thinking: thinkingDelta },
            })}\n\n`,
          );
        }
      }

      // --- text ---
      const textDelta: string | undefined = delta.content ?? undefined;
      if (textDelta) {
        // Если думалка активна — закрываем её перед текстом
        if (this.thinkingStarted && this.thinkingBlockIndex !== null && !this.closedBlocks.has(this.thinkingBlockIndex)) {
          out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.thinkingBlockIndex })}\n\n`);
          this.closedBlocks.add(this.thinkingBlockIndex);
          this.thinkingBlockIndex = null;
        }
        if (!this.textStarted) {
          this.textBlockIndex = this.nextBlockIndex++;
          this.textStarted = true;
          out.push(`event: content_block_start\ndata: ${JSON.stringify({ type: 'content_block_start', index: this.textBlockIndex, content_block: { type: 'text', text: '' } })}\n\n`);
        }
        // Если текст был закрыт тулзом ранее, открываем новый блок
        if (this.textBlockIndex === null) {
          this.textBlockIndex = this.nextBlockIndex++;
          // не ставим textStarted заново? он уже true, но открываем новый индекс
          out.push(`event: content_block_start\ndata: ${JSON.stringify({ type: 'content_block_start', index: this.textBlockIndex, content_block: { type: 'text', text: '' } })}\n\n`);
        }
        out.push(
          `event: content_block_delta\ndata: ${JSON.stringify({
            type: 'content_block_delta',
            index: this.textBlockIndex,
            delta: { type: 'text_delta', text: textDelta },
          })}\n\n`,
        );
      }

      // --- tool_calls ---
      if (delta.tool_calls && delta.tool_calls.length > 0) {
        for (const tc of delta.tool_calls) {
          const oaiIndex = tc.index;
          let state = this.toolStates.get(oaiIndex);
          const isNew = !state;

          if (isNew) {
            // Закрываем активные текстовые/мысленные блоки
            if (this.textStarted && this.textBlockIndex !== null && !this.closedBlocks.has(this.textBlockIndex)) {
              out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.textBlockIndex })}\n\n`);
              this.closedBlocks.add(this.textBlockIndex);
              this.textBlockIndex = null;
            }
            if (this.thinkingStarted && this.thinkingBlockIndex !== null && !this.closedBlocks.has(this.thinkingBlockIndex)) {
              out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.thinkingBlockIndex })}\n\n`);
              this.closedBlocks.add(this.thinkingBlockIndex);
              this.thinkingBlockIndex = null;
            }
            const anthIndex = this.nextBlockIndex++;
            state = {
              anthropicIndex: anthIndex,
              id: tc.id ?? `call_${anthIndex}_${Date.now()}`,
              name: tc.function?.name ?? '',
              argsBuffer: '',
              started: false,
              hasEmittedArgs: false,
            };
            this.toolStates.set(oaiIndex, state);
          }

          if (tc.id !== undefined && tc.id !== '') state!.id = tc.id;
          if (tc.function?.name !== undefined && tc.function.name !== '') state!.name = tc.function.name;

          // Старт блока когда известно имя
          if (!state!.started && state!.name) {
            state!.started = true;
            out.push(
              `event: content_block_start\ndata: ${JSON.stringify({
                type: 'content_block_start',
                index: state!.anthropicIndex,
                content_block: { type: 'tool_use', id: state!.id, name: state!.name, input: {} },
              })}\n\n`,
            );
            // Если до старта уже буферизовали аргументы — сразу эмитим
            if (state!.argsBuffer && !state!.hasEmittedArgs) {
              out.push(
                `event: content_block_delta\ndata: ${JSON.stringify({
                  type: 'content_block_delta',
                  index: state!.anthropicIndex,
                  delta: { type: 'input_json_delta', partial_json: state!.argsBuffer },
                })}\n\n`,
              );
              state!.hasEmittedArgs = true;
              state!.argsBuffer = '';
            }
          }

          if (tc.function?.arguments !== undefined && tc.function.arguments !== '') {
            const part = tc.function.arguments;
            if (state!.started) {
              out.push(
                `event: content_block_delta\ndata: ${JSON.stringify({
                  type: 'content_block_delta',
                  index: state!.anthropicIndex,
                  delta: { type: 'input_json_delta', partial_json: part },
                })}\n\n`,
              );
            } else {
              // Буферизуем до появления имени
              state!.argsBuffer += part;
            }
          }
        }
      }

      // --- legacy function_call ---
      const fc = (delta as unknown as { function_call?: { name?: string; arguments?: string } }).function_call;
      if (fc) {
        const oaiIndex = 0;
        let state = this.toolStates.get(oaiIndex);
        if (!state) {
          if (this.textStarted && this.textBlockIndex !== null && !this.closedBlocks.has(this.textBlockIndex)) {
            out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.textBlockIndex })}\n\n`);
            this.closedBlocks.add(this.textBlockIndex);
            this.textBlockIndex = null;
          }
          const anthIndex = this.nextBlockIndex++;
          state = {
            anthropicIndex: anthIndex,
            id: `call_${anthIndex}_${Date.now()}`,
            name: fc.name ?? '',
            argsBuffer: '',
            started: false,
            hasEmittedArgs: false,
          };
          this.toolStates.set(oaiIndex, state);
        }
        if (fc.name) state.name = fc.name;
        if (!state.started && state.name) {
          state.started = true;
          out.push(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: state.anthropicIndex,
              content_block: { type: 'tool_use', id: state.id, name: state.name, input: {} },
            })}\n\n`,
          );
        }
        if (fc.arguments) {
          if (state.started) {
            out.push(
              `event: content_block_delta\ndata: ${JSON.stringify({
                type: 'content_block_delta',
                index: state.anthropicIndex,
                delta: { type: 'input_json_delta', partial_json: fc.arguments },
              })}\n\n`,
            );
          } else {
            state.argsBuffer += fc.arguments;
          }
        }
      }

      if (finish !== null && finish !== undefined) {
        this.finishStopReason = mapChunkFinishToStopReason(finish);
      }
    }

    return out;
  }

  flush(): string[] {
    const out: string[] = [];

    if (!this.emittedMessageStart) {
      this.emittedMessageStart = true;
      out.push(
        `event: message_start\ndata: ${JSON.stringify({
          type: 'message_start',
          message: {
            id: this.messageId,
            type: 'message',
            role: 'assistant',
            content: [],
            model: this.anthropicModel,
            stop_reason: null,
            stop_sequence: null,
            usage: { input_tokens: this.inputTokens, output_tokens: this.outputTokens },
          },
        })}\n\n`,
      );
    }

    if (this.thinkingStarted && this.thinkingBlockIndex !== null && !this.closedBlocks.has(this.thinkingBlockIndex)) {
      out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.thinkingBlockIndex })}\n\n`);
      this.closedBlocks.add(this.thinkingBlockIndex);
    }
    if (this.textStarted && this.textBlockIndex !== null && !this.closedBlocks.has(this.textBlockIndex)) {
      out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: this.textBlockIndex })}\n\n`);
      this.closedBlocks.add(this.textBlockIndex);
    }

    const sortedTools = [...this.toolStates.values()].sort((a, b) => a.anthropicIndex - b.anthropicIndex);
    for (const st of sortedTools) {
      if (!st.started) {
        st.started = true;
        out.push(
          `event: content_block_start\ndata: ${JSON.stringify({
            type: 'content_block_start',
            index: st.anthropicIndex,
            content_block: { type: 'tool_use', id: st.id || `call_${st.anthropicIndex}`, name: st.name || 'unknown', input: {} },
          })}\n\n`,
        );
        if (st.argsBuffer) {
          out.push(
            `event: content_block_delta\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              index: st.anthropicIndex,
              delta: { type: 'input_json_delta', partial_json: st.argsBuffer },
            })}\n\n`,
          );
        }
      } else if (st.argsBuffer && !st.hasEmittedArgs) {
        // Остаток буфера который не был отослан
        out.push(
          `event: content_block_delta\ndata: ${JSON.stringify({
            type: 'content_block_delta',
            index: st.anthropicIndex,
            delta: { type: 'input_json_delta', partial_json: st.argsBuffer },
          })}\n\n`,
        );
      }
      if (!this.closedBlocks.has(st.anthropicIndex)) {
        out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: st.anthropicIndex })}\n\n`);
        this.closedBlocks.add(st.anthropicIndex);
      }
    }

    if (this.nextBlockIndex === 0) {
      out.push(`event: content_block_start\ndata: ${JSON.stringify({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })}\n\n`);
      out.push(`event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: 0 })}\n\n`);
      this.nextBlockIndex = 1;
    }

    const stopReason = this.finishStopReason ?? 'end_turn';
    out.push(
      `event: message_delta\ndata: ${JSON.stringify({
        type: 'message_delta',
        delta: { stop_reason: stopReason, stop_sequence: this.stopSequence },
        usage: { output_tokens: this.outputTokens || 0 },
      })}\n\n`,
    );
    out.push(`event: message_stop\ndata: ${JSON.stringify({ type: 'message_stop' })}\n\n`);
    return out;
  }

  ping(): string {
    return `event: ping\ndata: ${JSON.stringify({ type: 'ping' })}\n\n`;
  }
}
