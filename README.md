# Finance Buddy

Personal finance and micro-budgeting for students — set a monthly allowance, log expenses, get alerts and forecasts, and track savings goals. Privacy-first design with clear disclaimers that the app is not financial advice.

> **Note:** This project was built for a hackathon. It is a functional prototype intended for demonstration purposes.

---

## Features

| Feature | Description |
|---|---|
| **Monthly budget** | Set income or allowance and split it across custom categories (food, transport, subscriptions, etc.) with per-category threshold alerts |
| **Expense tracking** | Log expenses manually, by pasting receipt text, or in plain natural language; auto-category suggestions based on description and history |
| **Forecasts & reports** | End-of-month balance forecast, weekly and monthly summary reports, and exportable PDF reports |
| **Savings goals** | Create savings goals with target amounts and deadlines; manually record contributions and track progress |
| **Shared expenses** | Split expenses with friends, track who owes what, and record settlements |
| **AI assistant** | In-app conversational assistant (powered by Google Gemini) with tool-calling — query your budget, log expenses, and get insights in natural language |
| **MCP server** | HTTP/stdio MCP server exposing all finance tools to Cursor and other agent clients |
| **Multi-currency** | Per-user preferred currency with live exchange rate conversion |
| **Notifications** | In-app notification bell for budget alerts, friend requests, and settlements |
| **Receipt attachments** | Attach images to expenses via Supabase Storage |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Next.js Server Actions, API routes |
| Database | Supabase Postgres with Row Level Security (RLS) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (expense receipt images) |
| AI | Google Gemini 2.5 Flash via Vercel AI SDK (`@ai-sdk/google`) |
| Agentic integration | MCP server (`mcp/`) over stdio or HTTP |
| Email | Nodemailer + Gmail SMTP (verification, friend requests, contact form) |
| Currency | ExchangeRate-API (server-side conversion) |
| Animation | Framer Motion, GSAP, Lenis |

---

## Setup

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- Google Gemini API key (for AI assistant — optional but recommended)
- ExchangeRate-API key (for live currency conversion — optional)
- Gmail account with an App Password (for email features — optional)

### 1. Clone and install

```bash
git clone https://github.com/your-org/finance-buddy.git
cd finance-buddy
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

See the [Credentials](#credentials) section below for a full description of each variable.

### 3. Apply database migrations

Apply all migrations in `supabase/migrations/` in order using the Supabase CLI:

```bash
supabase db push
```

Or run each `.sql` file manually in the Supabase SQL editor.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account to get started.

### 5. Seed demo data (optional)

After creating a user account, populate it with sample budget, expenses, and a savings goal:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SECRET_KEY=sb_secret_... \
DEMO_EMAIL=demo@example.com \
DEMO_PASSWORD=demo123456 \
npm run seed:demo
```

Add `DEMO_FRIEND_EMAIL` and `DEMO_FRIEND_PASSWORD` to also seed shared-expense demo data with a second user.

---

## Credentials

All secrets go in `.env.local`. **Never commit this file.**

### Required

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Settings → API Keys → Create publishable key |
| `DATABASE_URL` | Supabase dashboard → Settings → Database → Connection string → **Transaction** pooler (port 6543) |
| `SUPABASE_SECRET_KEY` | Supabase dashboard → Settings → API Keys → Create secret key — **server-side only, never expose in the browser** |

### Optional — AI assistant

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) → Create API key. Without this, the in-app AI assistant and MCP AI tools are disabled. |
| `GEMINI_MODEL` | Model name override; defaults to `gemini-2.5-flash` |

### Optional — Email

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server (default `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (default `587`) |
| `SMTP_USER` | Gmail address used to send emails |
| `SMTP_PASS` | Gmail App Password — Google Account → Security → 2-Step Verification → App passwords |
| `CONTACT_INBOX_EMAIL` | Inbox that receives contact form submissions |

### Optional — Currency

| Variable | Description |
|---|---|
| `EXCHANGE_RATE_API_KEY` | [exchangerate-api.com](https://www.exchangerate-api.com/) free tier key. Without this, currency conversion falls back to static approximate rates. |

### Other

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in auth redirect links (e.g. `https://your-domain.com`) |
| `NEXT_PUBLIC_MCP_URL` | Public MCP HTTP endpoint shown in the `/docs` page (e.g. `https://your-domain.com/mcp`) |

---

## AI usage declaration

Finance Buddy uses AI in the following ways:

### In-app AI assistant
The dashboard includes a chat drawer powered by **Google Gemini 2.5 Flash** (via the Vercel AI SDK). The assistant uses structured tool-calling to read and write budget data on the user's behalf — it can query the dashboard, log expenses from natural language or receipt text, adjust budgets, manage savings goals, and split shared expenses. All tool calls are scoped to the authenticated user's data via Supabase RLS. Destructive actions (e.g. deleting an expense) require a confirmation token before execution.

### MCP server for agent clients
The `mcp/` package exposes the same set of finance tools over the Model Context Protocol (stdio and HTTP). This allows external agent clients — including Cursor's AI — to interact with a user's Finance Buddy data programmatically. Authentication is handled via a personal API key stored in the user's settings.

### Category suggestions
Expense categorisation uses keyword rules and the user's own spending history. There is no external ML model or third-party categorisation service — all logic runs server-side in `src/lib/finance/categorize.ts`.

### What AI does not do
- The AI assistant does not have access to bank accounts or external financial data.
- No user data is stored by Google or sent to any third party beyond the API call needed to generate a response.
- The app explicitly states it is **not a financial adviser** and does not provide regulated financial advice.

### Development tooling
This project was developed with the assistance of Cursor (AI-powered code editor). AI was used for scaffolding, debugging, and code review during development.

---

## Known limitations

- **Receipt OCR** — receipt entry parses pasted text only; there is no camera or image OCR.
- **Categorisation** — uses keyword rules and spending history, not a trained ML model.
- **Savings goals** — track manual contributions only; not linked to any bank account.
- **Recurring expenses** — not modeled as a separate entity; must be re-entered each month.
- **AI assistant** — requires `GEMINI_API_KEY`; the chat UI is hidden if the key is absent.
- **Currency conversion** — exchange rates are fetched on demand and cached briefly; they are not guaranteed to be real-time.
- **Email features** — require a Gmail account with 2FA and an App Password configured.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run seed:demo` | Seed demo budget, expenses, and savings goal |
| `npm run mcp:http` | Run MCP HTTP server |
| `npm run mcp:stdio` | Run MCP stdio server |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

---

## Documentation

- [Architecture overview](docs/ARCHITECTURE.md)
- [MCP integration](docs/MCP.md)

---

## Disclaimer

Finance Buddy is a student project built for a hackathon. It is not a regulated financial product and does not constitute financial advice. Use it as a personal budgeting aid only.
