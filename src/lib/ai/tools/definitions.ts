import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/lib/finance/currency-codes";

const currencyCodeSchema = z.enum(SUPPORTED_CURRENCIES);

const amountField = z
  .string()
  .min(1)
  .describe(
    "Money amount in the user's profile currency. Accepts plain numbers (12.50) or symbols (£12.50, $9.99, ₹500, Rs 500).",
  );

export const aiToolSchemas = {
  get_user_profile: z.object({}),
  update_user_preferences: z
    .object({
      username: z.string().trim().min(3).max(30).optional(),
      displayName: z.string().trim().min(1).max(80).optional(),
      countryCode: z.string().optional(),
      currencyCode: currencyCodeSchema.optional(),
    })
    .refine(
      (data) =>
        data.username !== undefined ||
        data.displayName !== undefined ||
        data.countryCode !== undefined ||
        data.currencyCode !== undefined,
      { message: "Provide at least one field to update" },
    ),
  list_supported_currencies: z.object({}),
  get_dashboard: z.object({}),
  get_current_budget: z.object({}),
  list_categories: z.object({}),
  list_expenses: z.object({
    limit: z.number().int().min(1).max(100).optional(),
  }),
  list_alerts: z.object({
    unreadOnly: z.boolean().optional(),
  }),
  suggest_expense_category: z.object({
    description: z.string().min(1).max(200),
  }),
  create_monthly_budget: z.object({
    income: amountField,
    alertThresholdPct: z.number().int().min(1).max(100).optional(),
    categories: z
      .array(
        z.object({
          name: z.string().min(1).max(50),
          allocated: amountField,
        }),
      )
      .optional(),
  }),
  update_monthly_budget: z.object({
    budgetId: z.string().uuid(),
    income: amountField,
    alertThresholdPct: z.number().int().min(1).max(100).optional(),
    categories: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          name: z.string().min(1).max(50),
          allocated: amountField,
        }),
      )
      .min(1),
  }),
  update_budget_income: z.object({
    budgetId: z.string().uuid(),
    income: amountField,
  }),
  update_budget_alert_threshold: z.object({
    budgetId: z.string().uuid(),
    alertThresholdPct: z.number().int().min(1).max(100),
  }),
  add_expense: z.object({
    amount: amountField,
    description: z.string().min(1).max(200),
    expenseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("ISO date YYYY-MM-DD"),
    categoryId: z.string().uuid(),
  }),
  add_expense_from_text: z.object({
    rawText: z.string().min(1),
    source: z
      .enum(["receipt_text", "nl_text"])
      .describe(
        "receipt_text = pasted receipt lines; nl_text = quick phrase like '12 uber home Friday'",
      ),
    categoryId: z.string().uuid().optional(),
    expenseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  update_expense_category: z.object({
    expenseId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
  delete_expense: z.object({
    expenseId: z.string().uuid(),
    confirmationToken: z.string().optional(),
  }),
  list_saving_goals: z.object({
    includeCompleted: z.boolean().optional(),
  }),
  create_saving_goal: z.object({
    name: z.string().min(1).max(80),
    target: amountField,
    targetDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Optional deadline ISO date YYYY-MM-DD"),
  }),
  add_saving_contribution: z.object({
    goalId: z.string().uuid(),
    amount: amountField,
    note: z.string().max(200).optional(),
    contributedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Optional backdated contribution date"),
  }),
  mark_saving_goal_complete: z.object({
    goalId: z.string().uuid(),
  }),
  delete_saving_goal: z.object({
    goalId: z.string().uuid(),
    confirmationToken: z.string().optional(),
  }),
  get_latest_report: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  generate_monthly_report: z.object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  mark_alert_read: z.object({
    alertId: z.string().uuid(),
  }),
  list_friends: z.object({}),
  list_pending_friend_requests: z.object({}),
  search_users_by_username: z.object({
    query: z.string().min(2).max(30),
  }),
  get_friend_balances: z.object({}),
  get_friend_activity: z.object({
    friendId: z.string().uuid(),
  }),
  get_shared_overview: z.object({}),
  list_shared_expenses: z.object({}),
  send_friend_request: z.object({
    username: z.string().min(3).max(30),
  }),
  respond_to_friend_request: z.object({
    requestId: z.string().uuid(),
    accept: z.boolean(),
  }),
  create_shared_expense: z.object({
    amount: amountField,
    description: z.string().min(1).max(200),
    expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    friendIds: z.array(z.string().uuid()).min(1),
    splitMode: z.enum(["equal", "single_payer"]),
    payerId: z.string().uuid(),
    addToBudget: z
      .boolean()
      .optional()
      .describe("Also add the payer's share to the user's personal budget"),
    categoryId: z
      .string()
      .uuid()
      .optional()
      .describe("Required when addToBudget is true"),
  }),
  record_settlement: z.object({
    friendId: z.string().uuid(),
    amount: amountField,
    note: z.string().max(200).optional(),
  }),
  delete_shared_expense: z.object({
    expenseId: z.string().uuid(),
    confirmationToken: z.string().optional(),
  }),
  list_notifications: z.object({
    limit: z.number().int().min(1).max(50).optional(),
  }),
  mark_notification_read: z.object({
    notificationId: z.string().uuid(),
  }),
  mark_all_notifications_read: z.object({}),
  delete_all_user_data: z.object({
    confirmationToken: z.string().optional(),
  }),
  request_destructive_confirmation: z.object({
    toolName: z.enum([
      "delete_expense",
      "delete_shared_expense",
      "delete_saving_goal",
      "delete_all_user_data",
    ]),
    payload: z.record(z.string(), z.unknown()),
    userConfirmed: z.boolean(),
  }),
} as const;

export type AiToolName = keyof typeof aiToolSchemas;

const moneyNote =
  "Amounts use the user's profile currency (see get_user_profile).";

export const aiToolDescriptions: Record<AiToolName, string> = {
  get_user_profile:
    "Get the user's profile: display name, username, country, preferred currency code, and onboarding status. Call this first when formatting money or unsure which currency to use.",
  update_user_preferences:
    "Update profile settings: username, display name, country, or preferred currency (GBP, USD, EUR, CAD, AUD, PKR, INR). At least one field required.",
  list_supported_currencies:
    "List all supported currency codes and labels. Personal budget amounts are stored/displayed in the user's profile currency.",
  get_dashboard: `Dashboard snapshot for the current month: income, remaining budget, per-category spend, month-end forecast, unread alert count, and 10 recent expenses. ${moneyNote}`,
  get_current_budget: `Current month budget: budgetId, income, alert threshold %, year/month, categories with allocations, and expense count. ${moneyNote}`,
  list_categories: `List categories for the current month budget with categoryId, name, and allocated amount. ${moneyNote}`,
  list_expenses: `List expenses for the current month budget (newest first). Returns expenseId, description, amount, date, categoryId, source. ${moneyNote}`,
  list_alerts:
    "List budget alerts (category threshold or monthly pace warnings). Set unreadOnly=true to filter unread alerts.",
  suggest_expense_category:
    "Suggest a category for an expense description before adding it. Returns categoryId, confidence, and reason. Requires an existing budget with categories.",
  create_monthly_budget: `Create a NEW budget for the current calendar month only. Fails if a budget already exists — use update_monthly_budget instead. Category allocations must sum to income. ${moneyNote}`,
  update_monthly_budget: `Update the current month's budget: income, alert threshold, and full category list (with optional category ids for existing rows). Allocations must sum to income. ${moneyNote}`,
  update_budget_income: `Change only the monthly income on an existing budget. ${moneyNote}`,
  update_budget_alert_threshold:
    "Change the spending alert threshold percentage (1–100) on an existing budget. Alerts fire when a category reaches this % of its allocation.",
  add_expense: `Add a manual expense to the current month budget. ${moneyNote}`,
  add_expense_from_text: `Parse receipt text or a natural-language phrase and add an expense. Prefer this when the user describes a purchase casually. ${moneyNote}`,
  update_expense_category:
    "Change the category on an existing expense (marks user_corrected for better future suggestions).",
  delete_expense:
    "Permanently delete one expense. Requires confirmationToken from request_destructive_confirmation after explicit user confirmation.",
  list_saving_goals: `List savings goals with target, saved amount, progress %, and completion status. ${moneyNote}`,
  create_saving_goal: `Create a savings goal with a target amount and optional deadline. ${moneyNote}`,
  add_saving_contribution: `Record a manual contribution toward a savings goal. Supports backdated dates for late cash entries. ${moneyNote}`,
  mark_saving_goal_complete:
    "Mark a savings goal as complete without deleting it.",
  delete_saving_goal:
    "Permanently delete a savings goal and all its contributions. Requires confirmationToken after explicit user confirmation.",
  get_latest_report: `Get a formatted spending report snapshot for a date range (defaults to current month through today). Includes insights and savings goal progress. ${moneyNote}`,
  generate_monthly_report: `Generate a spending report for a date range with category breakdown, forecast, and insights. Same data as get_latest_report. ${moneyNote}`,
  mark_alert_read: "Dismiss a single budget alert by alertId.",
  list_friends: "List accepted friends with id, display name, and username.",
  list_pending_friend_requests:
    "List incoming and outgoing pending friend requests with requestId and status.",
  search_users_by_username:
    "Search for users by username prefix (min 2 chars) to find someone to add as a friend.",
  get_friend_balances: `Net shared-expense balance with each friend (positive = they owe you). ${moneyNote}`,
  get_friend_activity:
    "Detailed shared expense and settlement history with one friend by friendId.",
  get_shared_overview:
    "Combined social finance snapshot: friend balances, friends list, pending requests, and recent shared expenses.",
  list_shared_expenses:
    "List shared expenses the user participates in with splits and amounts.",
  send_friend_request:
    "Send a friend request to another user by their exact username.",
  respond_to_friend_request:
    "Accept or decline an incoming friend request by requestId.",
  create_shared_expense: `Split an expense with friends. splitMode 'equal' divides evenly; 'single_payer' means one participant paid the full amount. Set addToBudget=true to also log the payer's share in the personal budget. ${moneyNote}`,
  record_settlement: `Record that the user paid a friend (or was paid) to settle a shared balance. ${moneyNote}`,
  delete_shared_expense:
    "Delete a shared expense the user created. Requires confirmationToken after explicit user confirmation.",
  list_notifications:
    "List in-app notifications (friend requests, shared expenses, settlements) with unread count.",
  mark_notification_read: "Mark one notification as read by notificationId.",
  mark_all_notifications_read: "Mark all notifications as read.",
  delete_all_user_data:
    "Delete ALL personal data: budgets, expenses, alerts, reports, and savings goals. Does not remove friends or shared expenses. Requires confirmationToken.",
  request_destructive_confirmation:
    "After the user explicitly confirms in chat, call with userConfirmed=true to obtain a confirmationToken for a destructive tool (delete_expense, delete_shared_expense, delete_saving_goal, delete_all_user_data). Token expires in 5 minutes.",
};
