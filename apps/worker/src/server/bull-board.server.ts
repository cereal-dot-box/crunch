import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express, { Express } from 'express';
import { getRedis } from '../config/redis';
import { QUEUE_NAMES } from '../queues/job-types';
import { loggers } from '../lib/logger';
import { Queue } from 'bullmq';
import { Server } from 'http';

const log = loggers.worker;

let server: Server | null = null;

export async function startBullBoard(port: number = 3001) {
  const redis = getRedis();

  // Create queues
  const emailProcessQueue = new Queue(QUEUE_NAMES.EMAIL_PROCESS, { connection: redis as any });

  // Create server adapter
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/');

  // Create Bull Board
  createBullBoard({
    queues: [new BullMQAdapter(emailProcessQueue)],
    serverAdapter,
  });

  // Create Express app
  const app = express();

  // Use Bull Board UI
  app.use('/', serverAdapter.getRouter());

  // Start server
  server = app.listen(port, () => {
    log.info({ url: `http://localhost:${port}` }, 'Bull Board UI started');
  });

  return server;
}

export async function stopBullBoard() {
  if (server) {
    server.close(() => {
      log.info('Bull Board UI stopped');
    });
    server = null;
  }
}
