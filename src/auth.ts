import * as fs from 'node:fs';

interface CachedJwt {
  jwt: string;
  mtimeMs: number;
  size: number;
}

let cache: CachedJwt | null = null;
let lastReadAttempt = 0;
const READ_COOLDOWN_MS = 50;

/**
 * Читает JWT из request-headers.json с кэшем по mtime+size.
 * - Проверяет stat перед чтением (быстрая ветка cache-hit).
 * - Сохраняет последний успешный jwt при временных ошибках (EAGAIN / partially written).
 * - Cooldown между попытками чтения несуществующего файла, чтобы не спамить stat.
 */
export function readJwtCached(reqHeadersPath: string): string {
  const now = Date.now();

  try {
    const stat = fs.statSync(reqHeadersPath);
    const mtimeMs = stat.mtimeMs;
    const size = stat.size;

    if (cache !== null && cache.mtimeMs === mtimeMs && cache.size === size) {
      return cache.jwt;
    }

    // Быстрый выход если файл пустой
    if (size === 0) {
      return cache?.jwt ?? '';
    }

    const raw = fs.readFileSync(reqHeadersPath, 'utf8');
    // Trim BOM
    const trimmed = raw.trim();
    if (!trimmed) return cache?.jwt ?? '';

    const parsed: unknown = JSON.parse(trimmed);
    let jwt = '';

    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'headers' in parsed &&
      (parsed as { headers: unknown }).headers !== null &&
      typeof (parsed as { headers: unknown }).headers === 'object'
    ) {
      const headers = (parsed as { headers: Record<string, unknown> }).headers;
      // Поддерживаем разные кейсы ключа
      const candidates = [
        headers['X-Authorization'],
        headers['x-authorization'],
        (headers as Record<string, unknown>)['X-Authorization'.toLowerCase()],
        (headers as Record<string, unknown>)['authorization'],
      ];
      for (const v of candidates) {
        if (typeof v === 'string' && v.trim()) {
          jwt = v.trim();
          break;
        }
      }
      // Также fallback на верхний уровень { jwt: "..." } или { token: "..." }
      if (!jwt) {
        const alt = (parsed as Record<string, unknown>)['jwt'] ?? (parsed as Record<string, unknown>)['token'];
        if (typeof alt === 'string' && alt.trim()) jwt = alt.trim();
      }
    } else if (parsed !== null && typeof parsed === 'object') {
      // Плоский формат { "X-Authorization": "..." }
      const flat = parsed as Record<string, unknown>;
      if (typeof flat['X-Authorization'] === 'string') jwt = flat['X-Authorization'].trim();
    }

    if (jwt) {
      cache = { jwt, mtimeMs, size };
      return jwt;
    }
    // Если jwt пустой но файл валиден — кэшируем пустой чтобы не читать каждый раз,
    // но сохраняем предыдущий успешный если он был
    if (cache !== null && cache.jwt) return cache.jwt;
    cache = { jwt: '', mtimeMs, size };
    return '';
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code;
    // ENOENT — файла нет, игнорируем и возвращаем кэш если есть
    if (code === 'ENOENT') {
      if (now - lastReadAttempt < READ_COOLDOWN_MS && cache !== null) return cache.jwt;
      lastReadAttempt = now;
      return cache?.jwt ?? '';
    }
    // JSON parse error — файл частично записан, отдаем кэш
    if (cache !== null) return cache.jwt;
    return '';
  }
}

export function clearJwtCache(): void {
  cache = null;
  lastReadAttempt = 0;
}

/** Для /health — показывает актуальность кэша */
export function getJwtCacheInfo(): { cached: boolean; mtimeMs: number | null; size: number | null; hasJwt: boolean } {
  if (cache === null) return { cached: false, mtimeMs: null, size: null, hasJwt: false };
  return { cached: true, mtimeMs: cache.mtimeMs, size: cache.size, hasJwt: !!cache.jwt };
}
