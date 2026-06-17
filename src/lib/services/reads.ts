import { getSpendingReportForUser } from "@/lib/services/reports";
import { getDefaultReportDateRange } from "@/lib/finance/report-date-range";
import {
  getAllAlertsForUser,
  getCurrentBudgetForUser,
  getUnreadAlertsForUser,
} from "@/lib/db/queries";
import { getUserCurrency, getUserPreferences } from "@/lib/auth/user-preferences";
import {
  COUNTRY_OPTIONS,
  CURRENCY_LABELS,
  SUPPORTED_CURRENCIES,
} from "@/lib/finance/currency";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { formatMoney } from "@/types/finance";
import { getFriendBalancesForUser } from "@/lib/services/settlements";
import { listFriendsForUser, listPendingRequestsForUser } from "@/lib/services/friends";
import { listSharedExpensesForUser } from "@/lib/services/shared-expenses";
import { getSavingGoalsWithProgressForUser } from "@/lib/services/saving-goals";
import {
  getUnreadNotificationCount,
  listNotificationsForUser,
} from "@/lib/services/notifications";

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
    currency,
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
    currency,
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

export async function getUserProfileSnapshotForUser(userId: string) {
  const prefs = await getUserPreferences(userId);
  const currency = prefs?.currencyCode ?? (await getUserCurrency(userId));

  return {
    profile: prefs,
    currency,
    supportedCurrencies: SUPPORTED_CURRENCIES.map((code) => ({
      code,
      label: CURRENCY_LABELS[code],
    })),
    supportedCountries: COUNTRY_OPTIONS.map((country) => ({
      code: country.code,
      label: country.label,
      defaultCurrency: country.currency,
    })),
  };
}

export async function listSupportedCurrenciesSnapshot() {
  return {
    currencies: SUPPORTED_CURRENCIES.map((code) => ({
      code,
      label: CURRENCY_LABELS[code],
    })),
    note: "Amount fields in tools accept plain numbers or symbols (£, $, €, ₹, Rs). Stored values use the user's profile currency.",
  };
}

export async function listSavingGoalsSnapshotForUser(userId: string) {
  const [goals, currency] = await Promise.all([
    getSavingGoalsWithProgressForUser(userId),
    getUserCurrency(userId),
  ]);

  return goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    target: formatMoney(goal.target_cents, currency),
    targetCents: goal.target_cents,
    saved: formatMoney(goal.saved_cents, currency),
    savedCents: goal.saved_cents,
    remaining: formatMoney(goal.remaining_cents, currency),
    percentComplete: goal.percent_complete,
    targetDate: goal.target_date,
    isComplete: goal.is_complete,
    completedAt: goal.completed_at,
    currency,
  }));
}

export async function listNotificationsSnapshotForUser(
  userId: string,
  limit = 30,
) {
  const [items, unreadCount] = await Promise.all([
    listNotificationsForUser(userId, limit),
    getUnreadNotificationCount(userId),
  ]);

  return {
    unreadCount,
    notifications: items.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      href: item.href,
      read: item.read_at !== null,
      createdAt: item.created_at,
    })),
  };
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

  const currency = await getUserCurrency(userId);

  return { report: result.data, currency };
}

export async function getFriendBalancesSnapshotForUser(userId: string) {
  const currency = await getUserCurrency(userId);
  const balances = await getFriendBalancesForUser(userId);

  return balances.map((balance) => ({
    friendId: balance.friend.id,
    friendName: balance.friend.display_name,
    username: balance.friend.username,
    netBalance: formatMoney(balance.net_cents, currency),
    netBalanceCents: balance.net_cents,
    currency,
  }));
}

export async function getFriendActivitySnapshotForUser(
  userId: string,
  friendId: string,
) {
  const { getFriendActivityForUser } = await import(
    "@/lib/services/settlements"
  );
  const activity = await getFriendActivityForUser(userId, friendId);
  if (!activity) {
    return { error: "Friend not found or not connected" };
  }

  const currency = await getUserCurrency(userId);

  return {
    currency,
    friend: activity.friend,
    netBalance: formatMoney(activity.netCents, currency),
    netBalanceCents: activity.netCents,
    activity: activity.activity.map((item) =>
      item.type === "expense"
        ? {
            ...item,
            total: formatMoney(item.total_cents, currency),
            yourShare: formatMoney(item.your_share_cents, currency),
            yourPaid: formatMoney(item.your_paid_cents, currency),
          }
        : {
            ...item,
            amount: formatMoney(item.amount_cents, currency),
          },
    ),
  };
}

export async function getSharedOverviewForUser(userId: string) {
  const currency = await getUserCurrency(userId);
  const [balances, friends, pending, shared] = await Promise.all([
    getFriendBalancesForUser(userId),
    listFriendsForUser(userId),
    listPendingRequestsForUser(userId),
    listSharedExpensesForUser(userId),
  ]);

  return {
    currency,
    friendBalances: balances.map((balance) => ({
      friendId: balance.friend.id,
      friendName: balance.friend.display_name,
      username: balance.friend.username,
      netBalance: formatMoney(balance.net_cents, currency),
      netBalanceCents: balance.net_cents,
      summary:
        balance.net_cents > 0
          ? `${balance.friend.display_name ?? "Friend"} owes you ${formatMoney(balance.net_cents, currency)}`
          : balance.net_cents < 0
            ? `You owe ${balance.friend.display_name ?? "friend"} ${formatMoney(Math.abs(balance.net_cents), currency)}`
            : `Settled up with ${balance.friend.display_name ?? "friend"}`,
    })),
    friends: friends.success ? friends.data : [],
    pendingRequests: pending.success ? pending.data : { incoming: [], outgoing: [] },
    sharedExpenses: shared.success
      ? shared.data.slice(0, 20).map((expense) => ({
          id: expense.id,
          description: expense.description,
          total: formatMoney(expense.total_cents, expense.currency_code),
          totalCents: expense.total_cents,
          currency: expense.currency_code,
          date: expense.expense_date,
          createdByUserId: expense.created_by_user_id,
        }))
      : [],
  };
}
