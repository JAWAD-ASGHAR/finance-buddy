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
import { getAuthUser } from "@/lib/supabase/server";
import { getCurrentBudgetPeriod } from "@/types/finance";

export async function getCurrentBudget() {
  const db = getDb();
  const user = await getAuthUser();
  if (!user) {
    return { budget: null, categories: [], expenses: [] };
  }

  const { year, month } = getCurrentBudgetPeriod();

  const budgetRow = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, user.id),
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

  return {
    budget: mapBudget(budgetRow),
    categories: categoryRows.map(mapCategory),
    expenses: expenseRows.map(mapExpense),
  };
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getUnreadAlerts() {
  const db = getDb();
  const user = await getAuthUser();
  if (!user) return [];

  const { budget } = await getCurrentBudget();
  if (!budget) return [];

  const rows = await db.query.alerts.findMany({
    where: and(
      eq(alerts.budgetId, budget.id),
      eq(alerts.userId, user.id),
      isNull(alerts.readAt),
    ),
    orderBy: desc(alerts.createdAt),
  });

  return rows.map(mapAlert);
}

export async function getLatestReport() {
  const db = getDb();
  const user = await getAuthUser();
  if (!user) return null;

  const { budget } = await getCurrentBudget();
  if (!budget) return null;

  const row = await db.query.monthlyReports.findFirst({
    where: and(
      eq(monthlyReports.budgetId, budget.id),
      eq(monthlyReports.userId, user.id),
    ),
    orderBy: desc(monthlyReports.generatedAt),
  });

  return row ? mapMonthlyReport(row) : null;
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

  return {
    budget: mapBudget(budgetRow),
    categories: categoryRows.map(mapCategory),
    expenses: expenseRows.map(mapExpense),
  };
}
