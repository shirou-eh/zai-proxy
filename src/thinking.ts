/**
 * zai thinking envelope — mirrors the real client's buildParams() for
 * compat.thinkingFormat === "zai":
 *
 *   else if (compat.thinkingFormat === "zai" && model.reasoning)
 *     params.enable_thinking = Boolean(options?.reasoningEffort);
 *
 *  - The payload NEVER carries reasoning_effort for zai (detectCompat sets
 *    supportsReasoningEffort: false for zai).
 *  - enable_thinking is a plain boolean: true when the caller requested any
 *    reasoning effort except "off"/"none", otherwise false.
 *    (isOpenAICompletionsThinkingEnabled: off|none => disabled.)
 *  - When the caller did not request any effort at all the real client sends
 *    enable_thinking: false (Boolean(undefined) === false).
 *  - Applied only when the model is marked reasoning-capable (model.reasoning),
 *    matching the `&& model.reasoning` guard.
 *
 * ENV: ZAI_THINKING_DEFAULT ("on" | "off" | "auto", default "on") — when the
 * caller did not express any thinking preference at all (no thinking block, no
 * reasoning_effort), force the given mode. "auto" leaves the field absent
 * entirely (model decides).
 */

export type ThinkingDecision = 'enabled' | 'disabled' | 'absent';

const REASONING_OFF_VALUES = new Set(['off', 'none', 'disabled', 'false', '0']);

function requestedEffortToBool(raw: unknown): boolean {
  if (typeof raw !== 'string') return Boolean(raw);
  const normalized = raw.trim().toLowerCase();
  return !REASONING_OFF_VALUES.has(normalized);
}

/**
 * Decide enable_thinking from the incoming client request.
 *
 * @param explicitEffort  reasoning_effort from OpenAI-style requests (string | undefined)
 * @param thinkingRequested  true when the Anthropic request carried a thinking block
 *                           ({type:'enabled'} or {type:'disabled'})
 * @param thinkingEnabledValue  value of the Anthropic thinking.type when present
 */
export function resolveZaiEnableThinking(opts: {
  explicitEffort?: unknown;
  thinkingRequested?: boolean;
  thinkingEnabledValue?: boolean;
}): ThinkingDecision {
  const thinkingDefault = (process.env['ZAI_THINKING_DEFAULT'] ?? 'on').trim().toLowerCase();

  // Caller expressed an OpenAI-style reasoning_effort
  if (opts.explicitEffort !== undefined && opts.explicitEffort !== null && opts.explicitEffort !== '') {
    return requestedEffortToBool(opts.explicitEffort) ? 'enabled' : 'disabled';
  }
  // Caller expressed an Anthropic-style thinking block
  if (opts.thinkingRequested === true) {
    return opts.thinkingEnabledValue === true ? 'enabled' : 'disabled';
  }
  // No explicit preference: env default wins ("auto" = omit the field)
  if (thinkingDefault === 'auto') return 'absent';
  return thinkingDefault === 'off' ? 'disabled' : 'enabled';
}

/**
 * Apply the zai thinking envelope to an upstream body, mutating it in place.
 * Removes reasoning_effort (never sent for zai) and sets/strips enable_thinking.
 */
export function applyZaiThinkingEnvelope(
  body: Record<string, unknown>,
  decision: ThinkingDecision,
  modelReasoning: boolean,
): void {
  // reasoning_effort is never forwarded for zai
  delete body['reasoning_effort'];

  if (!modelReasoning || decision === 'absent') {
    delete body['enable_thinking'];
    return;
  }
  body['enable_thinking'] = decision === 'enabled';
}

/** All current AutoClaw zai models are reasoning: true (see openclaw.json providers.zai). */
export function isReasoningCapableModel(_backendModel: string): boolean {
  return true;
}
