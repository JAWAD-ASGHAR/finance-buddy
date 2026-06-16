import {
  getAllAlertsForUser,
  getCurrentBudgetForUser,
  getLatestReportForUser,
  getUnreadAlertsForUser,
} from "@/lib/db/queries";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { formatMoney } from "@/types/finance";
import { getFriendBalancesForUser } from "@/lib/services/settlements";
import { listFriendsForUser, listPendingRequestsForUser } from "@/lib/services/friends";
import { listSharedExpensesForUser } from "@/lib/services/shared-expenses";

export async function getDashboardSnapshotForUser(userId: string) {
  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);

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
      income: formatMoney(budget.income_cents),
      remaining: formatMoney(monthlyRemaining),
      alertThresholdPct: budget.alert_threshold_pct,
      year: budget.year,
      month: budget.month,
    },
    categorySummaries: summaries.map((s) => ({
      categoryId: s.categoryId,
      name: s.name,
      allocated: formatMoney(s.allocatedCents),
      spent: formatMoney(s.spentCents),
      remaining: formatMoney(s.remainingCents),
      percentUsed: s.percentUsed,
    })),
    forecast: {
      projectedEndBalance: formatMoney(forecast.projectedEndBalanceCents),
      dailyBurnRate: formatMoney(forecast.dailyBurnRateCents),
      daysRemaining: forecast.daysRemaining,
    },
    unreadAlertCount: unreadAlerts.length,
    recentExpenses: expenses.slice(0, 10).map((e) => ({
      id: e.id,
      description: e.description,
      amount: formatMoney(e.amount_cents),
      date: e.expense_date,
      categoryId: e.category_id,
    })),
  };
}

export async function getCurrentBudgetSnapshotForUser(userId: string) {
  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);

  if (!budget) {
    return { budget: null, categories: [], expenseCount: 0 };
  }

  return {
    budget: {
      id: budget.id,
      income: formatMoney(budget.income_cents),
      alertThresholdPct: budget.alert_threshold_pct,
      year: budget.year,
      month: budget.month,
    },
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      allocated: formatMoney(c.allocated_cents),
    })),
    expenseCount: expenses.length,
  };
}

export async function listExpensesForUser(userId: string, limit = 50) {
  const { expenses } = await getCurrentBudgetForUser(userId);

  return expenses.slice(0, limit).map((e) => ({
    id: e.id,
    description: e.description,
    amount: formatMoney(e.amount_cents),
    amountCents: e.amount_cents,
    date: e.expense_date,
    categoryId: e.category_id,
    source: e.source,
  }));
}

export async function listCategoriesForUser(userId: string) {
  const { categories } = await getCurrentBudgetForUser(userId);
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    allocated: formatMoney(c.allocated_cents),
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

export async function getLatestReportSnapshotForUser(userId: string) {
  const report = await getLatestReportForUser(userId);
  if (!report) {
    return { report: null };
  }
  return { report: report.summary_json };
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
