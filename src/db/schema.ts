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

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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

export const expensesRelations = relations(expenses, ({ one }) => ({
  budget: one(budgets, {
    fields: [expenses.budgetId],
    references: [budgets.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

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

export type BudgetRow = typeof budgets.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ExpenseRow = typeof expenses.$inferSelect;
export type AlertRow = typeof alerts.$inferSelect;
export type MonthlyReportRow = typeof monthlyReports.$inferSelect;
export type FriendRequestRow = typeof friendRequests.$inferSelect;
export type SharedExpenseRow = typeof sharedExpenses.$inferSelect;
export type SharedExpenseSplitRow = typeof sharedExpenseSplits.$inferSelect;
export type SettlementRow = typeof settlements.$inferSelect;
