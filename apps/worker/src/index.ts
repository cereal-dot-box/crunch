import { loadEnv, getEnv } from './config/env';
import { startQueueWorker, stopQueueWorker } from './workers/queue.worker';
import { startBullBoard, stopBullBoard } from './server/bull-board.server';
import { loggers } from './lib/logger';

const log = loggers.worker;

async function start() {
  loadEnv();
  const env = getEnv();

  log.info('Starting email worker...');

  // Start the queue worker
  await startQueueWorker(env.WORKER_CONCURRENCY);

  // Start Bull Board UI
  await startBullBoard(3002);

  log.info('Worker is ready to process jobs from queue');

  const shutdown = async () => {
    log.info('Shutting down...');
    await stopQueueWorker();
    await stopBullBoard();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  log.fatal({ err: error }, 'Failed to start worker');
  process.exit(1);
});
