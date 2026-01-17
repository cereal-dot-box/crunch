import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getRequest } from '@tanstack/react-start/server';
import { authClient } from '../../lib/auth-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

/**
 * Get an authenticated MCP client for the current user.
 *
 * Unlike the default generated client which caches a single connection,
 * this creates a new client per request with the user's auth headers.
 */
export async function getMcpClient(): Promise<Client> {
  // Get user session
  const request = getRequest();
  const cookieHeader = request?.headers.get('cookie') || '';
  const { data } = await authClient.getSession({
    fetchOptions: { headers: { Cookie: cookieHeader } },
  });

  if (!data?.user?.id) {
    throw new Error('User not authenticated');
  }

  const userId = data.user.id;

  // Create transport with auth headers
  const transport = new StreamableHTTPClientTransport(
    new URL(`${BACKEND_URL}/mcp/sse`),
    {
      requestInit: {
        headers: {
          'X-User-Id': userId,
        },
      },
    }
  );

  const client = new Client(
    {
      name: "crunch-ai-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );

  await client.connect(transport);
  return client;
}

// Optional: Add cleanup function for graceful shutdown
export async function closeMcpClient(client: Client): Promise<void> {
  await client.close();
}
