import { loadConfig } from './config.js';
import { Logger } from './utils/logger.js';
import { createServer } from './server.js';
import { getModelMapSnapshot } from './models.js';

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error('Failed to load config:', e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  const logger = new Logger(config);
  const server = createServer(config, logger);

  const onListening = (): void => {
    const map = getModelMapSnapshot();
    logger.info(
      `zai-proxy v2.1.0 on http://${config.host}:${config.port} ` +
        `backend=${config.backendUrl} ` +
        `models=${Object.keys(map).length} ` +
        `log=${config.logLevel}${config.logJson ? '+json' : ''} ` +
        `auth=${config.proxyApiKey ? 'enabled' : 'disabled'} ` +
        `limit=${(config.bodyLimitBytes / 1024 / 1024).toFixed(1)}MB ` +
        `timeout=${config.backendTimeoutMs}ms retries=${config.backendMaxRetries}`,
    );
    logger.info(`endpoints: /health /v1/models /v1/chat/completions /v1/messages`);
  };

  server.listen(config.port, config.host, onListening);

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} already in use (is another proxy running?)`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  // Graceful shutdown
  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received — graceful shutdown (5s drain, 10s hard)`);
    // Stop accepting new connections
    server.close((err) => {
      if (err) {
        console.error('shutdown error', err);
        process.exit(1);
      }
      logger.info('all connections drained, exiting');
      process.exit(0);
    });
    // Force close keep-alive after 5s
    setTimeout(() => {
      try {
        // @ts-ignore — closeAllConnections exists Node 18.2+
        if (typeof (server as unknown as { closeAllConnections?: () => void }).closeAllConnections === 'function') {
          (server as unknown as { closeAllConnections: () => void }).closeAllConnections();
        }
      } catch {}
    }, 5_000).unref();

    setTimeout(() => {
      console.error('graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGBREAK' as NodeJS.Signals, shutdown);

  process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
    // keep process alive for serving requests unless it's fatal config error
  });
}

main().catch((e) => {
  console.error('fatal startup error', e);
  process.exit(1);
});
