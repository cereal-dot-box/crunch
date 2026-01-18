import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Backend API (REST base URL)
  BACKEND_URL: z.string().default('http://localhost:3000'),

  // Email Sync
  EMAIL_SYNC_ENABLED: z.string().transform(val => val === 'true').default('true'),
  EMAIL_SYNC_INTERVAL_MINUTES: z.string().transform(val => parseInt(val, 10)).default('5'),

  // Encryption (for IMAP password decryption)
  ENCRYPTION_KEY: z.string().length(64).default('0'.repeat(64)),

  // Shared secret for JWT signing (must match backend's BETTER_AUTH_SECRET)
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

  // Redis for job queue
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Node
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  LOG_LEVEL: z.string().default('info'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!env) {
    env = loadEnv();
  }
  return env;
}
