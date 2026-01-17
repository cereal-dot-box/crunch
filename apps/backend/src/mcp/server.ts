import { generateGraphQLTools } from './generate-tools.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { loggers } from '../lib/logger';

const log = loggers.mcp;

// Generate tools from GraphQL schema
const { tools, toolHandlers, toolSchemas } = generateGraphQLTools();

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPContext {
  userId: string;
  sessionId: string;
}

/**
 * McpServer - Singleton MCP server instance
 *
 * Handles JSON-RPC 2.0 MCP protocol requests over HTTP.
 * Each session maintains its own context for user isolation.
 */
export class McpServer {
  private static instance: McpServer | null = null;
  private sessions: Map<string, MCPContext> = new Map();
  private isInitialized = false;

  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): McpServer {
    if (!McpServer.instance) {
      McpServer.instance = new McpServer();
    }
    return McpServer.instance;
  }

  /**
   * Initialize the MCP server
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Just mark as initialized - we'll handle requests directly
    this.isInitialized = true;
    log.info('MCP server initialized');
  }

  /**
   * Handle tools/list request
   */
  private async handleToolsList(): Promise<{ tools: typeof tools }> {
    return { tools };
  }

  /**
   * Handle tools/call request
   */
  private async handleToolCall(
    name: string,
    args: Record<string, any>,
    context: MCPContext
  ): Promise<any> {
    // Get the handler for this tool
    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Call the handler with userId from context
    // Note: GraphQL resolvers will handle validation
    return await handler(context.userId, args);
  }

  /**
   * Handle an incoming MCP request via HTTP
   */
  async handleRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    userId: string
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MCP server not initialized');
    }

    // Extract session ID from header or generate one
    const sessionId = (request.headers['mcp-session-id'] as string) ||
      `${userId}-${Date.now()}`;

    // Store session context
    const context: MCPContext = { userId, sessionId };
    this.sessions.set(sessionId, context);

    // Get the request body
    const body = request.body as JSONRPCRequest;

    log.debug({ method: body.method, sessionId, userId }, 'Handling MCP request');

    // Check if this is a notification (no id) - notifications don't expect responses
    const isNotification = body.id === null || body.id === undefined;

    try {
      let result: any;

      // Route to appropriate handler
      switch (body.method) {
        case 'tools/list':
          result = await this.handleToolsList();
          break;

        case 'tools/call':
          result = await this.handleToolCall(
            body.params?.name,
            body.params?.arguments || {},
            context
          );
          break;

        case 'initialize':
          // Handle MCP initialization
          result = {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'crunch-financial-mcp',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
            },
          };
          break;

        case 'notifications/initialized':
          // Client notification that initialization is complete
          // Per MCP spec, return 202 Accepted for notifications
          log.debug({ sessionId }, 'Received initialized notification');
          reply.code(202).send();
          return;

        default:
          throw new Error(`Unknown method: ${body.method}`);
      }

      // Send successful response (only for non-notification requests)
      if (!isNotification) {
        const response: JSONRPCResponse = {
          jsonrpc: '2.0',
          id: body.id,
          result,
        };
        reply.send(response);
      } else {
        // Per MCP spec, notifications get 202 Accepted
        reply.code(202).send();
      }
    } catch (error) {
      log.error({ err: error, method: body.method, sessionId }, 'Error handling MCP request');

      // Send error response
      const response: JSONRPCResponse = {
        jsonrpc: '2.0',
        id: body.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
      };

      reply.code(500).send(response);
    }
  }

  /**
   * Gracefully shutdown the MCP server
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    log.info('Shutting down MCP server...');

    this.sessions.clear();
    this.isInitialized = false;

    log.info('MCP server shut down complete');
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}
