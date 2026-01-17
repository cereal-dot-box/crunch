import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyServiceToken, extractToken } from '../lib/jwks';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const token = extractToken(request.headers.authorization);

  if (!token) {
    return reply.status(401).send({ error: 'No authentication token' });
  }

  try {
    const payload = await verifyServiceToken(token);

    // Attach service info to request
    (request as any).serviceClient = payload.sub;
  } catch (error) {
    request.log.error({ error }, 'Token verification failed');
    return reply.status(401).send({ error: 'Invalid token' });
  }
}
