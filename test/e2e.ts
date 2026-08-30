/**
 * E2E contract test: starts the mock backend + zai-proxy, sends OpenAI (stream + non-stream)
 * and Anthropic (stream + non-stream) requests, verifies the AutoClaw request contract.
 *
 * Run: npm test   (or: npx tsx test/e2e.ts)
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { startMockBackend, getLastVerification, closeMockBackend, printVerification } from './mock-backend.js';

const MOCK_PORT = 18901;
const PROXY_PORT = 18902;
const FAKE_JWT = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.e2UtZmFrZS1zaWduYXR1cmU';

// prepare a request-headers.json the way AutoClaw writes it
const stateDir = path.join(os.homedir(), '.openclaw-autoclaw');
const reqHeadersPath = path.join(stateDir, 'request-headers.json');
let backup: string | null = null;
try {
  backup = fs.readFileSync(reqHeadersPath, 'utf8');
} catch {}
try {
  fs.mkdirSync(stateDir, { recursive: true });
} catch {}
fs.writeFileSync(reqHeadersPath, JSON.stringify({ headers: { 'X-Authorization': FAKE_JWT, 'X-Client-Type': 'pc' } }), 'utf8');

process.env['PORT'] = String(PROXY_PORT);
process.env['HOST'] = '127.0.0.1';
process.env['ZAI_BACKEND_URL'] = `http://127.0.0.1:${MOCK_PORT}/autoclaw-proxy/proxy/autoclaw/chat/completions`;
process.env['AUTOCLAW_REQ_HEADERS'] = reqHeadersPath;
process.env['ZAI_PROXY_API_KEY'] = 'autoclaw-mock-key-id.autoclaw-mock-secret';
process.env['LOG'] = 'info';
process.env['FORCE_UPSTREAM_STREAM'] = '1';
process.env['NORMALIZE_MAX_TOKENS'] = '1';
process.env['AUTOCLAW_ORIGIN'] = 'desktop';
process.env['AUTOCLAW_SESSION_ID'] = 'e2e-session-0000-1111';

async function main(): Promise<void> {
  await startMockBackend(MOCK_PORT);

  // import proxy AFTER env is set
  await import('../dist/index.js');
  await new Promise((r) => setTimeout(r, 600));

  const base = `http://127.0.0.1:${PROXY_PORT}`;
  const proxyKey = String(process.env['ZAI_PROXY_API_KEY'] ?? '');
  const auth = { Authorization: 'Bearer ' + proxyKey };

  // --- 1. OpenAI non-stream (upstream forced to stream, aggregated back) ---
  const r1 = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({
      model: 'glm-5.3',
      messages: [{ role: 'user', content: 'hi' }],
      stream: false,
      max_tokens: 100,
    }),
  });
  const j1 = (await r1.json()) as Record<string, unknown>;
  console.log('--- OpenAI non-stream:', r1.status, JSON.stringify(j1).slice(0, 200));

  // --- 2. OpenAI stream ---
  const r2 = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({
      model: 'glm-5.3',
      messages: [{ role: 'user', content: 'hi' }],
      stream: true,
      stream_options: { include_usage: true },
    }),
  });
  const s2 = await r2.text();
  console.log('--- OpenAI stream:', r2.status, 'chunks:', (s2.match(/data: /g) ?? []).length, 'hasDone:', s2.includes('[DONE]'));

  // --- 3. Anthropic non-stream with thinking enabled ---
  const r3 = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': proxyKey, ...auth },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 100,
      thinking: { type: 'enabled', budget_tokens: 1024 },
      messages: [{ role: 'user', content: 'hi' }],
    }),
  });
  const j3 = (await r3.json()) as Record<string, unknown>;
  console.log('--- Anthropic non-stream (thinking):', r3.status, JSON.stringify(j3).slice(0, 200));

  // --- 4. Anthropic stream ---
  const r4 = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 100,
      stream: true,
      messages: [{ role: 'user', content: 'hi' }],
    }),
  });
  const s4 = await r4.text();
  console.log(
    '--- Anthropic stream:',
    r4.status,
    'events:',
    (s4.match(/event: /g) ?? []).length,
    'message_stop:',
    s4.includes('message_stop'),
  );

  // --- verification (last request = anthropic stream, thinking default on) ---
  const v = getLastVerification();
  const { pass, fail, failures } = printVerification(v);
  console.log(`\n===== CONTRACT VERIFICATION: ${pass} passed, ${fail} failed =====`);
  if (failures.length > 0) {
    for (const f of failures) console.log('FAIL:', f);
    process.exitCode = 1;
  } else {
    console.log('All contract checks passed вЂ” requests are indistinguishable from the real AutoClaw client.');
  }

  await closeMockBackend();
  // restore original request-headers.json
  try {
    if (backup !== null) fs.writeFileSync(reqHeadersPath, backup, 'utf8');
  } catch {}
  setTimeout(() => process.exit(process.exitCode ?? 0), 200).unref();
}

main().catch((e) => {
  console.error('e2e failed:', e);
  try {
    if (backup !== null) fs.writeFileSync(reqHeadersPath, backup, 'utf8');
  } catch {}
  process.exit(1);
});
