/**
 * SSE helpers — encode/decode по спекам OpenAI (data: <json>\n\n, data: [DONE])
 * и Anthropic (event: <type>\ndata: <json>\n\n).
 */

export function sseEncode(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function sseEncodeEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function sseDone(): string {
  return 'data: [DONE]\n\n';
}

export function sseComment(comment: string): string {
  return `: ${comment}\n\n`;
}

/**
 * Инкрементальный парсер SSE от бэкенда (OpenAI-style).
 * Корректно обрабатывает split по границам чанков, \r\n, BOM, комментарии.
 */
export class SseParser {
  private buf = '';
  private readonly decoder = new TextDecoder();

  push(chunk: Uint8Array, onData: (payload: string) => void): void {
    this.buf += this.decoder.decode(chunk, { stream: true });
    this.drain(onData);
  }

  flush(onData: (payload: string) => void): void {
    this.buf += this.decoder.decode();
    this.drain(onData);
    // Остаток без \n — тоже пробуем распарсить
    const leftover = this.buf.trim();
    if (leftover.startsWith('data:')) {
      const payload = leftover.slice(5).trim();
      if (payload) onData(payload);
    }
    this.buf = '';
  }

  private drain(onData: (payload: string) => void): void {
    const lines = this.buf.split('\n');
    this.buf = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.replace(/\r$/, '').trim();
      if (!line) continue;
      if (line.startsWith(':')) continue; // SSE comment / keepalive
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      onData(payload);
    }
  }
}
