import { resolveModel, type BackendModelId } from '../models.js';
import type { AnthropicMessagesRequest, AnthropicContentBlock, AnthropicTextBlock } from '../types/anthropic.js';
import type {
  OpenAIChatRequest,
  OpenAIMessage,
  OpenAITool,
  OpenAIToolChoice,
  OpenAIMessageContentPart,
} from '../types/openai.js';

// --- system -> text ---------------------------------------------------------

function anthropicSystemToText(system: AnthropicMessagesRequest['system']): string | undefined {
  if (system === undefined) return undefined;
  if (typeof system === 'string') {
    const t = system.trim();
    return t ? t : undefined;
  }
  const texts: string[] = [];
  for (const b of system as AnthropicTextBlock[]) {
    if (b.type === 'text' && b.text) texts.push(b.text);
    else if ((b as unknown as { type: string; text?: string }).type === 'text') {
      const t = (b as unknown as { text: string }).text;
      if (t) texts.push(t);
    }
  }
  const joined = texts.join('\n\n').trim();
  return joined ? joined : undefined;
}

// --- content helpers -------------------------------------------------------

function toOpenAIContent(
  content: string | AnthropicContentBlock[],
): string | OpenAIMessageContentPart[] {
  if (typeof content === 'string') return content;
  const hasNonText = content.some((b) => b.type !== 'text');
  if (!hasNonText) return (content as AnthropicTextBlock[]).map((b) => b.text).join('');
  const parts: OpenAIMessageContentPart[] = [];
  for (const b of content) {
    if (b.type === 'text') parts.push({ type: 'text', text: (b as AnthropicTextBlock).text });
    else if (b.type === 'image') {
      const src = (b as unknown as { source: { type: string; url?: string; media_type?: string; data?: string } }).source;
      if (src.type === 'url' && src.url) parts.push({ type: 'image_url', image_url: { url: src.url } });
      else if (src.type === 'base64' && src.data) {
        parts.push({ type: 'image_url', image_url: { url: `data:${src.media_type};base64,${src.data}` } });
      }
    } else if (b.type === 'document') {
      // Документы Anthropic → текст для OpenAI (с заголовком если есть)
      const doc = b as unknown as { title?: string; source: { type: string; data?: string; media_type?: string } };
      if (doc.title) parts.push({ type: 'text', text: `[Document: ${doc.title}]` });
      if (doc.source.type === 'text' && doc.source.data) parts.push({ type: 'text', text: doc.source.data });
    } else if (b.type === 'thinking' || b.type === 'redacted_thinking') {
      const th = b as unknown as { thinking?: string; data?: string };
      const txt = th.thinking ?? th.data ?? '';
      if (txt) parts.push({ type: 'text', text: `<thinking>${txt}</thinking>` });
    }
  }
  if (parts.length === 0) return '';
  if (parts.length === 1 && parts[0]?.type === 'text') return parts[0].text;
  return parts;
}

function convertAnthropicTools(tools: AnthropicMessagesRequest['tools']): OpenAITool[] | undefined {
  if (!tools || tools.length === 0) return undefined;
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      ...(t.description !== undefined ? { description: t.description } : {}),
      ...(t.input_schema !== undefined ? { parameters: t.input_schema } : {}),
    },
  }));
}

function convertAnthropicToolChoice(tc: AnthropicMessagesRequest['tool_choice']): OpenAIToolChoice | undefined {
  if (!tc) return undefined;
  if (tc.type === 'auto') return 'auto';
  if (tc.type === 'any') return 'required';
  if (tc.type === 'tool') return { type: 'function', function: { name: tc.name } };
  if (tc.type === 'none') return 'none';
  return undefined;
}

// --- main ------------------------------------------------------------------

export interface AnthropicToOpenAIResult {
  openAIRequest: OpenAIChatRequest;
  backendModel: BackendModelId;
  stream: boolean;
  includeUsage: boolean;
}

export function convertAnthropicRequestToOpenAI(
  anthReq: AnthropicMessagesRequest,
  explicitStream?: boolean,
): AnthropicToOpenAIResult {
  const stream = explicitStream ?? anthReq.stream ?? false;
  const backendModel = resolveModel(anthReq.model);
  const openAIMessages: OpenAIMessage[] = [];

  const sysText = anthropicSystemToText(anthReq.system);
  if (sysText !== undefined) openAIMessages.push({ role: 'system', content: sysText });

  for (const m of anthReq.messages) {
    const role = m.role;
    const rawContent = m.content;

    if (typeof rawContent === 'string') {
      openAIMessages.push({ role, content: rawContent });
      continue;
    }

    const blocks = rawContent as AnthropicContentBlock[];
    const toolResults: AnthropicContentBlock[] = [];
    const toolUses: AnthropicContentBlock[] = [];
    const textBlocks: AnthropicContentBlock[] = [];
    const imageBlocks: AnthropicContentBlock[] = [];
    const otherBlocks: AnthropicContentBlock[] = [];

    for (const b of blocks) {
      if (b.type === 'tool_result') toolResults.push(b);
      else if (b.type === 'tool_use') toolUses.push(b);
      else if (b.type === 'text') textBlocks.push(b);
      else if (b.type === 'image') imageBlocks.push(b);
      else otherBlocks.push(b);
    }

    if (role === 'assistant') {
      if (toolUses.length > 0) {
        // Текст + images → content, tool_use → tool_calls
        const textContent =
          textBlocks.length > 0 ? textBlocks.map((b) => (b as AnthropicTextBlock).text).join('') : null;

        // Собираем thinking/документы как префикс к контенту
        let thinkingPrefix = '';
        for (const o of otherBlocks) {
          if (o.type === 'thinking') thinkingPrefix += (o as unknown as { thinking: string }).thinking + '\n\n';
          else if (o.type === 'redacted_thinking') thinkingPrefix += '[redacted thinking]\n\n';
          else if (o.type === 'document') {
            const d = o as unknown as { title?: string; source: { data?: string } };
            if (d.title) thinkingPrefix += `[Document ${d.title}]\n`;
          }
        }
        const finalText = thinkingPrefix ? thinkingPrefix + (textContent ?? '') : textContent;

        const tool_calls = toolUses.map((b, idx) => {
          const tu = b as { id: string; name: string; input: Record<string, unknown> };
          let args = '{}';
          try {
            args = JSON.stringify(tu.input ?? {});
          } catch {
            args = '{}';
          }
          return {
            id: tu.id || `call_${idx}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'function' as const,
            function: { name: tu.name, arguments: args },
          };
        });

        let content: string | OpenAIMessageContentPart[] | null = finalText;
        if (imageBlocks.length > 0) {
          const parts: OpenAIMessageContentPart[] = [];
          if (finalText) parts.push({ type: 'text', text: finalText });
          for (const ib of imageBlocks) {
            const src = (ib as unknown as { source: { type: string; url?: string; media_type?: string; data?: string } }).source;
            if (src.type === 'url' && src.url) parts.push({ type: 'image_url', image_url: { url: src.url } });
            else if (src.type === 'base64' && src.data) {
              parts.push({ type: 'image_url', image_url: { url: `data:${src.media_type};base64,${src.data}` } });
            }
          }
          content = parts;
        }

        // Аннотация is_error из tool_result не относится к assistant — игнорируем
        openAIMessages.push({ role: 'assistant', content, tool_calls });
      } else {
        // Чистый текст/картинка/thinking без тулзов
        // Собираем всё в один OpenAI контент
        const combined: AnthropicContentBlock[] = [...textBlocks, ...imageBlocks, ...otherBlocks];
        if (combined.length === 0) {
          openAIMessages.push({ role: 'assistant', content: '' });
        } else {
          const openAIContent = toOpenAIContent(combined as AnthropicContentBlock[]);
          openAIMessages.push({ role: 'assistant', content: openAIContent as string });
        }
      }
    } else {
      // role === 'user' — tool_result становится отдельными tool-сообщениями
      for (const tr of toolResults) {
        const t = tr as { tool_use_id: string; content?: string | unknown[]; is_error?: boolean };
        let toolContent: string;
        if (typeof t.content === 'string') toolContent = t.content;
        else if (Array.isArray(t.content)) {
          const texts: string[] = [];
          for (const c of t.content as Array<{ type?: string; text?: string; source?: unknown }>) {
            if (c.type === 'text' && typeof c.text === 'string') texts.push(c.text);
            else if (typeof c.text === 'string') texts.push(c.text);
            else texts.push(JSON.stringify(c));
          }
          toolContent = texts.join('\n');
        } else if (t.content === undefined || t.content === null) {
          toolContent = t.is_error ? 'error' : '';
        } else {
          toolContent = JSON.stringify(t.content);
        }
        // Помечаем ошибку префиксом, чтобы модель понимала контекст
        if (t.is_error && toolContent && !toolContent.startsWith('Error:')) {
          // Не ломаем JSON-ответы, только plain text
          const isJson = toolContent.trim().startsWith('{') || toolContent.trim().startsWith('[');
          if (!isJson) toolContent = `Error: ${toolContent}`;
        }
        openAIMessages.push({ role: 'tool', tool_call_id: t.tool_use_id, content: toolContent });
      }

      const remainingBlocks = blocks.filter((b) => b.type !== 'tool_result' && b.type !== 'tool_use');
      if (remainingBlocks.length > 0) {
        const hasTextOrImage = remainingBlocks.some(
          (b) => b.type === 'text' || b.type === 'image' || b.type === 'document' || b.type === 'thinking',
        );
        if (hasTextOrImage) {
          const userContent = toOpenAIContent(remainingBlocks as AnthropicContentBlock[]);
          const isEmptyString = typeof userContent === 'string' && userContent.trim() === '';
          const isEmptyArray = Array.isArray(userContent) && userContent.length === 0;
          if (!isEmptyString && !isEmptyArray) {
            openAIMessages.push({ role: 'user', content: userContent as string });
          } else if (toolResults.length === 0) {
            openAIMessages.push({ role: 'user', content: '' });
          }
        }
      } else if (toolResults.length === 0) {
        openAIMessages.push({ role: 'user', content: '' });
      }
    }
  }

  const tools = convertAnthropicTools(anthReq.tools);
  const tool_choice = convertAnthropicToolChoice(anthReq.tool_choice);
  const stop =
    anthReq.stop_sequences && anthReq.stop_sequences.length > 0 ? anthReq.stop_sequences : undefined;
  const max_tokens = anthReq.max_tokens;

  const openAIRequest: OpenAIChatRequest = {
    model: backendModel,
    messages: openAIMessages,
    stream,
    ...(stream ? { stream_options: { include_usage: true } } : {}),
    ...(anthReq.temperature !== undefined ? { temperature: anthReq.temperature } : {}),
    ...(anthReq.top_p !== undefined ? { top_p: anthReq.top_p } : {}),
    ...(anthReq.top_k !== undefined ? { top_k: anthReq.top_k } : {}),
    ...(stop !== undefined ? { stop } : {}),
    ...(max_tokens !== undefined ? { max_tokens } : {}),
    ...(tools !== undefined ? { tools } : {}),
    ...(tool_choice !== undefined ? { tool_choice } : {}),
  };

  return { openAIRequest, backendModel, stream, includeUsage: stream };
}
