import { Queue } from 'bullmq';
import { getRedis } from '../config/redis';
import { QUEUE_NAMES } from './job-types';

/**
 * Default job options for all queues
 */
const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    count: 100, // Keep last 100 completed jobs
    age: 24 * 3600, // Keep for 24 hours
  },
  removeOnFail: {
    count: 500, // Keep last 500 failed jobs
    age: 7 * 24 * 3600, // Keep for 7 days
  },
};

/**
 * Queue instances singleton
 */
const queues: Map<string, Queue> = new Map();

/**
 * Get or create a queue instance
 */
export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    const redis = getRedis();
    const queue = new Queue(name, {
      connection: redis,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });

    queue.on('error', (err) => {
      console.error(`[Queue:${name}] Error:`, err);
    });

    queues.set(name, queue);
  }

  return queues.get(name)!;
}

/**
 * Get the email process queue
 */
export function getEmailProcessQueue(): Queue {
  return getQueue(QUEUE_NAMES.EMAIL_PROCESS);
}

/**
 * Close all queue connections
 */
export async function closeAllQueues(): Promise<void> {
  const closingPromises = Array.from(queues.values()).map((queue) => queue.close());
  await Promise.allSettled(closingPromises);
  queues.clear();
  console.log('[Queues] All queues closed');
}

/**
 * Obsolete queues - used for cleaning up old queue data if needed
 */
export async function cleanObsoleteQueues(): Promise<void> {
  // Add logic here if we need to clean up old queue data
}

/**
 * Pause a queue (for maintenance)
 */
export async function pauseQueue(name: string): Promise<void> {
  const queue = getQueue(name);
  await queue.pause();
  console.log(`[Queue:${name}] Paused`);
}

/**
 * Resume a paused queue
 */
export async function resumeQueue(name: string): Promise<void> {
  const queue = getQueue(name);
  await queue.resume();
  console.log(`[Queue:${name}] Resumed`);
}

/**
 * Get queue stats (useful for monitoring)
 */
export async function getQueueStats(name: string): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getQueue(name);

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}
