import { SignJWT } from 'jose';
import { getEnv } from '../config/env';

export interface ServiceTokenPayload {
  sub: string; // client_id (e.g., 'crunch-worker')
  name: string; // client name
  type: 'service';
}

/**
 * Generate a service JWT token using shared secret (HS256)
 * This token is used to authenticate the worker with the backend GraphQL API
 */
export async function generateServiceToken(payload: ServiceTokenPayload): Promise<string> {
  const secret = getEnv().BETTER_AUTH_SECRET;
  const encoder = new TextEncoder();

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('crunch-worker')
    .setIssuedAt()
    .setExpirationTime('24h') // Tokens valid for 24 hours
    .sign(encoder.encode(secret));

  return token;
}

/**
 * Get a cached service token for the worker
 * Generates a new token if needed or if the current one is expired
 */
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getServiceToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  // Generate new token
  const payload: ServiceTokenPayload = {
    sub: 'crunch-worker',
    name: 'Crunch Email Worker',
    type: 'service',
  };

  const token = await generateServiceToken(payload);

  // Cache for 24 hours
  cachedToken = {
    token,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };

  return token;
}
