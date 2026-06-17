export type DocsCodeBlock = {
  filename?: string;
  code: string;
};

export type DocsTable = {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
};

export type DocsSection = {
  id: string;
  title: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
  codeBlocks?: readonly DocsCodeBlock[];
  table?: DocsTable;
};

export const docsPage = {
  eyebrow: "Documentation",
  title: "Use Finance Buddy",
  titleAccent: "in Cursor",
  updated: "17 June 2026",
  intro:
    "Connect your Finance Buddy account to Cursor so your AI assistant can help with budgets, expenses, shared splits, and reports — the same things you can do in the app.",
} as const;

const availableToolGroups = [
  {
    id: "tools-budget",
    title: "Budget & dashboard",
    items: [
      "View your dashboard — remaining budget, category spend, forecast, and recent expenses",
      "See your current month’s budget, income, and category allocations",
      "List budget categories and how much is allocated to each",
      "Create or update this month’s budget and income",
      "View and dismiss budget alerts",
    ],
  },
  {
    id: "tools-expenses",
    title: "Expenses",
    items: [
      "List expenses for the current month",
      "Add an expense manually (amount, description, date, category)",
      "Add an expense from plain text or receipt text",
      "Change the category on an existing expense",
      "Delete an expense (Cursor will ask you to confirm first)",
    ],
  },
  {
    id: "tools-reports",
    title: "Reports",
    items: [
      "View your latest monthly spending report",
      "Generate a new monthly report snapshot",
    ],
  },
  {
    id: "tools-shared",
    title: "Friends & shared expenses",
    items: [
      "List your friends and send friend requests by email",
      "Accept or decline incoming friend requests",
      "See balances and activity with each friend",
      "List shared expenses you’re part of",
      "Create a shared expense split with friends",
      "Record a settlement when someone pays you back",
      "Delete a shared expense you created (with confirmation)",
    ],
  },
] as const;

function buildAvailableToolsSections(): DocsSection[] {
  return availableToolGroups.map((group) => ({
    id: group.id,
    title: group.title,
    list: group.items,
  }));
}

export function buildMcpDocsSections(mcpHttpUrl: string): DocsSection[] {
  return [
    {
      id: "overview",
      title: "What you need",
      paragraphs: [
        "You need a Finance Buddy account and a personal API key. The key links Cursor to your account only — you can create or revoke keys anytime in Settings.",
      ],
      list: [
        "Sign up or log in to Finance Buddy",
        "Open Settings → API keys for MCP and create a key",
        "Copy the key when it is shown — it is only displayed once",
      ],
    },
    {
      id: "connect-cursor",
      title: "Connect in Cursor",
      paragraphs: [
        "Open Cursor Settings → MCP (or edit ~/.cursor/mcp.json) and add Finance Buddy as a server. Use your API key in the Authorization header.",
        "If you use the config below, set FINANCE_BUDDY_API_KEY in your environment to the key you copied from Settings. Restart Cursor after saving.",
      ],
      codeBlocks: [
        {
          filename: "~/.cursor/mcp.json",
          code: `{
  "mcpServers": {
    "finance-buddy": {
      "url": "${mcpHttpUrl}",
      "headers": {
        "Authorization": "Bearer \${env:FINANCE_BUDDY_API_KEY}"
      }
    }
  }
}`,
        },
      ],
      list: [
        "Cursor Settings → MCP → add server, or paste into mcp.json",
        "Replace the URL only if we give you a different one in Settings",
        "Restart Cursor so the new server loads",
      ],
    },
    {
      id: "what-you-can-do",
      title: "What you can ask",
      paragraphs: [
        "Once connected, ask Cursor to help with your finances in plain language — for example, log an expense, check what is left in your budget, or see what you owe a friend.",
      ],
      list: [
        "“Log $12 for lunch today”",
        "“How much budget do I have left this month?”",
        "“Show my recent expenses”",
        "“What’s my balance with Alex?”",
      ],
    },
    {
      id: "available-tools",
      title: "Available tools",
      paragraphs: [
        "Finance Buddy exposes the same capabilities in Cursor as the in-app AI assistant. Cursor picks the right tool based on what you ask — you don’t need to name them yourself.",
        "Deleting expenses, shared expenses, or all your data always requires an explicit confirmation in chat first.",
      ],
    },
    ...buildAvailableToolsSections(),
    {
      id: "help",
      title: "Something not working?",
      list: [
        "Make sure your API key is active in Settings → API keys for MCP",
        "Check that FINANCE_BUDDY_API_KEY is set in your environment",
        "Restart Cursor after changing MCP settings",
        "Contact us from the site if you are still stuck",
      ],
    },
  ];
}
