import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  // Auth Service
  AUTH_SERVICE_URL: z.string().default('http://localhost:4000'),

  // Database
  DATABASE_URL: z.string().default('file:./data/crunch.db'),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters'),

  // Email Sync
  EMAIL_SYNC_ENABLED: z.string().transform(val => val === 'true').default('true'),
  EMAIL_SYNC_INTERVAL_MINUTES: z.string().transform(val => parseInt(val, 10)).default('5'),

  // Redis
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),

  // Splitwise OAuth
  SPLITWISE_CLIENT_ID: z.string().optional(),
  SPLITWISE_CLIENT_SECRET: z.string().optional(),
  SPLITWISE_REDIRECT_URI: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Note: Can't use logger here due to circular dependency (logger needs env)
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
