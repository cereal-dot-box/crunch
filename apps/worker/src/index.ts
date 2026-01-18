import { loadEnv } from './config/env';
import { processEmailJob, addDLQEntry, type EmailProcessJobData } from './workers/email-process.worker';
import { loggers } from './lib/logger';

const log = loggers.worker;

async function start() {
  loadEnv();
  log.info('Starting email worker...');

  // TODO: Job processing setup (BullMQ or other mechanism)
  // For now: simple test function
  log.info('Email worker started');
  log.info('Worker is ready to process emails via REST API');

  const shutdown = async () => {
    log.info('Shutting down...');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Export for testing
export { processEmailJob, addDLQEntry };
export type { EmailProcessJobData };

start().catch((error) => {
  log.fatal({ err: error }, 'Failed to start worker');
  process.exit(1);
});
