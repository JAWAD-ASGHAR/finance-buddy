import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const expenseSourceEnum = pgEnum("expense_source", [
  "manual",
  "receipt_text",
  "nl_text",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "category_threshold",
  "monthly_pace",
]);

export const friendRequestStatusEnum = pgEnum("friend_request_status", [
  "pending",
  "accepted",
  "declined",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "friend_request",
  "friend_request_accepted",
  "shared_expense",
  "settlement",
  "budget_alert",
]);

export const profiles = pgTable(
  "profiles",
  {
  id: uuid("id").primaryKey(),
  username: text("username"),
  displayName: text("display_name"),
  currencyCode: text("currency_code").notNull().default("GBP"),
  countryCode: text("country_code"),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  avatarPath: text("avatar_path"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  },
  (table) => [unique("profiles_username_unique").on(table.username)],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    incomeCents: integer("income_cents").notNull(),
    alertThresholdPct: integer("alert_threshold_pct").notNull().default(80),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("budgets_user_id_year_month_unique").on(
      table.userId,
      table.year,
      table.month,
    ),
    index("budgets_user_id_idx").on(table.userId),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    allocatedCents: integer("allocated_cents").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("categories_budget_id_idx").on(table.budgetId)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    suggestedCategoryId: uuid("suggested_category_id").references(
      () => categories.id,
      { onDelete: "set null" },
    ),
    amountCents: integer("amount_cents").notNull(),
    description: text("description").notNull().default(""),
    expenseDate: date("expense_date").notNull().default(sql`CURRENT_DATE`),
    source: expenseSourceEnum("source").notNull().default("manual"),
    userCorrected: boolean("user_corrected").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("expenses_budget_id_idx").on(table.budgetId),
    index("expenses_user_id_idx").on(table.userId),
    index("expenses_expense_date_idx").on(table.expenseDate),
  ],
);

export const expenseAttachments = pgTable(
  "expense_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    storagePath: text("storage_path").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("expense_attachments_expense_path_unique").on(
      table.expenseId,
      table.storagePath,
    ),
    index("expense_attachments_expense_id_idx").on(table.expenseId),
    index("expense_attachments_user_id_idx").on(table.userId),
  ],
);

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    budgetId: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "cascade",
    }),
    type: alertTypeEnum("type").notNull(),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("alerts_budget_id_idx").on(table.budgetId)],
);

export const monthlyReports = pgTable("monthly_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" }),
  summaryJson: jsonb("summary_json").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const friendRequests = pgTable(
  "friend_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id").notNull(),
    recipientId: uuid("recipient_id").notNull(),
    status: friendRequestStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("friend_requests_requester_recipient_unique").on(
      table.requesterId,
      table.recipientId,
    ),
    index("friend_requests_requester_id_idx").on(table.requesterId),
    index("friend_requests_recipient_id_idx").on(table.recipientId),
  ],
);

export const sharedExpenses = pgTable(
  "shared_expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    description: text("description").notNull().default(""),
    totalCents: integer("total_cents").notNull(),
    currencyCode: text("currency_code").notNull().default("GBP"),
    expenseDate: date("expense_date").notNull().default(sql`CURRENT_DATE`),
    createdByUserId: uuid("created_by_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("shared_expenses_created_by_user_id_idx").on(table.createdByUserId),
  ],
);

export const sharedExpenseSplits = pgTable(
  "shared_expense_splits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sharedExpenseId: uuid("shared_expense_id")
      .notNull()
      .references(() => sharedExpenses.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    shareCents: integer("share_cents").notNull(),
    paidCents: integer("paid_cents").notNull(),
    personalExpenseId: uuid("personal_expense_id").references(() => expenses.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    unique("shared_expense_splits_expense_user_unique").on(
      table.sharedExpenseId,
      table.userId,
    ),
    index("shared_expense_splits_shared_expense_id_idx").on(
      table.sharedExpenseId,
    ),
    index("shared_expense_splits_user_id_idx").on(table.userId),
  ],
);

export const settlements = pgTable(
  "settlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: uuid("from_user_id").notNull(),
    toUserId: uuid("to_user_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currencyCode: text("currency_code").notNull().default("GBP"),
    note: text("note").notNull().default(""),
    createdByUserId: uuid("created_by_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("settlements_from_user_id_idx").on(table.fromUserId),
    index("settlements_to_user_id_idx").on(table.toUserId),
  ],
);

export const mcpApiKeys = pgTable(
  "mcp_api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    index("mcp_api_keys_user_id_idx").on(table.userId),
    index("mcp_api_keys_key_hash_idx").on(table.keyHash),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href").notNull().default("/shared"),
    metadata: jsonb("metadata").notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_unread_idx").on(table.userId, table.readAt),
  ],
);

export const savingGoals = pgTable(
  "saving_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    targetCents: integer("target_cents").notNull(),
    targetDate: date("target_date"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("saving_goals_user_id_idx").on(table.userId)],
);

export const savingContributions = pgTable(
  "saving_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    savingGoalId: uuid("saving_goal_id")
      .notNull()
      .references(() => savingGoals.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    contributedAt: date("contributed_at").notNull().default(sql`CURRENT_DATE`),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("saving_contributions_saving_goal_id_idx").on(table.savingGoalId),
    index("saving_contributions_user_id_idx").on(table.userId),
  ],
);

export const budgetsRelations = relations(budgets, ({ many }) => ({
  categories: many(categories),
  expenses: many(expenses),
  alerts: many(alerts),
  monthlyReports: many(monthlyReports),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  budget: one(budgets, {
    fields: [categories.budgetId],
    references: [budgets.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  budget: one(budgets, {
    fields: [expenses.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  attachments: many(expenseAttachments),
}));

export const expenseAttachmentsRelations = relations(
  expenseAttachments,
  ({ one }) => ({
    expense: one(expenses, {
      fields: [expenseAttachments.expenseId],
      references: [expenses.id],
    }),
  }),
);

export const sharedExpensesRelations = relations(
  sharedExpenses,
  ({ many }) => ({
    splits: many(sharedExpenseSplits),
  }),
);

export const sharedExpenseSplitsRelations = relations(
  sharedExpenseSplits,
  ({ one }) => ({
    sharedExpense: one(sharedExpenses, {
      fields: [sharedExpenseSplits.sharedExpenseId],
      references: [sharedExpenses.id],
    }),
  }),
);

export const savingGoalsRelations = relations(savingGoals, ({ many }) => ({
  contributions: many(savingContributions),
}));

export const savingContributionsRelations = relations(
  savingContributions,
  ({ one }) => ({
    goal: one(savingGoals, {
      fields: [savingContributions.savingGoalId],
      references: [savingGoals.id],
    }),
  }),
);

export type BudgetRow = typeof budgets.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type ExpenseAttachmentRow = typeof expenseAttachments.$inferSelect;
export type AlertRow = typeof alerts.$inferSelect;
export type MonthlyReportRow = typeof monthlyReports.$inferSelect;
export type FriendRequestRow = typeof friendRequests.$inferSelect;
export type SharedExpenseRow = typeof sharedExpenses.$inferSelect;
export type SharedExpenseSplitRow = typeof sharedExpenseSplits.$inferSelect;
export type SettlementRow = typeof settlements.$inferSelect;
export type McpApiKeyRow = typeof mcpApiKeys.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type ProfileRow = typeof profiles.$inferSelect;
export type SavingGoalRow = typeof savingGoals.$inferSelect;
export type SavingContributionRow = typeof savingContributions.$inferSelect;
