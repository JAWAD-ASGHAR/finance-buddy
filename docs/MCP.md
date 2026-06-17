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

### EC2 + nginx (production example)

When nginx terminates TLS on port 443 and proxies to the Node process on `8080`:

| Public URL | Purpose |
|------------|---------|
| `https://finance-buddy.duckdns.org/health` | Health check |
| `https://finance-buddy.duckdns.org/mcp` | MCP endpoint |

Cursor `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "finance-buddy": {
      "url": "https://finance-buddy.duckdns.org/mcp",
      "headers": {
        "Authorization": "Bearer ${env:FINANCE_BUDDY_API_KEY}"
      }
    }
  }
}
```

Do **not** include `:8080` in the client URL when nginx listens on 443 — only the upstream Node app uses 8080 internally.

Suggested production setup (Railway / Fly / EC2):

1. Deploy with start command: `npm run mcp:http` (Node listens on `8080` or `MCP_PORT`)
2. Set `DATABASE_URL` in the service env
3. Put nginx/Caddy on 443 → proxy to `127.0.0.1:8080`
4. Configure MCP clients with `https://your-domain/mcp` and a personal API key from Settings

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
