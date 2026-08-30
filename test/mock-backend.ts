/**
 * Mock AutoClaw backend for contract verification.
 *
 * Verifies that zai-proxy sends requests indistinguishable from the real AutoClaw
 * desktop client:
 *  - URL: POST /autoclaw-proxy/proxy/autoclaw/chat/completions
 *  - Contract headers: X-Request-Id/X-Session-Id/X-Agent-Id/X-Session-Key/X-Client-Type/
 *    X-Product/X-Tm/X-Version/X-Channel/X-Lang/X-Autoclaw-* + X-Authorization/Authorization
 *  - OpenAI SDK transport headers (User-Agent "OpenAI/JS 6.39.1", X-Stainless-*)
 *  - Body: model WITHOUT vendor prefix, stream:true always, no stream_options for zai,
 *    enable_thinking envelope (never reasoning_effort)
 *
 * Responds with an OpenAI-compatible SSE stream (stream:true always upstream).
 */
import * as http from 'node:http';

interface Verification {
  checks: Array<{ name: string; ok: boolean; got: string; want: string }>;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

const state: { lastVerification: Verification | null; requestCount: number } = {
  lastVerification: null,
  requestCount: 0,
};

function check(v: Verification, name: string, got: unknown, want: string | RegExp): boolean {
  const gotStr = got === undefined || got === null ? '<missing>' : String(got);
  const ok = typeof want === 'string' ? gotStr === want : want.test(gotStr);
  v.checks.push({ name, ok, got: gotStr, want: String(want) });
  return ok;
}

const REQUIRED_CONTRACT_HEADERS: Array<[string, string | RegExp]> = [
  ['x-request-id', /^[0-9a-f-]{36}$/i],
  ['x-request-model', /^(zai_auto|zaicoding_glm-5\.3|zai_glm-5\.3-flash|zai_glm-5-turbo|tdpsk_[a-z0-9.-]+)$/],
  ['x-session-id', /.+/],
  ['x-agent-id', /.+/],
  ['x-session-key', /^agent:.+/],
  ['x-client-type', /^(pc|web|app)$/],
  ['x-product', 'autoclaw'],
  ['x-harness-type', 'zcode'],
  ['x-tm', 'win'],
  ['x-version', '1.17.8'],
  ['x-channel', 'official'],
  ['x-lang', 'ru'],
  ['x-autoclaw-source', /^(desktop|web|app)$/],
  ['x-autoclaw-session-key', /^agent:.+/],
  ['x-autoclaw-agent-id', /.+/],
  ['x-authorization', /^Bearer eyJ/],
  ['authorization', /^Bearer .+/],
  ['user-agent', /^OpenAI\/JS 6\.39\.1$/],
  ['x-stainless-lang', 'js'],
  ['x-stainless-package-version', '6.39.1'],
  ['x-stainless-os', process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'Windows' : 'Linux'] as string,
  ['x-stainless-arch', 'x64'],
  ['x-stainless-runtime', 'node'],
  ['x-stainless-runtime-version', /^v\d+\.\d+\.\d+$/],
  ['x-stainless-retry-count', /^\d+$/],
  ['accept', 'application/json'],
  ['content-type', 'application/json'],
];

const server = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c: Buffer) => (raw += c.toString('utf8')));
  req.on('end', () => {
    state.requestCount += 1;

    const v: Verification = { checks: [], headers: {}, body: {} };
    try {
      v.body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      v.body = { _parseError: raw.slice(0, 200) };
    }

    // --- contract checks ---
    const flatHeaders: Record<string, string> = {};
    for (const [k, val] of Object.entries(req.headers as Record<string, string | string[] | undefined>)) {
      flatHeaders[k.toLowerCase()] = Array.isArray(val) ? val.join(',') : String(val ?? '');
    }
    v.headers = flatHeaders;

    for (const [name, want] of REQUIRED_CONTRACT_HEADERS) {
      check(v, `header:${name}`, flatHeaders[name] ?? '<missing>', want);
    }

    // origin headers depend on AUTOCLAW_ORIGIN (default desktop -> no channel header)
    const source = flatHeaders['x-autoclaw-source'];
    if (source === 'desktop' || source === 'web') {
      check(v, 'header:x-autoclaw-chat-type', flatHeaders['x-autoclaw-chat-type'], 'direct');
    } else {
      check(v, 'header:x-autoclaw-channel', flatHeaders['x-autoclaw-channel'], 'tencent_im');
    }

    // --- body checks ---
    const body = v.body as Record<string, unknown>;
    check(v, 'body:model (no vendor prefix)', body['model'], 'glm-5.3');
    check(v, 'body:stream', body['stream'], 'true');
    check(v, 'body:messages array', Array.isArray(body['messages']) ? 'array' : '<not-array>', 'array');
    const so = body['stream_options'] as { include_usage?: unknown } | undefined;
    check(v, 'body:no stream_options (zai contract)', so === undefined ? 'absent' : String(JSON.stringify(so)), 'absent');
    // thinking envelope: enable_thinking boolean present, reasoning_effort never sent
    check(v, 'body:no reasoning_effort', body['reasoning_effort'] === undefined ? 'undefined' : String(body['reasoning_effort']), 'undefined');
    check(
      v,
      'body:enable_thinking boolean',
      typeof body['enable_thinking'] === 'boolean' ? 'boolean' : ('<' + typeof body['enable_thinking'] + '>'),
      'boolean',
    );
    // max_tokens normalization: real client sends max_completion_tokens for zai
    if (body['max_completion_tokens'] !== undefined || body['max_tokens'] !== undefined) {
      check(v, 'body:max_completion_tokens (normalized)', typeof body['max_completion_tokens'] === 'number' ? 'number' : '<missing>', 'number');
      check(v, 'body:no max_tokens (normalized)', body['max_tokens'] === undefined ? 'undefined' : String(body['max_tokens']), 'undefined');
    }

    state.lastVerification = v;

    // --- respond with an OpenAI-style SSE stream (always) ---
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    const chunkId = 'chatcmpl-mock-' + state.requestCount;
    const base = { id: chunkId, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model: 'glm-5.3' };
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: { role: 'assistant', content: '' } }] })}\n\n`);
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: { content: 'Hello' } }] })}\n\n`);
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: { content: ' from mock backend' } }] })}\n\n`);
    res.write(
      `data: ${JSON.stringify({
        ...base,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
        usage: { prompt_tokens: 5, completion_tokens: 4, total_tokens: 9 },
      })}\n\n`,
    );
    res.write('data: [DONE]\n\n');
    res.end();
  });
});

export function startMockBackend(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });
}

export function getLastVerification(): Verification | null {
  return state.lastVerification;
}

export function closeMockBackend(): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

export function printVerification(v: Verification | null): { pass: number; fail: number; failures: string[] } {
  if (!v) return { pass: 0, fail: 1, failures: ['no request reached mock backend'] };
  const pass = v.checks.filter((c) => c.ok).length;
  const failures = v.checks.filter((c) => !c.ok).map((c) => `${c.name}: got="${c.got}" want="${c.want}"`);
  return { pass, fail: v.checks.length - pass, failures };
}
