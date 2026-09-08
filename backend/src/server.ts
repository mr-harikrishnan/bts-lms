import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`[Server] BSTORM LMS Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`[Server] API Healthcheck available at http://localhost:${env.PORT}/api/health`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      logger.info('[Server] HTTP server closed.');
      await disconnectDatabase();
      logger.info('[Server] Graceful shutdown complete. Exiting process.');
      process.exit(0);
    });

    // Force close if graceful shutdown hangs
    setTimeout(() => {
      logger.error('[Server] Graceful shutdown timed out. Forcing termination.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
