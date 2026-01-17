import crypto from 'crypto';
import { getRedis } from '../config/redis';
import { getEnv } from '../config/env';
import { loggers } from './logger';

const log = loggers.oauth;

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const REDIS_KEY_PREFIX = 'oauth:state:';

interface StateData {
  userId: string;
  expiresAt: number;
}

/**
 * OAuth State Store - Manages OAuth state parameters to prevent CSRF attacks
 *
 * Uses Redis in production, falls back to in-memory Map for development without Redis
 */
class OAuthStateStore {
  private inMemoryStates = new Map<string, StateData>();

  private useRedis(): boolean {
    const env = getEnv();
    return env.NODE_ENV === 'production' && !!env.REDIS_URL;
  }

  /**
   * Generate a secure random state string and store it with the user ID
   */
  async generate(userId: string): Promise<string> {
    const state = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + STATE_TTL_MS;

    if (this.useRedis()) {
      try {
        const redis = getRedis();
        const key = `${REDIS_KEY_PREFIX}${state}`;
        await redis.set(key, JSON.stringify({ userId, expiresAt }), 'PX', STATE_TTL_MS);
        log.debug({ state, userId }, 'OAuth state stored in Redis');
      } catch (error) {
        log.error({ err: error }, 'Failed to store OAuth state in Redis, falling back to memory');
        this.inMemoryStates.set(state, { userId, expiresAt });
      }
    } else {
      this.inMemoryStates.set(state, { userId, expiresAt });
      log.debug({ state, userId }, 'OAuth state stored in memory');
    }

    return state;
  }

  /**
   * Validate a state string and return the associated user ID
   * Returns { valid: boolean, userId?: string }
   *
   * If valid, the state is consumed (deleted) to prevent replay attacks
   */
  async validate(state: string): Promise<{ valid: boolean; userId?: string }> {
    let data: StateData | null = null;

    if (this.useRedis()) {
      try {
        const redis = getRedis();
        const key = `${REDIS_KEY_PREFIX}${state}`;
        const value = await redis.get(key);

        if (value) {
          data = JSON.parse(value) as StateData;
          // Delete the state to prevent replay attacks
          await redis.del(key);
          log.debug({ state, userId: data.userId }, 'OAuth state validated and consumed from Redis');
        }
      } catch (error) {
        log.error({ err: error }, 'Failed to validate OAuth state in Redis');
      }
    }

    // Fall back to in-memory if Redis didn't find it
    if (!data) {
      data = this.inMemoryStates.get(state) || null;
      if (data) {
        this.inMemoryStates.delete(state);
        log.debug({ state, userId: data.userId }, 'OAuth state validated and consumed from memory');
      }
    }

    if (!data) {
      log.warn({ state }, 'OAuth state not found or expired');
      return { valid: false };
    }

    if (Date.now() > data.expiresAt) {
      log.warn({ state, userId: data.userId }, 'OAuth state expired');
      return { valid: false };
    }

    return { valid: true, userId: data.userId };
  }

  /**
   * Delete a state without validation (for cleanup)
   */
  async delete(state: string): Promise<void> {
    if (this.useRedis()) {
      try {
        const redis = getRedis();
        await redis.del(`${REDIS_KEY_PREFIX}${state}`);
      } catch (error) {
        log.error({ err: error }, 'Failed to delete OAuth state from Redis');
      }
    }

    this.inMemoryStates.delete(state);
  }

  /**
   * Clean up expired in-memory states (should be called periodically in dev)
   */
  cleanupExpiredStates(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [state, data] of this.inMemoryStates.entries()) {
      if (now > data.expiresAt) {
        this.inMemoryStates.delete(state);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      log.debug({ cleaned }, 'Cleaned up expired OAuth states from memory');
    }
  }
}

// Singleton instance
export const oauthStateStore = new OAuthStateStore();

// Periodic cleanup for in-memory states (development only)
if (getEnv().NODE_ENV === 'development') {
  setInterval(() => {
    oauthStateStore.cleanupExpiredStates();
  }, 5 * 60 * 1000); // Every 5 minutes
}
