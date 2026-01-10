import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Check if user is authenticated (session has userId)
  if (!request.session.userId) {
    return reply.status(401).send({ error: 'Not authenticated' });
  }

  // Optionally attach userId to request for backward compatibility
  (request as any).userId = request.session.userId;
}
