import Redis from 'ioredis';
import { getEnv } from './env';
import { loggers } from '../lib/logger';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    const env = getEnv();
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
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
  }
  return redisInstance;
}

export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}
