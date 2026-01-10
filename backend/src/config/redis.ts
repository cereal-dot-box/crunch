import Redis from 'ioredis';
import { getEnv } from './env';

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
      console.error('[Redis] Connection error:', err);
    });

    redisInstance.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redisInstance.on('disconnect', () => {
      console.warn('[Redis] Disconnected');
    });

    redisInstance.on('ready', () => {
      console.log('[Redis] Ready');
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
    console.log('[Redis] Connection closed');
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
    console.error('[Redis] Health check failed:', error);
    return false;
  }
}
