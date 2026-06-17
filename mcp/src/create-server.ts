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
        "Finance Buddy MCP server — full access to the authenticated user's account. " +
        "Capabilities: profile & currency settings, monthly budgets, expenses (manual/text/receipt), " +
        "category suggestions, alerts, forecasts, spending reports, savings goals, friends, " +
        "shared expense splits, settlements, and notifications. " +
        "Call get_user_profile first when formatting money. Amounts use the user's profile currency " +
        "(GBP, USD, EUR, CAD, AUD, PKR, INR). Destructive tools require confirmationToken from " +
        "request_destructive_confirmation after explicit user confirmation.",
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
