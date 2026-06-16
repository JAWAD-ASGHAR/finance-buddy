import "dotenv/config";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { resolveUserIdFromMcpApiKey } from "../../src/lib/auth/mcp-api-key.js";
import { createFinanceBuddyMcpServer } from "./create-server.js";

const PORT = Number(process.env.MCP_PORT ?? 8080);
const transports = new Map<
  string,
  { transport: StreamableHTTPServerTransport; userId: string }
>();

async function readJsonBody(req: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: unknown,
) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const httpServer = createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.url !== "/mcp") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const authHeader = req.headers.authorization ?? null;
  const sessionIdHeader = req.headers["mcp-session-id"];
  const sessionId =
    typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;

  try {
    if (req.method === "POST") {
      const body = await readJsonBody(req);

      if (sessionId && transports.has(sessionId)) {
        const { transport } = transports.get(sessionId)!;
        await transport.handleRequest(req, res, body);
        return;
      }

      if (!sessionId && isInitializeRequest(body)) {
        const userId = await resolveUserIdFromMcpApiKey(authHeader);
        if (!userId) {
          sendJson(res, 401, {
            error: "Unauthorized — Bearer fb_live_… required",
          });
          return;
        }

        const server = createFinanceBuddyMcpServer(userId);
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports.set(newSessionId, { transport, userId });
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid) transports.delete(sid);
        };

        await server.connect(transport);
        await transport.handleRequest(req, res, body);
        return;
      }

      sendJson(res, 400, {
        error: "Bad Request: missing or invalid MCP session",
      });
      return;
    }

    if (req.method === "GET" || req.method === "DELETE") {
      if (!sessionId || !transports.has(sessionId)) {
        res.writeHead(400);
        res.end("Invalid or missing session ID");
        return;
      }

      const { transport } = transports.get(sessionId)!;
      await transport.handleRequest(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("MCP HTTP error:", error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Internal server error" });
    }
  }
});

httpServer.listen(PORT, () => {
  console.log(`Finance Buddy MCP HTTP server listening on :${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
