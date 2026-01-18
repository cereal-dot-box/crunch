import { loadEnv } from './config/env';
import { getEmailScheduler } from './services/email/scheduler.service';
import { loggers } from './lib/logger';
import { closeAllQueues } from './queues/definitions';

const log = loggers.scheduler;

async function start() {
  loadEnv();

  log.info('Starting email scheduler...');

  const emailScheduler = getEmailScheduler();
  await emailScheduler.start();

  log.info('Email scheduler started successfully');

  const shutdown = async () => {
    log.info('Shutting down...');
    await emailScheduler.stop();
    await closeAllQueues();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  log.fatal({ err: error }, 'Failed to start scheduler');
  process.exit(1);
});
