<div align="center">

<!-- HERO BANNER -->
<img src="assets/hero.svg" alt="zai-proxy hero">

<p>
  <a href="#Р±С‹СЃС‚СЂС‹Р№-СЃС‚Р°СЂС‚"><img src="https://img.shields.io/badge/Node-%3E%3D18.18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="node"/></a>&nbsp;
  <a href="#РєРѕРЅС„РёРіСѓСЂР°С†РёСЏ"><img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="ts"/></a>&nbsp;
  <a href="#Р»РёС†РµРЅР·РёСЏ"><img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="mit"/></a>&nbsp;
  <img src="https://img.shields.io/badge/Zero_Runtime_Deps-0-7c3aed?style=for-the-badge" alt="zero deps"/>&nbsp;
  <img src="https://img.shields.io/badge/SSE_Streaming-OK-06b6d4?style=for-the-badge" alt="sse"/>
</p>

<sub>РЎРѕРІРјРµСЃС‚РёРј СЃ <b>OpenAI SDK</b> вЂў <b>Anthropic SDK</b> вЂў <b>Claude Code</b> вЂў <b>Cline</b> вЂў <b>Roo Code</b> вЂў Р›СЋР±С‹Рј РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРј СЃ РїРѕРґРґРµСЂР¶РєРѕР№ <code>claude-*</code></sub>

</div>

<br/>

<div align="center">

| [Р§С‚Рѕ СЌС‚Рѕ](#С‡С‚Рѕ-СЌС‚Рѕ) | [Р’РѕР·РјРѕР¶РЅРѕСЃС‚Рё](#РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё) | [РђСЂС…РёС‚РµРєС‚СѓСЂР°](#Р°СЂС…РёС‚РµРєС‚СѓСЂР°) | [Р‘С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚](#Р±С‹СЃС‚СЂС‹Р№-СЃС‚Р°СЂС‚) | [РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ](#РєРѕРЅС„РёРіСѓСЂР°С†РёСЏ) | [РњРѕРґРµР»Рё](#РјРѕРґРµР»Рё) | [API](#api) | [РџСЂРёРјРµСЂС‹](#РїСЂРёРјРµСЂС‹) |
|---|---|---|---|---|---|---|---|

</div>

---

## Р§С‚Рѕ СЌС‚Рѕ

> **zai-proxy** вЂ” Р»С‘РіРєРёР№, РјРѕР»РЅРёРµРЅРѕСЃРЅС‹Р№ С€Р»СЋР·, РєРѕС‚РѕСЂС‹Р№ РїСЂРёС‚РІРѕСЂСЏРµС‚СЃСЏ РѕРґРЅРѕРІСЂРµРјРµРЅРЅРѕ **OpenAI** Рё **Anthropic**, Р° РїРѕРґ РєР°РїРѕС‚РѕРј вЂ” **z.ai / AutoClaw** (`autoglm-api.autoglm.ai`).  
> РџРѕРґРєР»СЋС‡Р°РµС€СЊ Р»СЋР±РѕР№ РєР»РёРµРЅС‚ вЂ” РѕРЅ РґСѓРјР°РµС‚, С‡С‚Рѕ РіРѕРІРѕСЂРёС‚ СЃ `api.openai.com` РёР»Рё `api.anthropic.com`, Р° РѕС‚РІРµС‡Р°РµС‚ РЅР°СЃС‚РѕСЏС‰РёР№ **GLM-5.3 / GLM-Coding**.

<table>
<tr>
<td width="50%" valign="top">

**Р—Р°С‡РµРј РЅСѓР¶РµРЅ**

- РСЃРїРѕР»СЊР·РѕРІР°С‚СЊ `Claude Code`, `Cursor`, `Continue`, `OpenAI SDK` СЃ Р±СЌРєРµРЅРґРѕРј z.ai Р±РµР· РїРµСЂРµРїРёСЃС‹РІР°РЅРёСЏ РєРѕРґР°
- Р•РґРёРЅР°СЏ С‚РѕС‡РєР° РІС…РѕРґР° РґР»СЏ РІСЃРµС… РјРѕРґРµР»РµР№ вЂ” РѕРґРёРЅ РїРѕСЂС‚, РѕРґРёРЅ РєР»СЋС‡
- РџРѕС‚РѕРєРѕРІС‹Р№ `tool_use` Р±РµР· РєРѕСЃС‚С‹Р»РµР№ вЂ” SSE РІ SSE, С‡РµСЃС‚РЅС‹Р№ РїСЂРѕРєСЃРё
- РќРѕР»СЊ СЂР°РЅС‚Р°Р№Рј-Р·Р°РІРёСЃРёРјРѕСЃС‚РµР№ вЂ” С‡РёСЃС‚С‹Р№ `node:http` Рё РЅР°С‚РёРІРЅС‹Р№ `fetch`

**РљР»СЋС‡РµРІС‹Рµ С†РёС„СЂС‹**

- РЎС‚Р°СЂС‚ РјРµРЅРµРµ 200 РјСЃ, РѕРІРµСЂС…РµРґ РјРµРЅРµРµ 15 РјСЃ
- РћРєРѕР»Рѕ 5 РњР‘ РЅР° РґРёСЃРєРµ, РїРѕС‚СЂРµР±Р»РµРЅРёРµ РїР°РјСЏС‚Рё РѕС‚ 45 РњР‘
- Keep-Alive 65 СЃ, heartbeat 15 СЃ, graceful shutdown 10 СЃ

</td>
<td width="50%" valign="top">

**РЎС…РµРјР° Р·Р°РїСЂРѕСЃР°**

```
РљР»РёРµРЅС‚ (OpenAI / Anthropic / Claude Code)
        |
        |  POST /v1/chat/completions
        |  POST /v1/messages
        v
   zai-proxy :18888
   в”њв”Ђ server.ts (CORS, Auth, Р»РёРјРёС‚С‹)
   в”њв”Ђ models.ts (СЂРѕСѓС‚РёРЅРі)
   в”њв”Ђ handlers + convert
   в””в”Ђ backend.ts (retry, timeout, SSE)
        |
        |  X-Authorization: JWT
        v
   autoglm-api.autoglm.ai
   в””в”Ђ GLM-5.3 / Turbo / Flash / Auto
```

</td>
</tr>
</table>

---

<div align="center">

<!-- FEATURES BANNER -->
<img src="assets/features.svg" alt="features">

</div>

<a id="РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё"></a>

---

## РђСЂС…РёС‚РµРєС‚СѓСЂР°

<div align="center">

<img src="assets/architecture.svg" alt="architecture">

</div>

---

## Р‘С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚

<table>
<tr>
<td width="55%" valign="top">

### 1. РЈСЃС‚Р°РЅРѕРІРєР°

```bash
# РєР»РѕРЅРёСЂСѓР№ СЂРµРїРѕР·РёС‚РѕСЂРёР№
git clone https://github.com/С‚РІРѕР№-РЅРёРє/zai-proxy
cd zai-proxy

# СѓСЃС‚Р°РЅРѕРІРё Р·Р°РІРёСЃРёРјРѕСЃС‚Рё (С‚РѕР»СЊРєРѕ dev)
npm install

# СЃРѕР±РµСЂРё РїСЂРѕРµРєС‚
npm run build

# Р·Р°РїСѓСЃС‚Рё
npm start
# -> zai-proxy v3.0.0 on http://127.0.0.1:18888
```

Р РµР¶РёРј СЂР°Р·СЂР°Р±РѕС‚РєРё СЃ Р°РІС‚Рѕ-РїРµСЂРµР·Р°РїСѓСЃРєРѕРј:

```bash
npm run dev
```

> РџРѕСЂС‚ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ `18888`, С…РѕСЃС‚ `127.0.0.1` вЂ” РјРµРЅСЏСЋС‚СЃСЏ С‡РµСЂРµР· РїРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ.

### 2. РќР°СЃС‚СЂРѕР№РєР° Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёРё

РџСЂРѕРєСЃРё С‡РёС‚Р°РµС‚ JWT РёР· С„Р°Р№Р»Р°, РєРѕС‚РѕСЂС‹Р№ СЃРѕР·РґР°РµС‚ AutoClaw:

```
~/.openclaw-autoclaw/request-headers.json
```

Р¤РѕСЂРјР°С‚ С„Р°Р№Р»Р° вЂ” Р»СЋР±РѕР№ РёР· РІР°СЂРёР°РЅС‚РѕРІ:

```json
{ "headers": { "X-Authorization": "С‚РІРѕР№-jwt..." } }
```

РёР»Рё

```json
{ "jwt": "С‚РІРѕР№-jwt..." }
```

> РљСЌС€ РїРѕ `mtime + size`, С„РѕРЅРѕРІС‹Р№ `stat` СЃ РёРЅС‚РµСЂРІР°Р»РѕРј РѕРєРѕР»Рѕ 50 РјСЃ вЂ” РЅРµ РЅР°РіСЂСѓР¶Р°РµС‚ РґРёСЃРє. РџСЂРё РѕС€РёР±РєР°С… С‡С‚РµРЅРёСЏ РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ РїРѕСЃР»РµРґРЅРёР№ СѓСЃРїРµС€РЅС‹Р№ JWT.

</td>
<td width="45%" valign="top">

### 3. РџСЂРѕРІРµСЂРєР° Р·РґРѕСЂРѕРІСЊСЏ

```bash
curl http://localhost:18888/health | jq
```

```json
{
  "status": "ok",
  "version": "3.0.0",
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

### 4. РџРµСЂРІС‹Р№ Р·Р°РїСЂРѕСЃ

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "messages": [
      {"role":"user","content":"РџСЂРёРІРµС‚! РљС‚Рѕ С‚С‹?"}
    ]
  }'
```

<details>
<summary>РћС‚РІРµС‚</summary>

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "glm-5.3",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "РџСЂРёРІРµС‚! РЇ GLM-5.3 вЂ” Р±РѕР»СЊС€Р°СЏ СЏР·С‹РєРѕРІР°СЏ РјРѕРґРµР»СЊ РѕС‚ Zhipu AI."
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

<img src="assets/ready.svg" alt="ready">

</td>
</tr>
</table>

---

## РљРѕРЅС„РёРіСѓСЂР°С†РёСЏ

> Р’СЃРµ РЅР°СЃС‚СЂРѕР№РєРё вЂ” С‡РµСЂРµР· РїРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ. РћР±СЏР·Р°С‚РµР»СЊРЅС‹С… РїРѕР»РµР№ РЅРµС‚ вЂ” РІРµР·РґРµ Р·Р°РґР°РЅС‹ СЂР°Р·СѓРјРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ.

<div align="center">

<img src="assets/env-banner.svg" alt="env">

</div>

| РџРµСЂРµРјРµРЅРЅР°СЏ | РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ | РћРїРёСЃР°РЅРёРµ |
|---|---|---|
| `PORT` | `18888` | РџРѕСЂС‚ РїСЂРѕРєСЃРё |
| `HOST` / `BIND` | `127.0.0.1` | РҐРѕСЃС‚ РґР»СЏ Р±РёРЅРґР° |
| `ZAI_BACKEND_URL` | `https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions` | URL Р±СЌРєРµРЅРґР° z.ai |
| `AUTOCLAW_REQ_HEADERS` / `JWT_PATH` | `~/.openclaw-autoclaw/request-headers.json` | РџСѓС‚СЊ Рє С„Р°Р№Р»Сѓ СЃ JWT |
| `PROXY_API_KEY` / `API_KEY` | *(РїСѓСЃС‚Рѕ)* | Р•СЃР»Рё Р·Р°РґР°РЅ вЂ” Р·Р°С‰РёС‚Р° РІСЃРµС… СЌРЅРґРїРѕРёРЅС‚РѕРІ РєСЂРѕРјРµ `/health` Рё `/` |
| `LOG` / `LOG_LEVEL` | `info` | РЈСЂРѕРІРµРЅСЊ Р»РѕРіРѕРІ: `debug`, `info`, `error` |
| `LOG_JSON` | `false` | `1` вЂ” JSON-Р»РѕРіРё РґР»СЏ Loki / Datadog |
| `BODY_LIMIT_BYTES` | `10485760` (10 РњР‘) | Р›РёРјРёС‚ С‚РµР»Р° Р·Р°РїСЂРѕСЃР° (РѕС‚ 1 РљР‘ РґРѕ 100 РњР‘) |
| `BACKEND_TIMEOUT_MS` | `120000` | РўР°Р№РјР°СѓС‚ Р±СЌРєРµРЅРґР° РІ РјСЃ, `0` вЂ” Р±РµР· С‚Р°Р№РјР°СѓС‚Р° |
| `BACKEND_MAX_RETRIES` | `3` | РљРѕР»РёС‡РµСЃС‚РІРѕ РїРѕРїС‹С‚РѕРє РїСЂРё `429 / 5xx / СЃРµС‚РµРІРѕРј СЃР±РѕРµ` |
| `BACKEND_RETRY_BASE_MS` | `400` | Р‘Р°Р·Р° РґР»СЏ СЌРєСЃРїРѕРЅРµРЅС†РёР°Р»СЊРЅРѕРіРѕ backoff |
| `CORS_ALLOW_ORIGIN` | `*` | Р—Р°РіРѕР»РѕРІРѕРє `Access-Control-Allow-Origin` |
| `HEALTH_DETAILS` | `true` | РџРѕРєР°Р·С‹РІР°С‚СЊ Р»Рё РґРµС‚Р°Р»Рё РІ `/health` |
| `MODEL_MAP_JSON` | *(РїСѓСЃС‚Рѕ)* | JSON РґР»СЏ СЂР°СЃС€РёСЂРµРЅРёСЏ РјР°РїС‹ РјРѕРґРµР»РµР№, РЅР°РїСЂРёРјРµСЂ `'{"my-glm":"zai_custom"}'` |

<details>
<summary>РџСЂРёРјРµСЂ С„Р°Р№Р»Р° <code>.env</code></summary>

```env
PORT=18888
HOST=127.0.0.1
ZAI_BACKEND_URL=https://autoglm-api.autoglm.ai/autoclaw-proxy/proxy/autoclaw/chat/completions
PROXY_API_KEY=sk-proj-С‚РІРѕР№-СЃРµРєСЂРµС‚РЅС‹Р№-РєР»СЋС‡
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

## РњРѕРґРµР»Рё

<div align="center">

<img src="assets/models-banner.svg" alt="models">

</div>

### Р‘Р°Р·РѕРІР°СЏ РјР°РїР°

| ID РґР»СЏ РєР»РёРµРЅС‚Р° | Р‘СЌРєРµРЅРґ ID | РќР°Р·РЅР°С‡РµРЅРёРµ |
|---|---|---|
| `auto` | `zai_auto` | РђРІС‚Рѕ-РІС‹Р±РѕСЂ РѕРїС‚РёРјР°Р»СЊРЅРѕР№ РјРѕРґРµР»Рё |
| `glm-5-turbo` | `zai_glm-5-turbo` | Р‘С‹СЃС‚СЂС‹Р№ GLM-5, РЅРёР·РєР°СЏ Р·Р°РґРµСЂР¶РєР° |
| `glm-5.3` | `zaicoding_glm-5.3` | Р¤Р»Р°РіРјР°РЅ вЂ” РєРѕРґ, СЂР°СЃСЃСѓР¶РґРµРЅРёСЏ, РёРЅСЃС‚СЂСѓРјРµРЅС‚С‹ |
| `glm-5.3-flash` | `zai_glm-5.3-flash` | Р­РєРѕРЅРѕРјРЅС‹Р№ GLM-5.3 |
| `glm-coding` | `zaicoding_glm-5.3` | РђР»РёР°СЃ РґР»СЏ Р·Р°РґР°С‡ РєРѕРґРёРЅРіР° |
| `zaicoding-glm-5.3` | `zaicoding_glm-5.3` | РџСЂСЏРјРѕР№ ID |
| `deepseek-v4-flash-202605` | `zai_auto` | РЎРѕРІРјРµСЃС‚РёРјРѕСЃС‚СЊ |

### Claude-Р°Р»РёР°СЃС‹ вЂ” РІ GLM-5.3

Р›СЋР±РѕР№ `claude-*` Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЃС‚Р°РЅРѕРІРёС‚СЃСЏ `zaicoding_glm-5.3`:

```
claude-sonnet-4-5
claude-sonnet-4-5-20250929
claude-opus-4-1 / claude-opus-4-5
claude-haiku-4-5
claude-3-5-sonnet-20241022
claude-3-opus-20240229
вЂ¦Рё Р»СЋР±РѕР№ РґСЂСѓРіРѕР№ claude-* (СЂРµРіСѓР»СЏСЂРєР° ^claude)
```

### Р­РІСЂРёСЃС‚РёРєРё

| Р§С‚Рѕ РЅР°РїРёСЃР°Р» | РљСѓРґР° СѓР№РґРµС‚ |
|---|---|
| СЃРѕРґРµСЂР¶РёС‚ `glm-5.3` / `glm-5` | `zaicoding_glm-5.3` (РёР»Рё `flash` / `turbo` РµСЃР»Рё РµСЃС‚СЊ СЃР»РѕРІРѕ) |
| СЃРѕРґРµСЂР¶РёС‚ `glm-coding` / `coding` | `zaicoding_glm-5.3` |
| СЃРѕРґРµСЂР¶РёС‚ `deepseek` / `auto` | `zai_auto` |
| РІСЃРµ РѕСЃС‚Р°Р»СЊРЅРѕРµ | `zai_glm-5.3-flash` (РґРµС„РѕР»С‚) |

### РљР°СЃС‚РѕРјРЅР°СЏ РјР°РїР°

```bash
MODEL_MAP_JSON='{"my-fast":"zai_glm-5-turbo","my-smart":"zaicoding_glm-5.3"}' npm start
```

РџРѕСЃР»Рµ СЌС‚РѕРіРѕ РЅРѕРІС‹Рµ ID СЃСЂР°Р·Сѓ РїРѕСЏРІСЏС‚СЃСЏ РІ `GET /v1/models`.

---

## API

<div align="center">

| РњРµС‚РѕРґ | РџСѓС‚СЊ | РћРїРёСЃР°РЅРёРµ | РђСѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ |
|---|---|---|---|
| `GET` | `/` | РРЅС„РѕСЂРјР°С†РёСЏ Рѕ РїСЂРѕРєСЃРё Рё СЃРїРёСЃРѕРє СЌРЅРґРїРѕРёРЅС‚РѕРІ | РЅРµС‚ |
| `GET` | `/health`, `/v1/health`, `/ping` | Р—РґРѕСЂРѕРІСЊРµ, РґРµС‚Р°Р»Рё, РїР°РјСЏС‚СЊ | РЅРµС‚ |
| `GET` | `/v1/models` | РЎРїРёСЃРѕРє РјРѕРґРµР»РµР№ РІ С„РѕСЂРјР°С‚Рµ OpenAI | РґР° |
| `POST` | `/v1/chat/completions` | Р§Р°С‚, СЃРѕРІРјРµСЃС‚РёРјС‹Р№ СЃ OpenAI | РґР° |
| `POST` | `/v1/messages` | Р§Р°С‚, СЃРѕРІРјРµСЃС‚РёРјС‹Р№ СЃ Anthropic | РґР° |

<sub>В«РґР°В» вЂ” С‚СЂРµР±СѓРµС‚ Р·Р°РіРѕР»РѕРІРѕРє <code>Authorization: Bearer &lt;PROXY_API_KEY&gt;</code> РµСЃР»Рё РєР»СЋС‡ Р·Р°РґР°РЅ. РўР°РєР¶Рµ РїСЂРёРЅРёРјР°СЋС‚СЃСЏ <code>X-Api-Key</code>, <code>X-Authorization</code>, <code>?api_key=</code></sub>

</div>

### Р—Р°РіРѕР»РѕРІРєРё Р±СЌРєРµРЅРґР°

РљР°Р¶РґС‹Р№ Р·Р°РїСЂРѕСЃ Рє `ZAI_BACKEND_URL` Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїРѕР»СѓС‡Р°РµС‚:

```
Authorization: Bearer autoclaw-internal-proxy
X-Authorization: <JWT РёР· С„Р°Р№Р»Р°>
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

### РљРѕРґС‹ РѕС€РёР±РѕРє

| РљРѕРґ | РљРѕРіРґР° |
|---|---|
| `400` | РќРµРІР°Р»РёРґРЅС‹Р№ JSON, РїСѓСЃС‚С‹Рµ `messages`, РЅРµРІРµСЂРЅР°СЏ СЂРѕР»СЊ |
| `401` | РќРµРІРµСЂРЅС‹Р№ `PROXY_API_KEY` |
| `405` | РќРµ С‚РѕС‚ HTTP-РјРµС‚РѕРґ |
| `413` | РўРµР»Рѕ Р±РѕР»СЊС€Рµ `BODY_LIMIT_BYTES` |
| `502` | Р‘СЌРєРµРЅРґ РІРµСЂРЅСѓР» РЅРµ-JSON РёР»Рё СЃРµС‚РµРІРѕР№ СЃР±РѕР№ |
| `504` | РўР°Р№РјР°СѓС‚ Р±СЌРєРµРЅРґР° |

---

## РџСЂРёРјРµСЂС‹

### OpenAI вЂ” РѕР±С‹С‡РЅС‹Р№ Р·Р°РїСЂРѕСЃ

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROXY_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "temperature": 0.7,
    "messages": [
      {"role": "system", "content": "РўС‹ вЂ” РїРѕР»РµР·РЅС‹Р№ Р°СЃСЃРёСЃС‚РµРЅС‚."},
      {"role": "user", "content": "РќР°РїРёС€Рё С„СѓРЅРєС†РёСЋ Р¤РёР±РѕРЅР°С‡С‡Рё РЅР° Python"}
    ]
  }' | jq
```

### OpenAI вЂ” РїРѕС‚РѕРє (SSE)

```bash
curl -N http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "stream": true,
    "stream_options": {"include_usage": true},
    "messages": [{"role":"user","content":"Р Р°СЃСЃРєР°Р¶Рё РїСЂРѕ РєРѕСЃРјРѕСЃ"}]
  }'
```

```
data: {"id":"chatcmpl-...","choices":[{"delta":{"content":"РљРѕСЃРјРѕСЃ"}}]}
data: {"id":"chatcmpl-...","choices":[{"delta":{"content":" вЂ” СЌС‚Рѕ"}}]}
...
data: {"choices":[],"usage":{"prompt_tokens":10,"completion_tokens":120}}
data: [DONE]
```

### OpenAI вЂ” РІС‹Р·РѕРІ РёРЅСЃС‚СЂСѓРјРµРЅС‚РѕРІ

```bash
curl http://localhost:18888/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role":"user","content":"РљР°РєР°СЏ РїРѕРіРѕРґР° РІ РњРѕСЃРєРІРµ?"}],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "РЈР·РЅР°С‚СЊ РїРѕРіРѕРґСѓ РІ РіРѕСЂРѕРґРµ",
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

### Anthropic вЂ” РѕР±С‹С‡РЅС‹Р№ Р·Р°РїСЂРѕСЃ

```bash
curl http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $PROXY_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 1024,
    "messages": [
      {"role":"user","content":"РџСЂРёРІРµС‚! РћР±СЉСЏСЃРЅРё РєРІР°РЅС‚РѕРІСѓСЋ Р·Р°РїСѓС‚Р°РЅРЅРѕСЃС‚СЊ РїСЂРѕСЃС‚С‹РјРё СЃР»РѕРІР°РјРё."}
    ]
  }' | jq
```

### Anthropic вЂ” РїРѕС‚РѕРє

```bash
curl -N http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 2048,
    "stream": true,
    "messages": [{"role":"user","content":"РќР°РїРёС€Рё СЂР°СЃСЃРєР°Р· РїСЂРѕ СЂРѕР±РѕС‚Р°"}]
  }'
```

```
event: message_start
data: {"type":"message_start","message":{"id":"msg_...","model":"claude-sonnet-4-5"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Р–РёР»-Р±С‹Р»"}}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"}}

event: message_stop
data: {"type":"message_stop"}
```

### Anthropic вЂ” tool_use (Claude Code)

```bash
curl http://localhost:18888/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 2048,
    "messages": [{"role":"user","content":"РЎРѕР·РґР°Р№ С„Р°Р№Р» hello.py СЃ РїСЂРёРІРµС‚СЃС‚РІРёРµРј"}],
    "tools": [{
      "name": "write_file",
      "description": "Р—Р°РїРёСЃР°С‚СЊ С„Р°Р№Р»",
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
    api_key="РЅРµРІР°Р¶РЅРѕ-РµСЃР»Рё-PROXY_API_KEY-РЅРµ-Р·Р°РґР°РЅ",
)

stream = client.chat.completions.create(
    model="glm-5.3",
    messages=[{"role": "user", "content": "РџСЂРёРІРµС‚!"}],
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
    messages=[{"role": "user", "content": "РџСЂРёРІРµС‚!"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Claude Code

```bash
# РїРµСЂРµРјРµРЅРЅС‹Рµ РѕРєСЂСѓР¶РµРЅРёСЏ
export ANTHROPIC_BASE_URL=http://localhost:18888
export ANTHROPIC_API_KEY=dummy
# РёР»Рё
export ANTHROPIC_AUTH_TOKEN=dummy

claude --model claude-sonnet-4-5 "РѕР±СЉСЏСЃРЅРё СЌС‚РѕС‚ РєРѕРґ"
```

> РџСЂРѕРєСЃРё Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё СЃРјР°РїРёС‚ `claude-sonnet-4-5` РІ `zaicoding_glm-5.3`, РєРѕРЅРІРµСЂС‚РёСЂСѓРµС‚ `tool_use` РІ `tool_calls`, `thinking` РІ `reasoning_content`, РєР°СЂС‚РёРЅРєРё `base64/url`, РґРѕРєСѓРјРµРЅС‚С‹ Рё `tool_result`.

---

## Claude Code вЂ” РїРѕР»РЅР°СЏ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚СЊ

<div align="center">

<img src="assets/convert-banner.svg" alt="convert">

</div>

---

## РЎС‚СЂСѓРєС‚СѓСЂР° РїСЂРѕРµРєС‚Р°

```
zai-proxy/
в”њв”Ђв”Ђ src/
в”‚   в”њв”Ђв”Ђ index.ts              # С‚РѕС‡РєР° РІС…РѕРґР°, graceful shutdown, СЃРёРіРЅР°Р»С‹
в”‚   в”њв”Ђв”Ђ server.ts             # HTTP-СЃРµСЂРІРµСЂ, CORS, Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ, СЂРѕСѓС‚РёРЅРі
в”‚   в”њв”Ђв”Ђ config.ts             # Р·Р°РіСЂСѓР·РєР° Рё РІР°Р»РёРґР°С†РёСЏ РїРµСЂРµРјРµРЅРЅС‹С… РѕРєСЂСѓР¶РµРЅРёСЏ
в”‚   в”њв”Ђв”Ђ auth.ts               # JWT-РєСЌС€ РїРѕ mtime/size, cooldown 50 РјСЃ
в”‚   в”њв”Ђв”Ђ backend.ts            # fetch СЃ СЂРµС‚СЂР°СЏРјРё, Retry-After, backoff Рё jitter
в”‚   в”њв”Ђв”Ђ models.ts             # MODEL_MAP, resolveModel, СЌРІСЂРёСЃС‚РёРєРё
в”‚   в”њв”Ђв”Ђ handlers/
в”‚   в”‚   в”њв”Ђв”Ђ openai.ts         # /v1/chat/completions, SSE, heartbeat
в”‚   в”‚   в””в”Ђв”Ђ anthropic.ts      # /v1/messages, РІР°Р»РёРґР°С†РёСЏ, РєРѕРЅРІРµСЂС‚Р°С†РёСЏ
в”‚   в”њв”Ђв”Ђ convert/
в”‚   в”‚   в”њв”Ђв”Ђ anthropic-to-openai.ts   # СЃРёСЃС‚РµРјР°, РєР°СЂС‚РёРЅРєРё, С‚СѓР»Р·С‹ в†’ OpenAI
в”‚   в”‚   в””в”Ђв”Ђ openai-to-anthropic.ts   # С‡Р°РЅРєРё, usage, thinking в†’ Anthropic SSE
в”‚   в”њв”Ђв”Ђ types/
в”‚   в”‚   в”њв”Ђв”Ђ openai.ts
в”‚   в”‚   в””в”Ђв”Ђ anthropic.ts
в”‚   в””в”Ђв”Ђ utils/
в”‚       в”њв”Ђв”Ђ sse.ts            # sseEncode, sseDone
в”‚       в””в”Ђв”Ђ logger.ts         # СѓСЂРѕРІРЅРё Р»РѕРіРѕРІ Рё JSON-С„РѕСЂРјР°С‚
в”њв”Ђв”Ђ dist/                     # СЃР±РѕСЂРєР° (tsc)
в”њв”Ђв”Ђ package.json
в””в”Ђв”Ђ tsconfig.json
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

## Р§Р°СЃС‚С‹Рµ РІРѕРїСЂРѕСЃС‹

<details>
<summary>Р—Р°С‡РµРј РЅСѓР¶РµРЅ РїСЂРѕРєСЃРё, РµСЃР»Рё РјРѕР¶РЅРѕ РІС‹Р·С‹РІР°С‚СЊ z.ai РЅР°РїСЂСЏРјСѓСЋ</summary>

z.ai РіРѕРІРѕСЂРёС‚ РЅР° СЃРІРѕРµРј РґРёР°Р»РµРєС‚Рµ. РљР»РёРµРЅС‚С‹ РІСЂРѕРґРµ Claude Code РёР»Рё OpenAI SDK вЂ” РЅР° СЃРІРѕРµРј. РџСЂРѕРєСЃРё РІС‹СЃС‚СѓРїР°РµС‚ РїРµСЂРµРІРѕРґС‡РёРєРѕРј Рё РЅРµ С‚СЂРµР±СѓРµС‚ РјРµРЅСЏС‚СЊ РєР»РёРµРЅС‚СЃРєРёР№ РєРѕРґ.

</details>

<details>
<summary>РќСѓР¶РµРЅ Р»Рё РєР»СЋС‡ OpenAI РёР»Рё Anthropic</summary>

РќРµС‚. Р”РѕСЃС‚Р°С‚РѕС‡РЅРѕ JWT РёР· `request-headers.json`. Р•СЃР»Рё `PROXY_API_KEY` РЅРµ Р·Р°РґР°РЅ вЂ” РїСЂРѕРєСЃРё РѕС‚РєСЂС‹С‚ Р»РѕРєР°Р»СЊРЅРѕ. Р•СЃР»Рё Р·Р°РґР°РЅ вЂ” СѓРєР°Р¶Рё РµРіРѕ РєР°Рє `Authorization: Bearer ...` РІ РєР»РёРµРЅС‚Рµ.

</details>

<details>
<summary>РџРѕС‚РѕРє РїСЂРµСЂС‹РІР°РµС‚СЃСЏ С‡РµСЂРµР· РјРёРЅСѓС‚Сѓ</summary>

РџСЂРѕРІРµСЂСЊ, С‡С‚Рѕ `BACKEND_TIMEOUT_MS` РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ Р±РѕР»СЊС€РѕР№ (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ 120 СЃРµРєСѓРЅРґ). Р”Р»СЏ РґР»РёРЅРЅС‹С… РіРµРЅРµСЂР°С†РёР№ РїРѕСЃС‚Р°РІСЊ `0` (Р±РµР· С‚Р°Р№РјР°СѓС‚Р°). Heartbeat РєР°Р¶РґС‹Рµ 15 СЃРµРєСѓРЅРґ СѓР¶Рµ СѓРґРµСЂР¶РёРІР°РµС‚ СЃРѕРµРґРёРЅРµРЅРёРµ.

</details>

<details>
<summary>РљР°Рє РґРѕР±Р°РІРёС‚СЊ СЃРІРѕСЋ РјРѕРґРµР»СЊ</summary>

```bash
MODEL_MAP_JSON='{"my-model":"zai_custom_backend_id"}' npm start
```

РћРЅР° СЃСЂР°Р·Сѓ РїРѕСЏРІРёС‚СЃСЏ РІ `GET /v1/models`.

</details>

<details>
<summary>Р“РґРµ РїРѕСЃРјРѕС‚СЂРµС‚СЊ Р»РѕРіРё</summary>

Р’ stdout. `LOG=debug` вЂ” РїРѕРґСЂРѕР±РЅРѕ, `LOG_JSON=1` вЂ” JSON РґР»СЏ Р°РіСЂРµРіР°С‚РѕСЂРѕРІ. Р’ РєР°Р¶РґРѕРј РѕС‚РІРµС‚Рµ РµСЃС‚СЊ `X-Request-Id` РґР»СЏ С‚СЂРµР№СЃРёРЅРіР°.

</details>

---

## РЎРєСЂРёРїС‚С‹

| РљРѕРјР°РЅРґР° | Р§С‚Рѕ РґРµР»Р°РµС‚ |
|---|---|
| `npm run dev` | Р—Р°РїСѓСЃРє СЃ Р°РІС‚РѕРїРµСЂРµР·Р°РїСѓСЃРєРѕРј (`tsx watch`) |
| `npm run build` | РљРѕРјРїРёР»СЏС†РёСЏ `tsc` РІ `dist/` |
| `npm start` | Р—Р°РїСѓСЃРє СЃРѕР±СЂР°РЅРЅРѕРіРѕ `dist/index.js` |
| `npm run typecheck` | РџСЂРѕРІРµСЂРєР° С‚РёРїРѕРІ Р±РµР· СЃР±РѕСЂРєРё |
| `npm run clean` | РЈРґР°Р»РµРЅРёРµ `dist/` |

---

## Р›РёС†РµРЅР·РёСЏ

**MIT** вЂ” РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє СѓРіРѕРґРЅРѕ, СЃРѕС…СЂР°РЅСЏСЏ СѓРІРµРґРѕРјР»РµРЅРёРµ РѕР± Р°РІС‚РѕСЂСЃРєРёС… РїСЂР°РІР°С….

---

<div align="center">

<img src="assets/footer.svg" alt="footer">

<sub>РќР°С€Р»Рё РѕС€РёР±РєСѓ РІ README РёР»Рё РµСЃС‚СЊ РёРґРµСЏ вЂ” РѕС‚РєСЂС‹РІР°Р№С‚Рµ Issue РёР»Рё Pull Request</sub>

</div>
