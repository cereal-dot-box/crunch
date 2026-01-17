import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { loggers } from '../lib/logger';

const log = loggers.http;

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  log.error({ err: error }, 'Request error');

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  reply.status(statusCode).send({
    error: message,
    statusCode,
  });
}
