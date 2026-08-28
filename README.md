<div align="center">

<!-- HERO BANNER -->
<img src="assets/hero.svg" alt="zai-proxy hero">

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
<img src="assets/features.svg" alt="features">

</div>

<a id="возможности"></a>

---

## Архитектура

<div align="center">

<img src="assets/architecture.svg" alt="architecture">

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

<img src="assets/ready.svg" alt="ready">

</td>
</tr>
</table>

---

## Конфигурация

> Все настройки — через переменные окружения. Обязательных полей нет — везде заданы разумные значения по умолчанию.

<div align="center">

<img src="assets/env-banner.svg" alt="env">

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

<img src="assets/models-banner.svg" alt="models">

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

<img src="assets/convert-banner.svg" alt="convert">

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

<img src="assets/footer.svg" alt="footer">

<sub>Нашли ошибку в README или есть идея — открывайте Issue или Pull Request</sub>

</div>
