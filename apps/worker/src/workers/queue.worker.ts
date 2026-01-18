import { Worker } from 'bullmq';
import { getRedis } from '../config/redis';
import { QUEUE_NAMES } from '../queues/job-types';
import { processEmailJob } from './email-process.worker';
import { loggers } from '../lib/logger';

const log = loggers.queue;

let worker: Worker | null = null;

export async function startQueueWorker(concurrency: number = 5) {
  const redis = getRedis();

  worker = new Worker(
    QUEUE_NAMES.EMAIL_PROCESS,
    async (job) => {
      return await processEmailJob(job.data);
    },
    {
      connection: redis as any,
      concurrency,
      limiter: {
        max: 100,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job, result) => {
    log.debug({
      jobId: job.id,
      uid: job.data.message.uid,
      result,
    }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    log.error({
      jobId: job?.id,
      uid: job?.data.message.uid,
      subject: job?.data.message.subject,
      attemptsMade: job?.attemptsMade,
      err,
    }, 'Job failed');
  });

  log.info('Queue worker started');
}

export async function stopQueueWorker() {
  if (worker) {
    await worker.close();
    worker = null;
    log.info('Queue worker stopped');
  }
}
