// OpenAI Chat Completions API — strict types, покрывают streaming + tools + reasoning

export type OpenAIRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OpenAITextContentPart {
  type: 'text';
  text: string;
}

export interface OpenAIImageUrlPart {
  type: 'image_url';
  image_url: { url: string; detail?: 'auto' | 'low' | 'high' | string | undefined };
}

export interface OpenAIInputAudioPart {
  type: 'input_audio';
  input_audio: { data: string; format: 'wav' | 'mp3' };
}

export type OpenAIMessageContentPart = OpenAITextContentPart | OpenAIImageUrlPart | OpenAIInputAudioPart;

export interface OpenAIToolCallFunction {
  name: string;
  arguments: string;
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: OpenAIToolCallFunction;
}

export interface OpenAIFunctionCall {
  name: string;
  arguments: string;
}

export interface OpenAIMessage {
  role: OpenAIRole;
  content: string | OpenAIMessageContentPart[] | null;
  name?: string | undefined;
  tool_calls?: OpenAIToolCall[] | undefined;
  tool_call_id?: string | undefined;
  function_call?: OpenAIFunctionCall | undefined;
  reasoning_content?: string | undefined;
  reasoning?: string | undefined;
}

export interface OpenAIToolFunctionDef {
  name: string;
  description?: string | undefined;
  parameters?: Record<string, unknown> | undefined;
  strict?: boolean | undefined;
}

export interface OpenAITool {
  type: 'function';
  function: OpenAIToolFunctionDef;
}

export type OpenAIToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'function'; function: { name: string } };

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  stream?: boolean | undefined;
  stream_options?: { include_usage?: boolean | undefined } | undefined;
  temperature?: number | undefined;
  top_p?: number | undefined;
  top_k?: number | undefined;
  n?: number | undefined;
  max_tokens?: number | undefined;
  max_completion_tokens?: number | undefined;
  stop?: string | string[] | null | undefined;
  presence_penalty?: number | undefined;
  frequency_penalty?: number | undefined;
  logit_bias?: Record<string, number> | undefined;
  user?: string | undefined;
  tools?: OpenAITool[] | undefined;
  tool_choice?: OpenAIToolChoice | undefined;
  parallel_tool_calls?: boolean | undefined;
  response_format?: { type: string; json_schema?: Record<string, unknown> | undefined } | undefined;
  seed?: number | undefined;
  logprobs?: boolean | undefined;
  top_logprobs?: number | undefined;
  reasoning_effort?: string | undefined;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: Record<string, unknown> | undefined;
  completion_tokens_details?: Record<string, unknown> | undefined;
}

export interface OpenAIChatChoice {
  index: number;
  message: OpenAIMessage & { role: 'assistant' };
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null;
  logprobs?: unknown | null | undefined;
}

export interface OpenAIChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: OpenAIChatChoice[];
  usage?: OpenAIUsage | undefined;
  system_fingerprint?: string | undefined;
}

export interface OpenAIChatChunkDelta {
  role?: OpenAIRole | undefined;
  content?: string | null | undefined;
  reasoning_content?: string | null | undefined;
  reasoning?: string | null | undefined;
  tool_calls?: Array<{
    index: number;
    id?: string | undefined;
    type?: 'function' | undefined;
    function?: { name?: string | undefined; arguments?: string | undefined } | undefined;
  }> | undefined;
  function_call?: { name?: string | undefined; arguments?: string | undefined } | undefined;
}

export interface OpenAIChatChunkChoice {
  index: number;
  delta: OpenAIChatChunkDelta;
  finish_reason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null | undefined;
  logprobs?: unknown | null | undefined;
}

export interface OpenAIChatChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: OpenAIChatChunkChoice[];
  usage?: OpenAIUsage | null | undefined;
  system_fingerprint?: string | undefined;
}

export interface OpenAIErrorBody {
  error: {
    message: string;
    type?: string | undefined;
    param?: string | null | undefined;
    code?: string | number | null | undefined;
  };
}

export interface OpenAIModelEntry {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface OpenAIModelList {
  object: 'list';
  data: OpenAIModelEntry[];
}
