<div align="center">

<!-- HERO BANNER -->
<svg width="100%" height="420" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="heroTitle heroDesc">
  <title id="heroTitle">zai-proxy — высокопроизводительный прокси для z.ai и AutoClaw</title>
  <desc id="heroDesc">OpenAI и Anthropic совместимый шлюз на TypeScript с нулевыми зависимостями и потоковым SSE</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="45%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="gradText" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="35%" stop-color="#60a5fa"/>
      <stop offset="70%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="gradBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <radialGradient id="glow1" cx="25%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="78%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow3" cx="90%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
    <filter id="blur1">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <rect width="1200" height="420" rx="24" fill="url(#bg)"/>
  <rect width="1200" height="420" rx="24" fill="url(#grid)"/>
  <rect width="1200" height="420" rx="24" fill="url(#glow1)"/>
  <rect width="1200" height="420" rx="24" fill="url(#glow2)"/>
  <rect width="1200" height="420" rx="24" fill="url(#glow3)"/>

  <circle cx="180" cy="100" r="90" fill="#7c3aed" opacity="0.07" filter="url(#blur1)"/>
  <circle cx="1050" cy="320" r="110" fill="#06b6d4" opacity="0.06" filter="url(#blur1)"/>
  <circle cx="900" cy="80" r="60" fill="#ec4899" opacity="0.05" filter="url(#blur1)"/>

  <!-- top bar -->
  <g transform="translate(36,24)">
    <rect width="1128" height="46" rx="12" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.08"/>
    <g transform="translate(14,8)">
      <rect width="30" height="30" rx="8" fill="url(#gradBtn)"/>
      <text x="15" y="20.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="0.5">ZP</text>
    </g>
    <text x="52" y="27" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#ffffff" letter-spacing="2.5">ZAI-PROXY</text>
    <text x="152" y="27" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#ffffff" opacity="0.45">High-Performance AI Gateway</text>
    <g transform="translate(860,10)">
      <rect width="72" height="26" rx="13" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-opacity="0.3"/>
      <circle cx="14" cy="13" r="5" fill="#10b981"/>
      <circle cx="14" cy="13" r="8" fill="#10b981" opacity="0.25"/>
      <text x="38" y="17" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#10b981">ONLINE</text>
    </g>
    <g transform="translate(944,10)">
      <rect width="84" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12"/>
      <text x="42" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#ffffff">v2.1.0</text>
    </g>
    <g transform="translate(1040,10)">
      <rect width="74" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.12"/>
      <text x="37" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#ffffff">MIT</text>
    </g>
  </g>

  <!-- left content -->
  <g transform="translate(52,88)">
    <rect width="340" height="28" rx="14" fill="#7c3aed" fill-opacity="0.12" stroke="#7c3aed" stroke-opacity="0.22"/>
    <circle cx="14" cy="14" r="4" fill="#a78bfa"/>
    <text x="24" y="18" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#a78bfa" letter-spacing="1.2">OPENAI  •  ANTHROPIC  •  CLAUDE CODE</text>

    <text x="0" y="62" font-family="Inter, system-ui, sans-serif" font-size="54" font-weight="900" fill="url(#gradText)" letter-spacing="-2.5">zai-proxy</text>
    <text x="0" y="100" font-family="Inter, system-ui, sans-serif" font-size="16.5" font-weight="500" fill="#ffffff" opacity="0.92">Высокопроизводительный прокси для <tspan fill="#a78bfa" font-weight="800">z.ai</tspan>  и  <tspan fill="#60a5fa" font-weight="800">AutoClaw</tspan></text>
    <text x="0" y="124" font-family="Inter, system-ui, sans-serif" font-size="13.5" fill="#ffffff" opacity="0.55">TypeScript • Ноль зависимостей • Потоковый SSE • Поддержка tool_use</text>

    <g transform="translate(0,152)">
      <rect width="138" height="56" rx="14" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.08"/>
      <text x="18" y="22" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#ffffff" opacity="0.5" letter-spacing="0.8">ЗАДЕРЖКА</text>
      <text x="18" y="44" font-family="JetBrains Mono, monospace" font-size="17" font-weight="800" fill="#34d399">&lt; 15 мс</text>
      <text x="88" y="44" font-family="Inter, sans-serif" font-size="10" fill="#ffffff" opacity="0.35">оверхед</text>
    </g>
    <g transform="translate(150,152)">
      <rect width="138" height="56" rx="14" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.08"/>
      <text x="18" y="22" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#ffffff" opacity="0.5" letter-spacing="0.8">МОДЕЛИ</text>
      <text x="18" y="44" font-family="JetBrains Mono, monospace" font-size="17" font-weight="800" fill="#60a5fa">20+</text>
      <text x="62" y="44" font-family="Inter, sans-serif" font-size="10" fill="#ffffff" opacity="0.35">роутинг</text>
    </g>
    <g transform="translate(300,152)">
      <rect width="138" height="56" rx="14" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.08"/>
      <text x="18" y="22" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#ffffff" opacity="0.5" letter-spacing="0.8">ЗАВИСИМОСТИ</text>
      <text x="18" y="44" font-family="JetBrains Mono, monospace" font-size="17" font-weight="800" fill="#f472b6">0</text>
      <text x="36" y="44" font-family="Inter, sans-serif" font-size="10" fill="#ffffff" opacity="0.35">runtime</text>
    </g>

    <g transform="translate(0,228)">
      <rect width="184" height="44" rx="12" fill="url(#gradBtn)"/>
      <text x="92" y="28" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="0.3">Быстрый старт</text>
    </g>
    <g transform="translate(196,228)">
      <rect width="164" height="44" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.14"/>
      <rect width="164" height="44" rx="12" fill="#ffffff" fill-opacity="0.06"/>
      <text x="82" y="28" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#ffffff">npm run dev</text>
    </g>
  </g>

  <!-- right terminal -->
  <g transform="translate(620,88)">
    <rect width="528" height="284" rx="18" fill="#0b0f1e" stroke="#ffffff" stroke-opacity="0.08"/>
    <rect width="528" height="38" rx="18" fill="#151a2e"/>
    <rect y="28" width="528" height="10" fill="#151a2e"/>
    <circle cx="20" cy="19" r="5.5" fill="#ef4444" opacity="0.9"/>
    <circle cx="38" cy="19" r="5.5" fill="#f59e0b" opacity="0.9"/>
    <circle cx="56" cy="19" r="5.5" fill="#10b981" opacity="0.9"/>
    <text x="84" y="23" font-family="JetBrains Mono, monospace" font-size="10" fill="#ffffff" opacity="0.35">~/zai-proxy — node</text>
    <text x="468" y="23" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981" opacity="0.7">:18888</text>

    <g font-family="JetBrains Mono, monospace" font-size="11.5">
      <text x="22" y="64" fill="#64748b">$ <tspan fill="#e2e8f0">curl http://localhost:18888/v1/chat/completions \</tspan></text>
      <text x="22" y="84" fill="#a78bfa">  -H "Authorization: Bearer sk-..." \</text>
      <text x="22" y="104" fill="#60a5fa">  -d '{"model":"claude-sonnet-4-5","messages":[...]}'</text>
      <text x="22" y="132" fill="#334155">────────────────────────────────────────</text>
      <text x="22" y="152" fill="#34d399">200 OK  •  stream: text/event-stream</text>
      <text x="22" y="172" fill="#e2e8f0">data: {"choices":[{"delta":{"content":"Привет!"}}]}</text>
      <text x="22" y="192" fill="#e2e8f0">data: {"choices":[{"delta":{"tool_calls":[...]}}]}</text>
      <text x="22" y="212" fill="#94a3b8">data: [DONE]</text>
      <text x="22" y="238" fill="#64748b">- <tspan fill="#f472b6">Anthropic</tspan> <tspan fill="#64748b">тоже работает:</tspan> <tspan fill="#60a5fa">POST /v1/messages</tspan></text>
      <text x="22" y="258" fill="#64748b">- <tspan fill="#34d399">SSE heartbeat</tspan> каждые 15с • <tspan fill="#a78bfa">авто-ретраи</tspan> • <tspan fill="#f59e0b">JWT кэш</tspan></text>
    </g>
  </g>
</svg>

<p>
  <a href="#быстрый-старт"><img src="https://img.shields.io/badge/Node-%3E%3D18.18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="node"/></a>&nbsp;
  <a href="#конфигурация"><img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="ts"/></a>&nbsp;
  <a href="#лицензия"><img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="mit"/></a>&nbsp;
  <img src="https://img.shields.io/badge/Zero_Runtime_Deps-0-7c3aed?style=for-the-badge" alt="zero deps"/>&nbsp;
  <img src="https://img.shields.io/badge/SSE_Streaming-OK-06b6d4?style=for-the-badge" alt="sse"/>
</p>

<sub>Совместим с <b>OpenAI SDK</b> • <b>Anthropic SDK</b> • <b>Claude Code</b> • <b>Cline</b> • <b>Roo Code</b> • Любым инструментом с поддержкой <code>claude-*</code></sub>

</div>

<br/>

<div align="center">

| [Что это](#что-это) | [Возможности](#возможности) | [Архитектура](#архитектура) | [Быстрый старт](#быстрый-старт) | [Конфигурация](#конфигурация) | [Модели](#модели) | [API](#api) | [Примеры](#примеры) |
|---|---|---|---|---|---|---|---|

</div>

---

## Что это

> **zai-proxy** — лёгкий, молниеносный шлюз, который притворяется одновременно **OpenAI** и **Anthropic**, а под капотом — **z.ai / AutoClaw** (`autoglm-api.autoglm.ai`).  
> Подключаешь любой клиент — он думает, что говорит с `api.openai.com` или `api.anthropic.com`, а отвечает настоящий **GLM-5.3 / GLM-Coding**.

<table>
<tr>
<td width="50%" valign="top">

**Зачем нужен**

- Использовать `Claude Code`, `Cursor`, `Continue`, `OpenAI SDK` с бэкендом z.ai без переписывания кода
- Единая точка входа для всех моделей — один порт, один ключ
- Потоковый `tool_use` без костылей — SSE в SSE, честный прокси
- Ноль рантайм-зависимостей — чистый `node:http` и нативный `fetch`

**Ключевые цифры**

- Старт менее 200 мс, оверхед менее 15 мс
- Около 5 МБ на диске, потребление памяти от 45 МБ
- Keep-Alive 65 с, heartbeat 15 с, graceful shutdown 10 с

</td>
<td width="50%" valign="top">

**Схема запроса**

```
Клиент (OpenAI / Anthropic / Claude Code)
        |
        |  POST /v1/chat/completions
        |  POST /v1/messages
        v
   zai-proxy :18888
   ├─ server.ts (CORS, Auth, лимиты)
   ├─ models.ts (роутинг)
   ├─ handlers + convert
   └─ backend.ts (retry, timeout, SSE)
        |
        |  X-Authorization: JWT
        v
   autoglm-api.autoglm.ai
   └─ GLM-5.3 / Turbo / Flash / Auto
```

</td>
</tr>
</table>

---

<div align="center">

<!-- FEATURES BANNER -->
<svg width="100%" height="420" viewBox="0 0 1160 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="featTitle">
  <title id="featTitle">Возможности zai-proxy</title>
  <defs>
    <linearGradient id="fbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="ic1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <linearGradient id="ic2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <linearGradient id="ic3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <linearGradient id="ic4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <linearGradient id="ic5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
    <linearGradient id="ic6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="1160" height="420" rx="20" fill="url(#fbg)" stroke="#ffffff" stroke-opacity="0.06"/>
  <text x="580" y="36" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" letter-spacing="3" opacity="0.9">ВОЗМОЖНОСТИ</text>
  <text x="580" y="56" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#ffffff" opacity="0.38">Все, что нужно для продакшена — уже внутри</text>

  <!-- row 1 -->
  <g transform="translate(18,72)">
    <g>
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic1)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#ffffff">API</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Двойной API</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#a78bfa" font-weight="600">OpenAI + Anthropic</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">POST /v1/chat/completions</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">POST /v1/messages — полная</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">совместимость с Claude Code</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#7c3aed" opacity="0.35"/>
    </g>
    <g transform="translate(384,0)">
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic2)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#ffffff">SSE</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Честный SSE</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#06b6d4" font-weight="600">Стриминг без буферизации</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">Проброс чанков один в один, heartbeat</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">каждые 15 секунд, tool_calls</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">и reasoning в реальном времени</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#06b6d4" opacity="0.35"/>
    </g>
    <g transform="translate(768,0)">
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic3)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ffffff">MAP</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Умный роутинг</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#ec4899" font-weight="600">20+ моделей, алиасы</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">claude-sonnet-4-5 → zaicoding_glm-5.3</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">авто-маппинг GLM / DeepSeek / Auto</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">плюс MODEL_MAP_JSON для кастома</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#ec4899" opacity="0.35"/>
    </g>
  </g>

  <!-- row 2 -->
  <g transform="translate(18,240)">
    <g>
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic4)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ffffff">RET</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Надежность</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#f59e0b" font-weight="600">Ретраи, таймауты, кэш JWT</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">Экспоненциальный backoff и jitter,</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">Retry-After, mtime-кэш для</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">request-headers.json (до 50 мс)</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#f59e0b" opacity="0.35"/>
    </g>
    <g transform="translate(384,0)">
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic5)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ffffff">0 DEPS</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Ноль зависимостей</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#10b981" font-weight="600">Только Node.js 18+</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">Чистый node:http, нативный fetch,</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">около 5 МБ на диске, старт до 200 мс</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">идеален для Docker и bare metal</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#10b981" opacity="0.35"/>
    </g>
    <g transform="translate(768,0)">
      <rect width="368" height="152" rx="16" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.07"/>
      <g transform="translate(16,16)">
        <rect width="42" height="42" rx="12" fill="url(#ic6)"/>
        <text x="21" y="27" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ffffff">LOG</text>
      </g>
      <text x="70" y="32" font-family="Inter, sans-serif" font-size="13.5" font-weight="800" fill="#ffffff">Наблюдаемость</text>
      <text x="70" y="48" font-family="Inter, sans-serif" font-size="11" fill="#6366f1" font-weight="600">Health, логи, метрики</text>
      <text x="16" y="82" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">/health с деталями, структурированные</text>
      <text x="16" y="100" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">логи (JSON и текст), X-Request-Id,</text>
      <text x="16" y="118" font-family="Inter, sans-serif" font-size="12" fill="#ffffff" opacity="0.72">graceful shutdown 10 секунд</text>
      <rect x="16" y="130" width="84" height="6" rx="3" fill="#6366f1" opacity="0.35"/>
    </g>
  </g>
</svg>

</div>

<a id="возможности"></a>

---

## Архитектура

<div align="center">

<svg width="100%" height="300" viewBox="0 0 1160 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="archTitle">
  <title id="archTitle">Архитектура zai-proxy</title>
  <defs>
    <linearGradient id="abg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="aCard" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa"/>
    </marker>
  </defs>
  <rect width="1160" height="300" rx="20" fill="url(#abg)" stroke="#ffffff" stroke-opacity="0.06"/>

  <g transform="translate(24,24)">
    <rect width="190" height="252" rx="16" fill="url(#aCard)" stroke="#ffffff" stroke-opacity="0.07"/>
    <text x="95" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#ffffff" letter-spacing="1.8" opacity="0.9">КЛИЕНТЫ</text>
    <g transform="translate(14,36)">
      <rect width="162" height="42" rx="10" fill="#7c3aed" fill-opacity="0.14" stroke="#7c3aed" stroke-opacity="0.25"/>
      <text x="18" y="17" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#a78bfa">CC</text><text x="42" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">Claude Code</text><text x="42" y="30" font-family="JetBrains Mono, monospace" font-size="9" fill="#a78bfa">claude-sonnet-4-5</text>
    </g>
    <g transform="translate(14,86)">
      <rect width="162" height="42" rx="10" fill="#06b6d4" fill-opacity="0.12" stroke="#06b6d4" stroke-opacity="0.22"/>
      <text x="18" y="17" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#06b6d4">OA</text><text x="42" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">OpenAI SDK</text><text x="42" y="30" font-family="JetBrains Mono, monospace" font-size="9" fill="#06b6d4">/v1/chat/completions</text>
    </g>
    <g transform="translate(14,136)">
      <rect width="162" height="42" rx="10" fill="#ec4899" fill-opacity="0.12" stroke="#ec4899" stroke-opacity="0.22"/>
      <text x="18" y="17" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ec4899">AN</text><text x="42" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">Anthropic SDK</text><text x="42" y="30" font-family="JetBrains Mono, monospace" font-size="9" fill="#ec4899">/v1/messages</text>
    </g>
    <g transform="translate(14,186)">
      <rect width="162" height="42" rx="10" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.09"/>
      <text x="18" y="17" font-family="JetBrains Mono, monospace" font-size="9" font-weight="800" fill="#ffffff" opacity="0.7">HT</text><text x="42" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">Любой HTTP</text><text x="42" y="30" font-family="JetBrains Mono, monospace" font-size="9" fill="#ffffff" opacity="0.5">curl / fetch / etc</text>
    </g>
  </g>

  <g transform="translate(214,0)">
    <line x1="10" y1="150" x2="64" y2="150" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arr2)" opacity="0.9"/>
    <rect x="12" y="118" width="48" height="18" rx="9" fill="#1e1b4b" stroke="#a78bfa" stroke-opacity="0.35"/>
    <text x="36" y="130" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="800" fill="#a78bfa">HTTP</text>
  </g>

  <g transform="translate(288,24)">
    <rect width="300" height="252" rx="16" fill="#0b0f1e" stroke="#7c3aed" stroke-opacity="0.28"/>
    <rect width="300" height="36" rx="16" fill="#7c3aed" fill-opacity="0.16"/>
    <rect y="26" width="300" height="10" fill="#7c3aed" fill-opacity="0.16"/>
    <text x="150" y="22" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#a78bfa" letter-spacing="1.6">ZAI-PROXY :18888</text>
    <g font-family="JetBrains Mono, monospace" font-size="9.5" font-weight="700">
      <g transform="translate(14,52)"><rect width="132" height="42" rx="10" fill="#7c3aed" fill-opacity="0.13" stroke="#7c3aed" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">server.ts</text><text x="66" y="30" text-anchor="middle" fill="#a78bfa" font-size="8.5">CORS, Auth, Body limit</text></g>
      <g transform="translate(154,52)"><rect width="132" height="42" rx="10" fill="#06b6d4" fill-opacity="0.13" stroke="#06b6d4" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">models.ts</text><text x="66" y="30" text-anchor="middle" fill="#06b6d4" font-size="8.5">роутинг и алиасы</text></g>
      <g transform="translate(14,102)"><rect width="132" height="42" rx="10" fill="#ec4899" fill-opacity="0.13" stroke="#ec4899" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">handlers/</text><text x="66" y="30" text-anchor="middle" fill="#ec4899" font-size="8.5">openai, anthropic</text></g>
      <g transform="translate(154,102)"><rect width="132" height="42" rx="10" fill="#f59e0b" fill-opacity="0.13" stroke="#f59e0b" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">convert/</text><text x="66" y="30" text-anchor="middle" fill="#f59e0b" font-size="8.5">tool_use, thinking</text></g>
      <g transform="translate(14,152)"><rect width="132" height="42" rx="10" fill="#10b981" fill-opacity="0.13" stroke="#10b981" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">auth.ts</text><text x="66" y="30" text-anchor="middle" fill="#10b981" font-size="8.5">JWT mtime-кэш</text></g>
      <g transform="translate(154,152)"><rect width="132" height="42" rx="10" fill="#6366f1" fill-opacity="0.13" stroke="#6366f1" stroke-opacity="0.22"/><text x="66" y="18" text-anchor="middle" fill="#ffffff">backend.ts</text><text x="66" y="30" text-anchor="middle" fill="#6366f1" font-size="8.5">retry, timeout, SSE</text></g>
    </g>
    <g transform="translate(14,206)">
      <rect width="272" height="28" rx="14" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.07"/>
      <text x="136" y="18" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#ffffff" opacity="0.55">keep-alive 65с  •  heartbeat 15с  •  graceful 10с</text>
    </g>
  </g>

  <g transform="translate(588,0)">
    <line x1="10" y1="150" x2="64" y2="150" stroke="#a78bfa" stroke-width="2" marker-end="url(#arr2)"/>
    <rect x="8" y="118" width="56" height="18" rx="9" fill="#1e1b4b" stroke="#a78bfa" stroke-opacity="0.35"/>
    <text x="36" y="130" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="800" fill="#a78bfa">FETCH</text>
    <text x="36" y="172" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#ffffff" opacity="0.35">+ X-Authorization</text>
  </g>

  <g transform="translate(662,24)">
    <rect width="262" height="252" rx="16" fill="url(#aCard)" stroke="#ffffff" stroke-opacity="0.07"/>
    <text x="131" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#ffffff" letter-spacing="1.8" opacity="0.9">БЭКЕНД</text>
    <g transform="translate(14,36)">
      <rect width="234" height="64" rx="12" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.06"/>
      <text x="12" y="20" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">autoglm-api.autoglm.ai</text>
      <text x="12" y="34" font-family="JetBrains Mono, monospace" font-size="9" fill="#ffffff" opacity="0.45">/autoclaw-proxy/proxy/autoclaw</text>
      <text x="12" y="48" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981">X-Product: autoclaw</text>
    </g>
    <g transform="translate(14,110)">
      <rect width="234" height="48" rx="10" fill="#7c3aed" fill-opacity="0.12" stroke="#7c3aed" stroke-opacity="0.2"/>
      <text x="14" y="18" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#ffffff">zaicoding_glm-5.3</text>
      <text x="14" y="32" font-family="Inter, sans-serif" font-size="10" fill="#a78bfa">флагман  •  coding, reasoning</text>
    </g>
    <g transform="translate(14,166)">
      <rect width="112" height="38" rx="10" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.07"/>
      <text x="56" y="16" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#f472b6">GLM-5 Turbo</text>
      <text x="56" y="28" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#ffffff" opacity="0.45">быстрый</text>
    </g>
    <g transform="translate(136,166)">
      <rect width="112" height="38" rx="10" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.07"/>
      <text x="56" y="16" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#06b6d4">GLM-5.3 Flash</text>
      <text x="56" y="28" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" fill="#ffffff" opacity="0.45">экономный</text>
    </g>
    <g transform="translate(14,212)">
      <rect width="234" height="26" rx="13" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.22"/>
      <text x="117" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#10b981">SSE поток: прокси - клиент</text>
    </g>
  </g>

  <g transform="translate(938,24)">
    <rect width="198" height="252" rx="16" fill="#0b0f1e" stroke="#ffffff" stroke-opacity="0.06"/>
    <text x="99" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#ffffff" letter-spacing="1.6" opacity="0.9">НАБЛЮДЕНИЕ</text>
    <g transform="translate(14,36)">
      <rect width="170" height="36" rx="10" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.2"/>
      <text x="12" y="15" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#10b981">GET /health</text>
      <text x="12" y="27" font-family="Inter, sans-serif" font-size="9" fill="#ffffff" opacity="0.5">uptime, model_map, jwt</text>
    </g>
    <g transform="translate(14,80)">
      <rect width="170" height="36" rx="10" fill="#6366f1" fill-opacity="0.12" stroke="#6366f1" stroke-opacity="0.2"/>
      <text x="12" y="15" font-family="JetBrains Mono, monospace" font-size="10" font-weight="800" fill="#6366f1">GET /v1/models</text>
      <text x="12" y="27" font-family="Inter, sans-serif" font-size="9" fill="#ffffff" opacity="0.5">список всех алиасов</text>
    </g>
    <g transform="translate(14,124)">
      <rect width="170" height="36" rx="10" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.06"/>
      <text x="12" y="15" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#ffffff">Структурированные логи</text>
      <text x="12" y="27" font-family="JetBrains Mono, monospace" font-size="9" fill="#ffffff" opacity="0.45">LOG_JSON=1, LOG=debug</text>
    </g>
    <g transform="translate(14,168)">
      <rect width="170" height="36" rx="10" fill="#f59e0b" fill-opacity="0.10" stroke="#f59e0b" stroke-opacity="0.18"/>
      <text x="12" y="15" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#ffffff">Graceful shutdown</text>
      <text x="12" y="27" font-family="Inter, sans-serif" font-size="9" fill="#f59e0b">SIGINT / SIGTERM 10с</text>
    </g>
    <g transform="translate(14,212)">
      <rect width="170" height="26" rx="13" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.06"/>
      <text x="85" y="17" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#ffffff" opacity="0.5">X-Request-Id, CORS, 413/429</text>
    </g>
  </g>
</svg>

</div>

---

## Быстрый старт

<table>
<tr>
<td width="55%" valign="top">

### 1. Установка

```bash
# клонируй репозиторий
git clone https://github.com/твой-ник/zai-proxy
cd zai-proxy

# установи зависимости (только dev)
npm install

# собери проект
npm run build

# запусти
npm start
# -> zai-proxy v2.1.0 on http://127.0.0.1:18888
```

Режим разработки с авто-перезапуском:

```bash
npm run dev
```

> Порт по умолчанию `18888`, хост `127.0.0.1` — меняются через переменные окружения.

### 2. Настройка аутентификации

Прокси читает JWT из файла, который создает AutoClaw:

```
~/.openclaw-autoclaw/request-headers.json
```

Формат файла — любой из вариантов:

```json
{ "headers": { "X-Authorization": "твой-jwt..." } }
```

или

```json
{ "jwt": "твой-jwt..." }
```

> Кэш по `mtime + size`, фоновый `stat` с интервалом около 50 мс — не нагружает диск. При ошибках чтения возвращается последний успешный JWT.

</td>
<td width="45%" valign="top">

### 3. Проверка здоровья

```bash
curl http://localhost:18888/health | jq
```

```json
{
  "status": "ok",
  "version": "2.1.0",
  "model_map": {
    "auto": "zai_auto",
    "glm-5.3": "zaicoding_glm-5.3"
  },
  "jwt_cache": {
    "cached": true,
    "hasJwt": true
  },
  "memory": { "rss": 48234496 }
}
```

### 4. Первый запрос

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "messages": [
      {"role":"user","content":"Привет! Кто ты?"}
    ]
  }'
```

<details>
<summary>Ответ</summary>

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "glm-5.3",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Привет! Я GLM-5.3 — большая языковая модель от Zhipu AI."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 18,
    "total_tokens": 30
  }
}
```

</details>

<br/>

<svg width="100%" height="88" viewBox="0 0 520 88" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="readyTitle">
  <title id="readyTitle">Готово к работе за 30 секунд</title>
  <rect width="520" height="88" rx="16" fill="#0f172a" stroke="#10b981" stroke-opacity="0.2"/>
  <g transform="translate(14,12)">
    <rect width="28" height="28" rx="14" fill="#10b981" fill-opacity="0.15"/>
    <path d="M 9 14 L 13 18 L 19 10" stroke="#10b981" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="52" y="30" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#ffffff">Готово к работе за 30 секунд</text>
  <text x="52" y="46" font-family="Inter, sans-serif" font-size="11" fill="#ffffff" opacity="0.5">Без Docker, без ключей OpenAI, без лишней настройки</text>
  <rect x="16" y="58" width="488" height="22" rx="11" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="26" cy="69" r="3" fill="#34d399"/>
  <text x="34" y="73" font-family="JetBrains Mono, monospace" font-size="10.5" fill="#ffffff" opacity="0.7">эндпоинты:  /health  /v1/models  /v1/chat/completions  /v1/messages</text>
</svg>

</td>
</tr>
</table>

---

## Конфигурация

> Все настройки — через переменные окружения. Обязательных полей нет — везде заданы разумные значения по умолчанию.

<div align="center">

<svg width="100%" height="54" viewBox="0 0 1160 54" xmlns="http://www.w3.org/2000/svg" role="img">
  <rect width="1160" height="54" rx="14" fill="#1e1b4b" stroke="#7c3aed" stroke-opacity="0.22"/>
  <text x="24" y="22" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#a78bfa" letter-spacing="1.2">ENV  •  ПРИМЕР  •  СКОПИРУЙ И ПОДСТРОЙ</text>
  <text x="24" y="38" font-family="JetBrains Mono, monospace" font-size="10" fill="#ffffff" opacity="0.55">PORT=18888  •  ZAI_BACKEND_URL=https://...  •  PROXY_API_KEY=...  •  MODEL_MAP_JSON='{"my-model":"zai_custom"}'</text>
  <g transform="translate(1000,12)">
    <rect width="136" height="30" rx="10" fill="#7c3aed" fill-opacity="0.18" stroke="#7c3aed" stroke-opacity="0.3"/>
    <text x="68" y="20" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#a78bfa">12 переменных</text>
  </g>
</svg>

</div>

| Переменная | По умолчанию | Описание |
|---|---|---|
| `PORT` | `18888` | Порт прокси |
| `HOST` / `BIND` | `127.0.0.1` | Хост для бинда |
| `ZAI_BACKEND_URL` | `https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions` | URL бэкенда z.ai |
| `AUTOCLAW_REQ_HEADERS` / `JWT_PATH` | `~/.openclaw-autoclaw/request-headers.json` | Путь к файлу с JWT |
| `PROXY_API_KEY` / `API_KEY` | *(пусто)* | Если задан — защита всех эндпоинтов кроме `/health` и `/` |
| `LOG` / `LOG_LEVEL` | `info` | Уровень логов: `debug`, `info`, `error` |
| `LOG_JSON` | `false` | `1` — JSON-логи для Loki / Datadog |
| `BODY_LIMIT_BYTES` | `10485760` (10 МБ) | Лимит тела запроса (от 1 КБ до 100 МБ) |
| `BACKEND_TIMEOUT_MS` | `120000` | Таймаут бэкенда в мс, `0` — без таймаута |
| `BACKEND_MAX_RETRIES` | `3` | Количество попыток при `429 / 5xx / сетевом сбое` |
| `BACKEND_RETRY_BASE_MS` | `400` | База для экспоненциального backoff |
| `CORS_ALLOW_ORIGIN` | `*` | Заголовок `Access-Control-Allow-Origin` |
| `HEALTH_DETAILS` | `true` | Показывать ли детали в `/health` |
| `MODEL_MAP_JSON` | *(пусто)* | JSON для расширения мапы моделей, например `'{"my-glm":"zai_custom"}'` |

<details>
<summary>Пример файла <code>.env</code></summary>

```env
PORT=18888
HOST=127.0.0.1
ZAI_BACKEND_URL=https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions
PROXY_API_KEY=sk-proj-твой-секретный-ключ
LOG=info
LOG_JSON=false
BODY_LIMIT_BYTES=10485760
BACKEND_TIMEOUT_MS=120000
BACKEND_MAX_RETRIES=3
BACKEND_RETRY_BASE_MS=400
CORS_ALLOW_ORIGIN=*
HEALTH_DETAILS=true
MODEL_MAP_JSON={"my-model":"zai_auto"}
```

</details>

---

## Модели

<div align="center">

<svg width="100%" height="64" viewBox="0 0 1160 64" xmlns="http://www.w3.org/2000/svg" role="img">
  <rect width="1160" height="64" rx="14" fill="#0f172a" stroke="#ffffff" stroke-opacity="0.06"/>
  <text x="20" y="26" font-family="Inter, sans-serif" font-size="12" font-weight="800" fill="#ffffff" letter-spacing="0.6">Умный роутинг — пишешь как хочешь, прокси поймет</text>
  <text x="20" y="44" font-family="JetBrains Mono, monospace" font-size="10.5" fill="#ffffff" opacity="0.5">Префиксы zai/ • autoclaw/ • anthropic/ • openai/ автоматически срезаются  •  регистронезависимо  •  эвристики по подстроке</text>
  <g transform="translate(1004,16)">
    <rect width="136" height="32" rx="10" fill="#06b6d4" fill-opacity="0.14" stroke="#06b6d4" stroke-opacity="0.25"/>
    <text x="68" y="21" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="800" fill="#06b6d4">GET /v1/models</text>
  </g>
</svg>

</div>

### Базовая мапа

| ID для клиента | Бэкенд ID | Назначение |
|---|---|---|
| `auto` | `zai_auto` | Авто-выбор оптимальной модели |
| `glm-5-turbo` | `zai_glm-5-turbo` | Быстрый GLM-5, низкая задержка |
| `glm-5.3` | `zaicoding_glm-5.3` | Флагман — код, рассуждения, инструменты |
| `glm-5.3-flash` | `zai_glm-5.3-flash` | Экономный GLM-5.3 |
| `glm-coding` | `zaicoding_glm-5.3` | Алиас для задач кодинга |
| `zaicoding-glm-5.3` | `zaicoding_glm-5.3` | Прямой ID |
| `deepseek-v4-flash-202605` | `zai_auto` | Совместимость |

### Claude-алиасы — в GLM-5.3

Любой `claude-*` автоматически становится `zaicoding_glm-5.3`:

```
claude-sonnet-4-5
claude-sonnet-4-5-20250929
claude-opus-4-1 / claude-opus-4-5
claude-haiku-4-5
claude-3-5-sonnet-20241022
claude-3-opus-20240229
…и любой другой claude-* (регулярка ^claude)
```

### Эвристики

| Что написал | Куда уйдет |
|---|---|
| содержит `glm-5.3` / `glm-5` | `zaicoding_glm-5.3` (или `flash` / `turbo` если есть слово) |
| содержит `glm-coding` / `coding` | `zaicoding_glm-5.3` |
| содержит `deepseek` / `auto` | `zai_auto` |
| все остальное | `zai_glm-5.3-flash` (дефолт) |

### Кастомная мапа

```bash
MODEL_MAP_JSON='{"my-fast":"zai_glm-5-turbo","my-smart":"zaicoding_glm-5.3"}' npm start
```

После этого новые ID сразу появятся в `GET /v1/models`.

---

## API

<div align="center">

| Метод | Путь | Описание | Аутентификация |
|---|---|---|---|
| `GET` | `/` | Информация о прокси и список эндпоинтов | нет |
| `GET` | `/health`, `/v1/health`, `/ping` | Здоровье, детали, память | нет |
| `GET` | `/v1/models` | Список моделей в формате OpenAI | да |
| `POST` | `/v1/chat/completions` | Чат, совместимый с OpenAI | да |
| `POST` | `/v1/messages` | Чат, совместимый с Anthropic | да |

<sub>«да» — требует заголовок <code>Authorization: Bearer &lt;PROXY_API_KEY&gt;</code> если ключ задан. Также принимаются <code>X-Api-Key</code>, <code>X-Authorization</code>, <code>?api_key=</code></sub>

</div>

### Заголовки бэкенда

Каждый запрос к `ZAI_BACKEND_URL` автоматически получает:

```
Authorization: Bearer autoclaw-internal-proxy
X-Authorization: <JWT из файла>
X-Request-Id: <uuid>
X-Request-Model: <backendModel>
X-Client-Type: pc
X-Product: autoclaw
X-Harness-Type: zcode
X-Tm: win
X-Version: 1.17.8
X-Lang: ru
X-Channel: official
x_trace_id: autoclaw-desktop
```

### Коды ошибок

| Код | Когда |
|---|---|
| `400` | Невалидный JSON, пустые `messages`, неверная роль |
| `401` | Неверный `PROXY_API_KEY` |
| `405` | Не тот HTTP-метод |
| `413` | Тело больше `BODY_LIMIT_BYTES` |
| `502` | Бэкенд вернул не-JSON или сетевой сбой |
| `504` | Таймаут бэкенда |

---

## Примеры

### OpenAI — обычный запрос

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROXY_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "temperature": 0.7,
    "messages": [
      {"role": "system", "content": "Ты — полезный ассистент."},
      {"role": "user", "content": "Напиши функцию Фибоначчи на Python"}
    ]
  }' | jq
```

### OpenAI — поток (SSE)

```bash
curl -N http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "stream": true,
    "stream_options": {"include_usage": true},
    "messages": [{"role":"user","content":"Расскажи про космос"}]
  }'
```

```
data: {"id":"chatcmpl-...","choices":[{"delta":{"content":"Космос"}}]}
data: {"id":"chatcmpl-...","choices":[{"delta":{"content":" — это"}}]}
...
data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":120}}
data: [DONE]
```

### OpenAI — вызов инструментов

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role":"user","content":"Какая погода в Москве?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Узнать погоду в городе",
        "parameters": {
          "type": "object",
          "properties": {"city": {"type":"string"}},
          "required": ["city"]
        }
      }
    }],
    "tool_choice": "auto"
  }' | jq
```

### Anthropic — обычный запрос

```bash
curl http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $PROXY_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1024,
    "messages": [
      {"role":"user","content":"Привет! Объясни квантовую запутанность простыми словами."}
    ]
  }' | jq
```

### Anthropic — поток

```bash
curl -N http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 2048,
    "stream": true,
    "messages": [{"role":"user","content":"Напиши рассказ про робота"}]
  }'
```

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_...","model":"claude-sonnet-4-5"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Жил-был"}}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}

event: message_stop
data: {"type":"message_stop"}
```

### Anthropic — tool_use (Claude Code)

```bash
curl http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 2048,
    "messages": [{"role":"user","content":"Создай файл hello.py с приветствием"}],
    "tools": [{
      "name": "write_file",
      "description": "Записать файл",
      "input_schema": {
        "type":"object",
        "properties": {
          "path": {"type":"string"},
          "content": {"type":"string"}
        },
        "required": ["path","content"]
      }
    }]
  }' | jq
```

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:18888/v1",
    api_key="неважно-если-PROXY_API_KEY-не-задан",
)

stream = client.chat.completions.create(
    model="glm-5.3",
    messages=[{"role": "user", "content": "Привет!"}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Python (Anthropic SDK)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="http://localhost:18888",
    api_key="sk-...",
)

with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Привет!"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Claude Code

```bash
# переменные окружения
export ANTHROPIC_BASE_URL=http://localhost:18888
export ANTHROPIC_API_KEY=dummy
# или
export ANTHROPIC_AUTH_TOKEN=dummy

claude --model claude-sonnet-4-5 "объясни этот код"
```

> Прокси автоматически смапит `claude-sonnet-4-5` в `zaicoding_glm-5.3`, конвертирует `tool_use` в `tool_calls`, `thinking` в `reasoning_content`, картинки `base64/url`, документы и `tool_result`.

---

## Claude Code — полная совместимость

<div align="center">

<svg width="100%" height="110" viewBox="0 0 1160 110" xmlns="http://www.w3.org/2000/svg" role="img">
  <rect width="1160" height="110" rx="16" fill="#0f172a" stroke="#ec4899" stroke-opacity="0.18"/>
  <text x="24" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Что конвертируется автоматически</text>
  <g font-family="Inter, sans-serif" font-size="11" fill="#ffffff">
    <g transform="translate(24,50)"><rect width="182" height="30" rx="10" fill="#ec4899" fill-opacity="0.14" stroke="#ec4899" stroke-opacity="0.22"/><text x="91" y="20" text-anchor="middle" font-weight="700" fill="#f472b6">tool_use ↔ tool_calls</text></g>
    <g transform="translate(214,50)"><rect width="182" height="30" rx="10" fill="#7c3aed" fill-opacity="0.14" stroke="#7c3aed" stroke-opacity="0.22"/><text x="91" y="20" text-anchor="middle" font-weight="700" fill="#a78bfa">thinking ↔ reasoning</text></g>
    <g transform="translate(404,50)"><rect width="182" height="30" rx="10" fill="#06b6d4" fill-opacity="0.14" stroke="#06b6d4" stroke-opacity="0.22"/><text x="91" y="20" text-anchor="middle" font-weight="700" fill="#22d3ee">image base64 / url</text></g>
    <g transform="translate(594,50)"><rect width="182" height="30" rx="10" fill="#f59e0b" fill-opacity="0.14" stroke="#f59e0b" stroke-opacity="0.22"/><text x="91" y="20" text-anchor="middle" font-weight="700" fill="#fbbf24">document → text</text></g>
    <g transform="translate(784,50)"><rect width="182" height="30" rx="10" fill="#10b981" fill-opacity="0.14" stroke="#10b981" stroke-opacity="0.22"/><text x="91" y="20" text-anchor="middle" font-weight="700" fill="#34d399">tool_result → tool</text></g>
    <g transform="translate(974,50)"><rect width="162" height="30" rx="10" fill="#6366f1" fill-opacity="0.14" stroke="#6366f1" stroke-opacity="0.22"/><text x="81" y="20" text-anchor="middle" font-weight="700" fill="#818cf8">stop_reason</text></g>
  </g>
  <text x="24" y="96" font-family="JetBrains Mono, monospace" font-size="10" fill="#ffffff" opacity="0.42">system → system  •  stop_sequences → stop  •  tool_choice auto / any / tool / none  •  max_tokens / temperature / top_p / top_k  •  стриминг с конвертером чанков</text>
</svg>

</div>

---

## Структура проекта

```
zai-proxy/
├── src/
│   ├── index.ts              # точка входа, graceful shutdown, сигналы
│   ├── server.ts             # HTTP-сервер, CORS, аутентификация, роутинг
│   ├── config.ts             # загрузка и валидация переменных окружения
│   ├── auth.ts               # JWT-кэш по mtime/size, cooldown 50 мс
│   ├── backend.ts            # fetch с ретраями, Retry-After, backoff и jitter
│   ├── models.ts             # MODEL_MAP, resolveModel, эвристики
│   ├── handlers/
│   │   ├── openai.ts         # /v1/chat/completions, SSE, heartbeat
│   │   └── anthropic.ts      # /v1/messages, валидация, конвертация
│   ├── convert/
│   │   ├── anthropic-to-openai.ts   # система, картинки, тулзы → OpenAI
│   │   └── openai-to-anthropic.ts   # чанки, usage, thinking → Anthropic SSE
│   ├── types/
│   │   ├── openai.ts
│   │   └── anthropic.ts
│   └── utils/
│       ├── sse.ts            # sseEncode, sseDone
│       └── logger.ts         # уровни логов и JSON-формат
├── dist/                     # сборка (tsc)
├── package.json
└── tsconfig.json
```

---

## Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 18888
CMD ["node", "dist/index.js"]
```

```bash
docker build -t zai-proxy .
docker run -p 18888:18888 \
  -e PROXY_API_KEY=sk-... \
  -e ZAI_BACKEND_URL=https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions \
  -v ~/.openclaw-autoclaw/request-headers.json:/root/.openclaw-autoclaw/request-headers.json:ro \
  zai-proxy
```

---

## Частые вопросы

<details>
<summary>Зачем нужен прокси, если можно вызывать z.ai напрямую</summary>

z.ai говорит на своем диалекте. Клиенты вроде Claude Code или OpenAI SDK — на своем. Прокси выступает переводчиком и не требует менять клиентский код.

</details>

<details>
<summary>Нужен ли ключ OpenAI или Anthropic</summary>

Нет. Достаточно JWT из `request-headers.json`. Если `PROXY_API_KEY` не задан — прокси открыт локально. Если задан — укажи его как `Authorization: Bearer ...` в клиенте.

</details>

<details>
<summary>Поток прерывается через минуту</summary>

Проверь, что `BACKEND_TIMEOUT_MS` достаточно большой (по умолчанию 120 секунд). Для длинных генераций поставь `0` (без таймаута). Heartbeat каждые 15 секунд уже удерживает соединение.

</details>

<details>
<summary>Как добавить свою модель</summary>

```bash
MODEL_MAP_JSON='{"my-model":"zai_custom_backend_id"}' npm start
```

Она сразу появится в `GET /v1/models`.

</details>

<details>
<summary>Где посмотреть логи</summary>

В stdout. `LOG=debug` — подробно, `LOG_JSON=1` — JSON для агрегаторов. В каждом ответе есть `X-Request-Id` для трейсинга.

</details>

---

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Запуск с автоперезапуском (`tsx watch`) |
| `npm run build` | Компиляция `tsc` в `dist/` |
| `npm start` | Запуск собранного `dist/index.js` |
| `npm run typecheck` | Проверка типов без сборки |
| `npm run clean` | Удаление `dist/` |

---

## Лицензия

**MIT** — можно использовать как угодно, сохраняя уведомление об авторских правах.

---

<div align="center">

<svg width="100%" height="160" viewBox="0 0 1160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="footerTitle">
  <title id="footerTitle">zai-proxy — завершение</title>
  <defs>
    <linearGradient id="footerBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="footerBtn" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <radialGradient id="fGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1160" height="160" rx="20" fill="url(#footerBg)" stroke="#ffffff" stroke-opacity="0.06"/>
  <rect width="1160" height="160" rx="20" fill="url(#fGlow)"/>

  <circle cx="120" cy="40" r="1.2" fill="#ffffff" opacity="0.5"/><circle cx="180" cy="26" r="1" fill="#ffffff" opacity="0.3"/><circle cx="240" cy="48" r="1.4" fill="#ffffff" opacity="0.4"/>
  <circle cx="900" cy="34" r="1.2" fill="#ffffff" opacity="0.35"/><circle cx="980" cy="52" r="1" fill="#ffffff" opacity="0.45"/><circle cx="1040" cy="28" r="1.3" fill="#ffffff" opacity="0.3"/>

  <text x="580" y="42" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="-0.8">Сделано для сообщества</text>
  <text x="580" y="64" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12.5" fill="#ffffff" opacity="0.55">Если проект полезен — поставьте звезду на GitHub и поделитесь с друзьями</text>

  <g transform="translate(376,82)">
    <rect width="170" height="42" rx="12" fill="url(#footerBtn)"/>
    <text x="85" y="27" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Поставить звезду</text>
  </g>
  <g transform="translate(558,82)">
    <rect width="170" height="42" rx="12" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.12"/>
    <text x="85" y="27" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Сообщить о баге</text>
  </g>

  <text x="580" y="144" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#ffffff" opacity="0.30">zai-proxy v2.1.0  •  Node >=18.18  •  TypeScript 5.6  •  Zero runtime deps  •  MIT License</text>
</svg>

<sub>Нашли ошибку в README или есть идея — открывайте Issue или Pull Request</sub>

</div>
