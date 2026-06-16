import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  aiToolDescriptions,
  aiToolSchemas,
  type AiToolName,
} from "../../src/lib/ai/tools/definitions.js";
import { executeAiTool } from "../../src/lib/ai/tools/executor-core.js";

export function createFinanceBuddyMcpServer(userId: string) {
  const server = new McpServer(
    {
      name: "finance-buddy",
      version: "0.1.0",
    },
    {
      instructions:
        "Finance Buddy MCP server. Manage budgets, expenses, friends, shared expenses, and reports for the authenticated user. Destructive tools require confirmationToken from request_destructive_confirmation.",
    },
  );

  for (const name of Object.keys(aiToolSchemas) as AiToolName[]) {
    server.registerTool(
      name,
      {
        description: aiToolDescriptions[name],
        inputSchema: aiToolSchemas[name],
      },
      async (args: unknown) => {
        const result = await executeAiTool(name, args, {
          userId,
          revalidate: false,
        });

        return {
          content: [{ type: "text" as const, text: result }],
        };
      },
    );
  }

  return server;
}
