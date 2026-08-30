/**
 * Outbound concurrency limiter for backend requests.
 *
 * Env: BACKEND_MAX_CONCURRENCY
 *  - "0" or unset  -> unlimited (maximum throughput; the safe default for a
 *    single-user desktop-mirroring proxy — the real desktop client itself does
 *    not limit concurrent model requests)
 *  - "N" (>0)      -> at most N in-flight backend requests; excess requests
 *    queue in FIFO order and are served as slots free up. Use a small value
 *    (e.g. 2-3) if you want the traffic profile to look conservative.
 */
export class ConcurrencyLimiter {
  private readonly max: number;
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(max: number) {
    this.max = Math.max(0, Math.floor(max));
  }

  get unlimited(): boolean {
    return this.max === 0;
  }

  get activeCount(): number {
    return this.active;
  }

  get queuedCount(): number {
    return this.queue.length;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.unlimited) return fn();
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active += 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }

  private release(): void {
    const next = this.queue.shift();
    if (next) {
      // hand the slot directly to the next waiter
      next();
      return;
    }
    this.active = Math.max(0, this.active - 1);
  }
}
