# Finance Buddy MCP Server

External MCP access to your Finance Buddy account using personal API keys.

## Prerequisites

1. Run the database migration `supabase/migrations/005_mcp_api_keys.sql`
2. Create an API key in the app: **Settings → API keys for MCP**
3. Set `DATABASE_URL` in your environment (same as the Next.js app)

## Local stdio (Cursor / Claude Desktop)

Add to `~/.cursor/mcp.json` (or Claude Desktop MCP config):

```json
{
  "mcpServers": {
    "finance-buddy": {
      "command": "npm",
      "args": ["run", "mcp:stdio"],
      "cwd": "/path/to/finance-buddy",
      "env": {
        "DATABASE_URL": "your-postgres-url",
        "FINANCE_BUDDY_API_KEY": "fb_live_..."
      }
    }
  }
}
```

From the repo root:

```bash
npm run mcp:stdio
```

## Remote HTTP (Railway / Fly.io)

Deploy the MCP HTTP service as a separate always-on process:

```bash
npm run mcp:http
```

Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Supabase Postgres connection string |
| `MCP_PORT` | No | Default `8080` |
| `FINANCE_BUDDY_API_KEY` | No | Only for local testing; HTTP clients send Bearer token per request |

Endpoints:

- `GET /health` — health check
- `POST /mcp` — MCP Streamable HTTP (initialize with `Authorization: Bearer fb_live_...`)

Suggested production setup:

1. Create a Railway/Fly service from this repo
2. Start command: `npm run mcp:http`
3. Set `DATABASE_URL` in the service env
4. Point `mcp.financebuddy.app` CNAME to the service
5. Configure MCP clients with URL `https://mcp.financebuddy.app/mcp` and your personal API key

## Vercel (web app)

Add to the Vercel project environment:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | In-app AI chat |
| `GEMINI_MODEL` | Optional, default `gemini-2.5-flash` |
| `DATABASE_URL` | Already required |
| Supabase keys | Already required |

Redeploy after adding `GEMINI_API_KEY`.

## Available tools

The MCP server exposes the same tools as the in-app AI assistant: budgets, expenses, alerts, reports, friends, shared expenses, settlements, and destructive actions (with confirmation flow).
