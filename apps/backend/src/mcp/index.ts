import type { FastifyInstance } from 'fastify';
import { McpServer } from './server.js';
import { generateGraphQLTools } from './generate-tools.js';
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

      // Handle GET requests - return 200 OK for connection check
      // @ai-sdk/mcp client makes a GET request first before POST requests
      if (request.method === 'GET') {
        return reply.status(200).send({ status: 'ok' });
      }

      // Handle the MCP request (POST)
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

  // Unauthenticated endpoint for tool schema generation (mcp-to-ai-sdk)
  // This allows generating static tool definitions without auth
  app.all('/mcp/schema', async (request, reply) => {
    const body = request.body as { method?: string; id?: string | number } | undefined;

    // Handle tools/list for mcp-to-ai-sdk CLI
    if (request.method === 'GET' || body?.method === 'tools/list') {
      const { tools } = generateGraphQLTools();
      return reply.send({
        jsonrpc: '2.0',
        id: body?.id ?? 1,
        result: { tools },
      });
    }

    // Handle initialize request
    if (body?.method === 'initialize') {
      return reply.send({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'crunch-financial-mcp',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
          },
        },
      });
    }

    // Handle notifications (no response needed)
    if (body?.method === 'notifications/initialized') {
      return reply.code(202).send();
    }

    return reply.status(400).send({
      jsonrpc: '2.0',
      id: body?.id ?? null,
      error: {
        code: -32601,
        message: 'Method not allowed on schema endpoint',
      },
    });
  });

  // Graceful shutdown handler
  app.addHook('onClose', async () => {
    await mcpServer.shutdown();
  });

  log.info('MCP routes registered');
}
