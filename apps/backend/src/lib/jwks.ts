import { jwtVerify } from 'jose';

const AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

export interface ServiceTokenPayload {
  sub: string; // client_id (e.g., 'nitro-frontend')
  name: string; // client name
  type: 'service';
}

/**
 * Verify a service JWT token using shared secret (HS256)
 */
export async function verifyServiceToken(token: string): Promise<ServiceTokenPayload> {
  if (!AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET not configured');
  }

  const secret = new TextEncoder().encode(AUTH_SECRET);
  const { payload } = await jwtVerify(token, secret, {
    issuer: 'auth-service',
  });

  if (payload.type !== 'service') {
    throw new Error('Invalid token type');
  }

  return payload as unknown as ServiceTokenPayload;
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}
