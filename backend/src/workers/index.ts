/**
 * BullMQ Worker Entry Point
 * Run with: bun run workers
 */

import { createEmailProcessWorker } from './email-process.worker';
import { closeRedis } from '../config/redis';
import { closeAllQueues } from '../queues/definitions';
import { loggers } from '../lib/logger';

const log = loggers.worker;

// Track active workers for graceful shutdown
const workers: any[] = [];

/**
 * Start all workers
 */
function startWorkers() {
  log.info('Starting BullMQ workers...');

  // Create email process worker
  const emailProcessWorker = createEmailProcessWorker();
  workers.push(emailProcessWorker);

  log.info('All workers started successfully');
  log.info('Press Ctrl+C to stop');
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string) {
  log.info({ signal }, 'Received signal, shutting down gracefully...');

  // Close all workers
  for (const worker of workers) {
    try {
      await worker.close();
      log.debug('Closed worker');
    } catch (error) {
      log.error({ err: error }, 'Error closing worker');
    }
  }

  // Close all queue connections
  try {
    await closeAllQueues();
  } catch (error) {
    log.error({ err: error }, 'Error closing queues');
  }

  // Close Redis connection
  try {
    await closeRedis();
  } catch (error) {
    log.error({ err: error }, 'Error closing Redis');
  }

  log.info('Shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log.fatal({ err: error }, 'Uncaught exception');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  log.fatal({ reason, promise }, 'Unhandled rejection');
  shutdown('unhandledRejection');
});

// Start workers
startWorkers();
