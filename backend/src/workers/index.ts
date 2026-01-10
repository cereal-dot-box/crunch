/**
 * BullMQ Worker Entry Point
 * Run with: bun run workers
 */

import { createEmailProcessWorker } from './email-process.worker';
import { closeRedis } from '../config/redis';
import { closeAllQueues } from '../queues/definitions';

// Track active workers for graceful shutdown
const workers: any[] = [];

/**
 * Start all workers
 */
function startWorkers() {
  console.log('[Workers] Starting BullMQ workers...');

  // Create email process worker
  const emailProcessWorker = createEmailProcessWorker();
  workers.push(emailProcessWorker);

  console.log('[Workers] All workers started successfully');
  console.log('[Workers] Press Ctrl+C to stop');
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string) {
  console.log(`\n[Workers] Received ${signal}, shutting down gracefully...`);

  // Close all workers
  for (const worker of workers) {
    try {
      await worker.close();
      console.log(`[Workers] Closed worker`);
    } catch (error) {
      console.error('[Workers] Error closing worker:', error);
    }
  }

  // Close all queue connections
  try {
    await closeAllQueues();
  } catch (error) {
    console.error('[Workers] Error closing queues:', error);
  }

  // Close Redis connection
  try {
    await closeRedis();
  } catch (error) {
    console.error('[Workers] Error closing Redis:', error);
  }

  console.log('[Workers] Shutdown complete');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Workers] Uncaught exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Workers] Unhandled rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Start workers
startWorkers();
