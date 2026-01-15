import { tool } from "ai";
import { type Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// Auto-generated wrapper for MCP tool: monthly_period
// Source: http://localhost:3000/mcp/schema
export const monthly_periodToolWithClient = (
  getClient: () => Promise<Client> | Client,
) =>
  tool({
    description: `GraphQL query: monthly_period`,
    inputSchema: z.object({
      month: z.string().describe("Argument month"),
    }),
    execute: async (args): Promise<string> => {
      const client = await getClient();
      const result = await client.callTool({
        name: "monthly_period",
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
