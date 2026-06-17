import { and, asc, desc, eq, isNull } from "drizzle-orm";
import {
  mapAlert,
  mapBudget,
  mapCategory,
  mapExpense,
  mapMonthlyReport,
} from "@/db/mappers";
import { getDb } from "@/db/index";
import {
  alerts,
  budgets,
  categories,
  expenses,
  monthlyReports,
} from "@/db/schema";
import { listExpenseAttachmentsForExpenses } from "@/lib/services/images";
import { getAuthUser } from "@/lib/supabase/server";
import { getCurrentBudgetPeriod } from "@/types/finance";

export async function getCurrentBudgetForUser(userId: string) {
  const db = getDb();
  const { year, month } = getCurrentBudgetPeriod();

  const budgetRow = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, userId),
      eq(budgets.year, year),
      eq(budgets.month, month),
    ),
  });

  if (!budgetRow) {
    return { budget: null, categories: [], expenses: [] };
  }

  const [categoryRows, expenseRows] = await Promise.all([
    db.query.categories.findMany({
      where: eq(categories.budgetId, budgetRow.id),
      orderBy: asc(categories.sortOrder),
    }),
    db.query.expenses.findMany({
      where: eq(expenses.budgetId, budgetRow.id),
      orderBy: desc(expenses.expenseDate),
    }),
  ]);

  const attachmentsByExpense = await listExpenseAttachmentsForExpenses(
    expenseRows.map((row) => row.id),
  );

  return {
    budget: mapBudget(budgetRow),
    categories: categoryRows.map(mapCategory),
    expenses: expenseRows.map((row) =>
      mapExpense(row, attachmentsByExpense[row.id]),
    ),
  };
}

export async function getCurrentBudget() {
  const user = await getAuthUser();
  if (!user) {
    return { budget: null, categories: [], expenses: [] };
  }

  return getCurrentBudgetForUser(user.id);
}

async function fetchCurrentBudgetRow(userId: string) {
  const db = getDb();
  const { year, month } = getCurrentBudgetPeriod();

  return db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, userId),
      eq(budgets.year, year),
      eq(budgets.month, month),
    ),
  });
}

export async function getUnreadAlertsForUser(userId: string) {
  const db = getDb();
  const budgetRow = await fetchCurrentBudgetRow(userId);
  if (!budgetRow) return [];

  const rows = await db.query.alerts.findMany({
    where: and(
      eq(alerts.budgetId, budgetRow.id),
      eq(alerts.userId, userId),
      isNull(alerts.readAt),
    ),
    orderBy: desc(alerts.createdAt),
  });

  return rows.map(mapAlert);
}

export async function getLatestReportForUser(userId: string) {
  const db = getDb();
  const budgetRow = await fetchCurrentBudgetRow(userId);
  if (!budgetRow) return null;

  const row = await db.query.monthlyReports.findFirst({
    where: and(
      eq(monthlyReports.budgetId, budgetRow.id),
      eq(monthlyReports.userId, userId),
    ),
    orderBy: desc(monthlyReports.generatedAt),
  });

  return row ? mapMonthlyReport(row) : null;
}

export async function getAllAlertsForUser(userId: string) {
  const db = getDb();
  const budgetRow = await fetchCurrentBudgetRow(userId);
  if (!budgetRow) return [];

  const rows = await db.query.alerts.findMany({
    where: and(eq(alerts.budgetId, budgetRow.id), eq(alerts.userId, userId)),
    orderBy: desc(alerts.createdAt),
  });

  return rows.map(mapAlert);
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getUnreadAlerts() {
  const user = await getAuthUser();
  if (!user) return [];
  return getUnreadAlertsForUser(user.id);
}

export async function getLatestReport() {
  const user = await getAuthUser();
  if (!user) return null;
  return getLatestReportForUser(user.id);
}

export async function getBudgetBundle(budgetId: string, userId: string) {
  const db = getDb();
  const [budgetRow, categoryRows, expenseRows] = await Promise.all([
    db.query.budgets.findFirst({
      where: and(eq(budgets.id, budgetId), eq(budgets.userId, userId)),
    }),
    db.query.categories.findMany({
      where: eq(categories.budgetId, budgetId),
      orderBy: asc(categories.sortOrder),
    }),
    db.query.expenses.findMany({
      where: eq(expenses.budgetId, budgetId),
    }),
  ]);

  if (!budgetRow) return null;

  const attachmentsByExpense = await listExpenseAttachmentsForExpenses(
    expenseRows.map((row) => row.id),
  );

  return {
    budget: mapBudget(budgetRow),
    categories: categoryRows.map(mapCategory),
    expenses: expenseRows.map((row) =>
      mapExpense(row, attachmentsByExpense[row.id]),
    ),
  };
}
