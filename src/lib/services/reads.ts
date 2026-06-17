import { getSpendingReportForUser } from "@/lib/services/reports";
import { getDefaultReportDateRange } from "@/lib/finance/report-date-range";
import {
  getAllAlertsForUser,
  getCurrentBudgetForUser,
  getUnreadAlertsForUser,
} from "@/lib/db/queries";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { formatMoney } from "@/types/finance";
import { getFriendBalancesForUser } from "@/lib/services/settlements";
import { listFriendsForUser, listPendingRequestsForUser } from "@/lib/services/friends";
import { listSharedExpensesForUser } from "@/lib/services/shared-expenses";

export async function getDashboardSnapshotForUser(userId: string) {
  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);
  const currency = await getUserCurrency(userId);

  if (!budget) {
    return {
      hasBudget: false as const,
      message: "No budget set up for this month",
    };
  }

  const summaries = computeCategorySummaries(categories, expenses);
  const forecast = computeForecast(budget, expenses);
  const monthlyRemaining = computeMonthlyRemaining(budget.income_cents, expenses);
  const unreadAlerts = await getUnreadAlertsForUser(userId);

  return {
    hasBudget: true as const,
    budget: {
      id: budget.id,
      income: formatMoney(budget.income_cents, currency),
      remaining: formatMoney(monthlyRemaining, currency),
      alertThresholdPct: budget.alert_threshold_pct,
      year: budget.year,
      month: budget.month,
    },
    categorySummaries: summaries.map((s) => ({
      categoryId: s.categoryId,
      name: s.name,
      allocated: formatMoney(s.allocatedCents, currency),
      spent: formatMoney(s.spentCents, currency),
      remaining: formatMoney(s.remainingCents, currency),
      percentUsed: s.percentUsed,
    })),
    forecast: {
      projectedEndBalance: formatMoney(forecast.projectedEndBalanceCents, currency),
      dailyBurnRate: formatMoney(forecast.dailyBurnRateCents, currency),
      daysRemaining: forecast.daysRemaining,
    },
    unreadAlertCount: unreadAlerts.length,
    recentExpenses: expenses.slice(0, 10).map((e) => ({
      id: e.id,
      description: e.description,
      amount: formatMoney(e.amount_cents, currency),
      date: e.expense_date,
      categoryId: e.category_id,
    })),
  };
}

export async function getCurrentBudgetSnapshotForUser(userId: string) {
  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);
  const currency = await getUserCurrency(userId);

  if (!budget) {
    return { budget: null, categories: [], expenseCount: 0 };
  }

  return {
    budget: {
      id: budget.id,
      income: formatMoney(budget.income_cents, currency),
      alertThresholdPct: budget.alert_threshold_pct,
      year: budget.year,
      month: budget.month,
    },
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      allocated: formatMoney(c.allocated_cents, currency),
    })),
    expenseCount: expenses.length,
  };
}

export async function listExpensesForUser(userId: string, limit = 50) {
  const { expenses } = await getCurrentBudgetForUser(userId);
  const currency = await getUserCurrency(userId);

  return expenses.slice(0, limit).map((e) => ({
    id: e.id,
    description: e.description,
    amount: formatMoney(e.amount_cents, currency),
    amountCents: e.amount_cents,
    date: e.expense_date,
    categoryId: e.category_id,
    source: e.source,
  }));
}

export async function listCategoriesForUser(userId: string) {
  const { categories } = await getCurrentBudgetForUser(userId);
  const currency = await getUserCurrency(userId);
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    allocated: formatMoney(c.allocated_cents, currency),
  }));
}

export async function listAlertsForUser(userId: string) {
  const alerts = await getAllAlertsForUser(userId);
  return alerts.map((a) => ({
    id: a.id,
    message: a.message,
    type: a.type,
    read: a.read_at !== null,
    createdAt: a.created_at,
  }));
}

export async function getLatestReportSnapshotForUser(
  userId: string,
  startDate?: string,
  endDate?: string,
) {
  const defaults = getDefaultReportDateRange();
  const result = await getSpendingReportForUser(
    userId,
    startDate ?? defaults.startDate,
    endDate ?? defaults.endDate,
  );

  if (!result.success) {
    return { report: null, error: result.error };
  }

  return { report: result.data };
}

export async function getSharedOverviewForUser(userId: string) {
  const [balances, friends, pending, shared] = await Promise.all([
    getFriendBalancesForUser(userId),
    listFriendsForUser(userId),
    listPendingRequestsForUser(userId),
    listSharedExpensesForUser(userId),
  ]);

  return {
    friendBalances: balances,
    friends: friends.success ? friends.data : [],
    pendingRequests: pending.success ? pending.data : { incoming: [], outgoing: [] },
    sharedExpenses: shared.success ? shared.data.slice(0, 20) : [],
  };
}
