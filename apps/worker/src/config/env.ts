import { z } from 'zod';
import dotenv from 'dotenv';

const envSchema = z.object({
  // Backend REST API
  BACKEND_URL: z.string().url().default('http://localhost:3000'),

  // Shared secret for JWT signing (must match backend's BETTER_AUTH_SECRET)
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
  dotenv.config();
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Environment validation failed:');
      result.error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    cachedEnv = result.data;
  }
  return cachedEnv;
}
