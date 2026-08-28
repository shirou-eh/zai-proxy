// Anthropic Messages API — полные типы, включают system как string|blocks, кеширование, thinking

export type AnthropicRole = 'user' | 'assistant';

export interface AnthropicCacheControl {
  type: 'ephemeral';
}

export interface AnthropicTextBlock {
  type: 'text';
  text: string;
  cache_control?: AnthropicCacheControl | undefined;
  citations?: unknown[] | undefined;
}

export interface AnthropicThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature?: string | undefined;
}

export interface AnthropicRedactedThinkingBlock {
  type: 'redacted_thinking';
  data: string;
}

export interface AnthropicImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: string; data: string } | { type: 'url'; url: string };
  cache_control?: AnthropicCacheControl | undefined;
}

export interface AnthropicDocumentBlock {
  type: 'document';
  source: { type: 'base64'; media_type: string; data: string } | { type: 'text'; media_type: string; data: string } | { type: 'url'; url: string };
  title?: string | undefined;
  context?: string | undefined;
  citations?: { enabled: boolean } | undefined;
  cache_control?: AnthropicCacheControl | undefined;
}

export interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
  cache_control?: AnthropicCacheControl | undefined;
}

export interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content?: string | Array<AnthropicTextBlock | AnthropicImageBlock | AnthropicDocumentBlock> | undefined;
  is_error?: boolean | undefined;
  cache_control?: AnthropicCacheControl | undefined;
}

export type AnthropicContentBlock =
  | AnthropicTextBlock
  | AnthropicThinkingBlock
  | AnthropicRedactedThinkingBlock
  | AnthropicImageBlock
  | AnthropicDocumentBlock
  | AnthropicToolUseBlock
  | AnthropicToolResultBlock;

export interface AnthropicMessage {
  role: AnthropicRole;
  content: string | AnthropicContentBlock[];
}

export interface AnthropicTool {
  name: string;
  description?: string | undefined;
  input_schema: Record<string, unknown>;
  cache_control?: AnthropicCacheControl | undefined;
}

export type AnthropicToolChoice =
  | { type: 'auto'; disable_parallel_tool_use?: boolean | undefined }
  | { type: 'any'; disable_parallel_tool_use?: boolean | undefined }
  | { type: 'tool'; name: string; disable_parallel_tool_use?: boolean | undefined }
  | { type: 'none' };

export interface AnthropicMessagesRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string | AnthropicTextBlock[] | undefined;
  max_tokens: number;
  temperature?: number | undefined;
  top_p?: number | undefined;
  top_k?: number | undefined;
  stop_sequences?: string[] | undefined;
  stream?: boolean | undefined;
  tools?: AnthropicTool[] | undefined;
  tool_choice?: AnthropicToolChoice | undefined;
  metadata?: { user_id?: string | undefined } | undefined;
  // extended
  thinking?: { type: 'enabled'; budget_tokens: number } | { type: 'disabled' } | undefined;
}

export interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null | undefined;
  cache_read_input_tokens?: number | null | undefined;
  reasoning_tokens?: number | undefined;
}

export interface AnthropicMessagesResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<AnthropicTextBlock | AnthropicToolUseBlock | AnthropicThinkingBlock | AnthropicRedactedThinkingBlock>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | null;
  stop_sequence?: string | null | undefined;
  usage: AnthropicUsage;
}

// Streaming events
export type AnthropicStreamEvent =
  | {
      type: 'message_start';
      message: AnthropicMessagesResponse & { stop_reason: null; stop_sequence: null; usage: AnthropicUsage };
    }
  | { type: 'content_block_start'; index: number; content_block: AnthropicTextBlock | AnthropicToolUseBlock | AnthropicThinkingBlock }
  | {
      type: 'content_block_delta';
      index: number;
      delta:
        | { type: 'text_delta'; text: string }
        | { type: 'input_json_delta'; partial_json: string }
        | { type: 'thinking_delta'; thinking: string }
        | { type: 'signature_delta'; signature: string };
    }
  | { type: 'content_block_stop'; index: number }
  | { type: 'message_delta'; delta: { stop_reason: AnthropicMessagesResponse['stop_reason']; stop_sequence: string | null }; usage: { output_tokens: number } }
  | { type: 'message_stop' }
  | { type: 'ping' }
  | { type: 'error'; error: { type: string; message: string } };

export interface AnthropicErrorBody {
  type: 'error';
  error: { type: string; message: string };
}
