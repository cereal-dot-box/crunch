import Redis from 'ioredis';
import { getEnv } from './env';
import { loggers } from '../lib/logger';

let redisInstance: Redis | null = null;

/**
 * Get or create the Redis connection singleton
 */
export function getRedis(): Redis {
  if (!redisInstance) {
    const env = getEnv();

    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ for blocking commands
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisInstance.on('error', (err) => {
      loggers.redis.error({ err }, 'Connection error');
    });

    redisInstance.on('connect', () => {
      loggers.redis.info('Connected');
    });

    redisInstance.on('disconnect', () => {
      loggers.redis.warn('Disconnected');
    });

    redisInstance.on('ready', () => {
      loggers.redis.info('Ready');
    });
  }

  return redisInstance;
}

/**
 * Close the Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
    loggers.redis.info('Connection closed');
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedis();
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    loggers.redis.error({ err: error }, 'Health check failed');
    return false;
  }
}
