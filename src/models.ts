/**
 * Model routing — maps client-facing model ids → backend model ids.
 * Совместимость 100% с оригиналом + Claude Code aliases.
 */

export const MODEL_MAP = {
  auto: 'zai_auto',
  'glm-5-turbo': 'zai_glm-5-turbo',
  'glm-5.3': 'zaicoding_glm-5.3',
  'glm-5.3-flash': 'zai_glm-5.3-flash',
  'glm-coding': 'zaicoding_glm-5.3',
  'zaicoding-glm-5.3': 'zaicoding_glm-5.3',
  'deepseek-v4-flash-202605': 'zai_auto',
} as const;

export type ClientModelId = keyof typeof MODEL_MAP;
export type BackendModelId = (typeof MODEL_MAP)[ClientModelId];

export const DEFAULT_BACKEND_MODEL: BackendModelId = 'zai_glm-5.3-flash';

/**
 * Claude aliases → за основу берём самый сильный glm (sonnet 4.5 / opus 4.1).
 * Покрывает Claude Code, Cline, Roo-Code и любые claude-* запросы.
 */
const CLAUDE_PATTERN = /^claude(?:-3)?(?:[-.]?(?:sonnet|opus|haiku))?(?:[-.]?(?:4|3\.5|3))?(?:[-.]?(?:5|1))?/i;

const EXTRA_CLAUDE_MODELS: readonly string[] = [
  'claude-sonnet-4-5',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5-20241022',
  'claude-opus-4-1',
  'claude-opus-4-1-20250805',
  'claude-opus-4-5',
  'claude-haiku-4-5',
  'claude-haiku-4-5-20251001',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
] as const;

/**
 * Allow runtime extension via env MODEL_MAP_JSON='{"my-model":"zai_custom"}'
 * (мержится поверх встроенного мапа, полезно для локальных форков).
 */
function getExtraModelMap(): Record<string, string> {
  const raw = process.env['MODEL_MAP_JSON'];
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof k === 'string' && typeof v === 'string' && k.trim() && v.trim()) out[k.trim()] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

export function resolveModel(raw: unknown): BackendModelId {
  let m = String(raw ?? '').trim();
  if (!m) return DEFAULT_BACKEND_MODEL;

  // Strip vendor prefixes accepted by original proxy
  if (m.startsWith('zai/')) m = m.slice(4);
  if (m.startsWith('autoclaw/')) m = m.slice(9);
  if (m.startsWith('anthropic/')) m = m.slice(10);
  if (m.startsWith('openai/')) m = m.slice(7);
  m = m.trim();
  if (!m) return DEFAULT_BACKEND_MODEL;

  // Dynamic map first (env override wins)
  const extra = getExtraModelMap();
  const dyn = extra[m] ?? extra[m.toLowerCase()];
  if (dyn) return dyn as BackendModelId;

  // Exact match (case-sensitive as in MODEL_MAP)
  const exact = (MODEL_MAP as Record<string, string>)[m];
  if (exact) return exact as BackendModelId;

  const lower = m.toLowerCase();

  // Exact lower-case fallback (e.g. GLM-5.3 → zaicoding_glm-5.3)
  for (const [k, v] of Object.entries(MODEL_MAP)) {
    if (k.toLowerCase() === lower) return v as BackendModelId;
  }
  for (const [k, v] of Object.entries(extra)) {
    if (k.toLowerCase() === lower) return v as BackendModelId;
  }

  // Claude family
  if (CLAUDE_PATTERN.test(m) || lower.startsWith('claude-')) return 'zaicoding_glm-5.3';

  // Heuristic: любые glm упоминания → соответствующий backend
  if (lower.includes('glm-5.3') || lower.includes('glm5.3') || lower.includes('glm-5')) {
    if (lower.includes('flash')) return 'zai_glm-5.3-flash';
    if (lower.includes('turbo')) return 'zai_glm-5-turbo';
    return 'zaicoding_glm-5.3';
  }
  if (lower.includes('glm-coding') || lower.includes('coding')) return 'zaicoding_glm-5.3';
  if (lower.includes('deepseek') || lower.includes('auto')) return 'zai_auto';

  return DEFAULT_BACKEND_MODEL;
}

export function getModelsList(): {
  object: 'list';
  data: Array<{ id: string; object: 'model'; created: number; owned_by: string }>;
} {
  const extra = getExtraModelMap();
  const ids = new Set<string>([
    ...Object.keys(MODEL_MAP),
    ...Object.keys(extra),
    ...EXTRA_CLAUDE_MODELS,
  ]);
  return {
    object: 'list',
    data: [...ids].sort((a, b) => a.localeCompare(b)).map((id) => ({ id, object: 'model', created: 0, owned_by: 'zai' })),
  };
}

/** For debugging / /health */
export function getModelMapSnapshot(): Record<string, string> {
  return { ...MODEL_MAP, ...getExtraModelMap() };
}
