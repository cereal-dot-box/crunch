import { Queue } from 'bullmq';
import { getRedis } from '../config/redis';
import { QUEUE_NAMES } from './job-types';
import { loggers } from '../lib/logger';

const log = loggers.queue;

const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    count: 100,
    age: 24 * 3600,
  },
  removeOnFail: {
    count: 500,
    age: 7 * 24 * 3600,
  },
};

const queues: Map<string, Queue> = new Map();

export function getEmailProcessQueue(): Queue {
  if (!queues.has(QUEUE_NAMES.EMAIL_PROCESS)) {
    const redis = getRedis();
    const queue = new Queue(QUEUE_NAMES.EMAIL_PROCESS, {
      connection: redis as any,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    queue.on('error', (err) => {
      log.error({ err }, 'Queue error');
    });

    queues.set(QUEUE_NAMES.EMAIL_PROCESS, queue);
  }

  return queues.get(QUEUE_NAMES.EMAIL_PROCESS)!;
}

export async function closeAllQueues(): Promise<void> {
  const closingPromises = Array.from(queues.values()).map((queue) => queue.close());
  await Promise.allSettled(closingPromises);
  queues.clear();
  log.info('All queues closed');
}
