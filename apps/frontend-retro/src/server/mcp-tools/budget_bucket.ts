import { tool } from "ai";
import { type Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// Auto-generated wrapper for MCP tool: budget_bucket
// Source: http://localhost:3000/mcp/schema
export const budget_bucketToolWithClient = (
  getClient: () => Promise<Client> | Client,
) =>
  tool({
    description: `GraphQL query: budget_bucket`,
    inputSchema: z.object({
      bucket_id: z.string().describe("Argument bucket_id"),
    }),
    execute: async (args): Promise<string> => {
      const client = await getClient();
      const result = await client.callTool({
        name: "budget_bucket",
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
