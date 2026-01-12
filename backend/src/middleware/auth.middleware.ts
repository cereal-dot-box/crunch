import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken, extractToken } from '../lib/jwks';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = extractToken(
    request.headers.authorization,
    request.headers.cookie
  );

  if (!token) {
    return reply.status(401).send({ error: 'No authentication token' });
  }

  try {
    const payload = await verifyToken(token);

    // Attach user info to request
    (request as any).userId = payload.sub; // UUID string
    (request as any).userEmail = payload.email;
  } catch (error) {
    request.log.error({ error }, 'Token verification failed');
    return reply.status(401).send({ error: 'Invalid token' });
  }
}
