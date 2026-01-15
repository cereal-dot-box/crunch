import { tool } from "ai";
import { type Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// Auto-generated wrapper for MCP tool: sync_sources_by_account
// Source: http://localhost:3000/mcp/schema
export const sync_sources_by_accountToolWithClient = (
  getClient: () => Promise<Client> | Client,
) =>
  tool({
    description: `GraphQL query: sync_sources_by_account`,
    inputSchema: z.object({
      account_id: z.number().describe("Argument account_id"),
    }),
    execute: async (args): Promise<string> => {
      const client = await getClient();
      const result = await client.callTool({
        name: "sync_sources_by_account",
        arguments: args,
      });

      // Handle different content types from MCP
      if (Array.isArray(result.content)) {
        return result.content
          .map((item: unknown) =>
            typeof item === "string" ? item : JSON.stringify(item),
          )
          .join("\n");
      } else if (typeof result.content === "string") {
        return result.content;
      } else {
        return JSON.stringify(result.content);
      }
    },
  });
