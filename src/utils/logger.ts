import type { ProxyConfig } from '../config.js';

export type LogLevel = 'debug' | 'info' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, error: 2 };

export class Logger {
  private readonly level: LogLevel;
  private readonly json: boolean;

  constructor(config: Pick<ProxyConfig, 'logLevel' | 'logJson'>) {
    this.level = config.logLevel;
    this.json = config.logJson;
  }

  private should(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[this.level];
  }

  private write(level: LogLevel, requestId: string | undefined, args: unknown[]): void {
    if (!this.should(level)) return;
    const ts = new Date().toISOString();
    if (this.json) {
      const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      const line = JSON.stringify({
        ts,
        level,
        ...(requestId ? { rid: requestId } : {}),
        msg,
      });
      if (level === 'error') console.error(line);
      else console.log(line);
      return;
    }
    if (requestId) {
      if (level === 'error') console.error(ts, `[${requestId}]`, ...args);
      else console.log(ts, `[${requestId}]`, ...args);
    } else {
      if (level === 'error') console.error(ts, ...args);
      else console.log(ts, ...args);
    }
  }

  debug(requestId: string, ...args: unknown[]): void {
    this.write('debug', requestId, args);
  }

  info(...args: unknown[]): void {
    this.write('info', undefined, args);
  }

  infoWithId(requestId: string, ...args: unknown[]): void {
    this.write('info', requestId, args);
  }

  error(requestId: string, ...args: unknown[]): void {
    this.write('error', requestId, args);
  }

  // совместимость со старым вызовом logger.infoPlain
  infoPlain(...args: unknown[]): void {
    this.write('info', undefined, args);
  }
}
