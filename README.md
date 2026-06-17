# Finance Buddy

Personal finance and micro-budgeting for students — set a monthly allowance, log expenses, get alerts and forecasts, and track savings goals. Privacy-first design with clear disclaimers that the app is not financial advice.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS |
| Backend | Next.js Server Actions, API routes |
| Database | Supabase Postgres with Row Level Security |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email) |
| Storage | Supabase Storage (expense receipt images) |
| AI | Google Gemini (`GEMINI_API_KEY`) — in-app assistant |
| Agentic integration | MCP server (`mcp/`) for Cursor / external clients |
| Email | Gmail SMTP (verification, friend requests, contact form) |
| Currency | ExchangeRate-API (server-side conversion) |

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project
- (Optional) Gemini API key for the AI assistant
- (Optional) ExchangeRate-API key for live currency conversion

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy anon key)
- `DATABASE_URL` — Postgres connection string (Transaction pooler, port 6543)
- `SUPABASE_SECRET_KEY` — server-only, for seed script and admin operations
- `GEMINI_API_KEY` — optional, for AI chat
- `EXCHANGE_RATE_API_KEY` — optional
- SMTP vars — optional, for email features

### 3. Database migrations

Apply Supabase migrations in order from `supabase/migrations/` (via Supabase CLI or SQL editor).

```bash
# If using Supabase CLI linked to your project:
supabase db push
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Seed sample data (optional)

After creating a user account (or letting the seed script create one):

```bash
SUPABASE_URL=... SUPABASE_SECRET_KEY=... DEMO_EMAIL=demo@example.com DEMO_PASSWORD=demo123456 npm run seed:demo
```

The seed script creates a monthly budget, sample expenses, a savings goal, and optionally shared-expense demo data if `DEMO_FRIEND_EMAIL` is set.

## Features

- Monthly budget setup with category allocations and threshold alerts
- Expense entry (manual, receipt text, quick natural-language text) with auto-category suggestions
- End-of-month balance forecast and weekly/monthly summary reports
- Savings goal tracker with manual contributions
- Shared expense splitting with friends
- In-app AI assistant with tool calling
- MCP HTTP server for external agent clients
- Multi-currency support and expense receipt image attachments

## Documentation

- [MCP integration](docs/MCP.md)

## Known limitations

- **Categorization** uses keyword rules and spending history, not ML/OCR for receipt images.
- **Savings goals** track manual contributions only — not linked to bank accounts.
- **Receipt entry** parses pasted text; there is no camera OCR.
- **Recurring expenses** are not modeled as a separate entity.
- **AI assistant** requires `GEMINI_API_KEY`; without it, AI chat is unavailable.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run seed:demo` | Seed demo budget, expenses, and savings goal |
| `npm run mcp:http` | Run MCP HTTP server |
| `npm run db:studio` | Open Drizzle Studio |
