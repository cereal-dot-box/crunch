import type { FastifyInstance } from 'fastify';
import { McpServer } from './server.js';
import { loggers } from '../lib/logger';

const log = loggers.mcp;

/**
 * Register MCP routes with Fastify
 *
 * This creates a single endpoint `/mcp/sse` that handles MCP protocol
 * requests using Server-Sent Events (SSE) for real-time communication.
 */
export async function registerMCPRoutes(app: FastifyInstance): Promise<void> {
  const mcpServer = McpServer.getInstance();
  await mcpServer.initialize();

  // Register MCP SSE endpoint
  app.all('/mcp/sse', async (request, reply) => {
    try {
      // Extract userId from header (set by authentication middleware)
      const userId = (request.headers['x-user-id'] as string) ||
        (request as any).userId;

      if (!userId) {
        return reply.status(401).send({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32500,
            message: 'Unauthorized: Missing user identification',
          },
        });
      }

      // Handle the MCP request
      await mcpServer.handleRequest(request, reply, userId);
    } catch (error) {
      log.error({ err: error }, 'Error in MCP route');
      reply.code(500).send({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
      });
    }
  });

  // Register health check endpoint
  app.get('/mcp/health', async (_request, reply) => {
    reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown handler
  app.addHook('onClose', async () => {
    await mcpServer.shutdown();
  });

  log.info('MCP routes registered');
}
