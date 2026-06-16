import "dotenv/config";
import { resolveUserIdFromMcpApiKey } from "../../src/lib/auth/mcp-api-key.js";
import { createFinanceBuddyMcpServer } from "./create-server.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const apiKey = process.env.FINANCE_BUDDY_API_KEY;
  if (!apiKey) {
    console.error(
      "FINANCE_BUDDY_API_KEY is required. Create one in Settings → API keys for MCP.",
    );
    process.exit(1);
  }

  const userId = await resolveUserIdFromMcpApiKey(`Bearer ${apiKey}`);
  if (!userId) {
    console.error("Invalid or revoked FINANCE_BUDDY_API_KEY.");
    process.exit(1);
  }

  const server = createFinanceBuddyMcpServer(userId);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Finance Buddy MCP server running on stdio");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
