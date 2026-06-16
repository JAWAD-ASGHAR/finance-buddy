import { z } from "zod";

export const aiToolSchemas = {
  get_dashboard: z.object({}),
  get_current_budget: z.object({}),
  list_expenses: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  list_categories: z.object({}),
  list_alerts: z.object({}),
  list_friends: z.object({}),
  get_friend_balances: z.object({}),
  get_friend_activity: z.object({
    friendId: z.string().uuid(),
  }),
  list_shared_expenses: z.object({}),
  get_latest_report: z.object({}),
  create_monthly_budget: z.object({
    income: z.string(),
    alertThresholdPct: z.number().int().min(1).max(100).optional(),
    categories: z
      .array(
        z.object({
          name: z.string(),
          allocated: z.string(),
        }),
      )
      .optional(),
  }),
  update_budget_income: z.object({
    budgetId: z.string().uuid(),
    income: z.string(),
  }),
  add_expense: z.object({
    amount: z.string(),
    description: z.string(),
    expenseDate: z.string(),
    categoryId: z.string().uuid(),
  }),
  add_expense_from_text: z.object({
    rawText: z.string(),
    source: z.enum(["receipt_text", "nl_text"]),
    categoryId: z.string().uuid().optional(),
    expenseDate: z.string().optional(),
  }),
  update_expense_category: z.object({
    expenseId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
  mark_alert_read: z.object({
    alertId: z.string().uuid(),
  }),
  generate_monthly_report: z.object({}),
  send_friend_request: z.object({
    email: z.string().email(),
  }),
  respond_to_friend_request: z.object({
    requestId: z.string().uuid(),
    accept: z.boolean(),
  }),
  create_shared_expense: z.object({
    amount: z.string(),
    description: z.string(),
    expenseDate: z.string(),
    friendIds: z.array(z.string().uuid()).min(1),
    splitMode: z.enum(["equal", "single_payer"]),
    payerId: z.string().uuid(),
    addToBudget: z.boolean().optional(),
    categoryId: z.string().uuid().optional(),
  }),
  record_settlement: z.object({
    friendId: z.string().uuid(),
    amount: z.string(),
    note: z.string().optional(),
  }),
  delete_expense: z.object({
    expenseId: z.string().uuid(),
    confirmationToken: z.string().optional(),
  }),
  delete_shared_expense: z.object({
    expenseId: z.string().uuid(),
    confirmationToken: z.string().optional(),
  }),
  delete_all_user_data: z.object({
    confirmationToken: z.string().optional(),
  }),
  request_destructive_confirmation: z.object({
    toolName: z.enum([
      "delete_expense",
      "delete_shared_expense",
      "delete_all_user_data",
    ]),
    payload: z.record(z.string(), z.unknown()),
    userConfirmed: z.boolean(),
  }),
} as const;

export type AiToolName = keyof typeof aiToolSchemas;

export const aiToolDescriptions: Record<AiToolName, string> = {
  get_dashboard:
    "Get dashboard summary: budget remaining, category spend, forecast, recent expenses, alert count.",
  get_current_budget:
    "Get the current month budget with income, categories, and expense count.",
  list_expenses: "List expenses for the current month budget.",
  list_categories: "List budget categories with allocated amounts.",
  list_alerts: "List budget alerts for the current month.",
  list_friends: "List accepted friends.",
  get_friend_balances: "Get shared expense balances with each friend.",
  get_friend_activity:
    "Get activity and net balance with a specific friend by friendId.",
  list_shared_expenses: "List shared expenses the user participates in.",
  get_latest_report: "Get the latest generated monthly report if any.",
  create_monthly_budget:
    "Create or update this month's budget with income and category allocations.",
  update_budget_income: "Update monthly income for a budget.",
  add_expense: "Add a manual expense to the current budget.",
  add_expense_from_text:
    "Parse natural language or receipt text and add an expense.",
  update_expense_category: "Recategorize an existing expense.",
  mark_alert_read: "Dismiss/mark an alert as read.",
  generate_monthly_report: "Generate a monthly spending report snapshot.",
  send_friend_request: "Send a friend request by email address.",
  respond_to_friend_request: "Accept or decline an incoming friend request.",
  create_shared_expense:
    "Create a shared expense split with friends (equal or single payer).",
  record_settlement: "Record a payment settlement with a friend.",
  delete_expense:
    "Delete an expense. Requires confirmationToken from request_destructive_confirmation.",
  delete_shared_expense:
    "Delete a shared expense you created. Requires confirmationToken.",
  delete_all_user_data:
    "Delete all personal budget data. Requires confirmationToken.",
  request_destructive_confirmation:
    "Obtain a confirmation token after the user explicitly confirms a destructive action in chat.",
};
