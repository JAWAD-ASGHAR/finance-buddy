import {
  endOfMonth,
  getDate,
  getDaysInMonth,
  startOfMonth,
} from "date-fns";
import type { Budget, Expense, ForecastResult } from "@/types/finance";
import { computeTotalSpent } from "@/lib/finance/compute";

export function computeForecast(
  budget: Budget,
  expenses: Expense[],
  today: Date = new Date(),
): ForecastResult {
  const monthStart = startOfMonth(
    new Date(budget.year, budget.month - 1, 1),
  );
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = getDaysInMonth(monthStart);
  const spentToDateCents = computeTotalSpent(expenses);

  const referenceDate =
    today < monthStart ? monthStart : today > monthEnd ? monthEnd : today;

  const daysElapsed = Math.max(1, getDate(referenceDate));
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);
  const dailyBurnRateCents = Math.round(spentToDateCents / daysElapsed);
  const projectedTotalSpendCents = dailyBurnRateCents * daysInMonth;
  const projectedEndBalanceCents =
    budget.income_cents - projectedTotalSpendCents;

  return {
    projectedEndBalanceCents,
    dailyBurnRateCents,
    daysRemaining,
    daysElapsed,
    daysInMonth,
    spentToDateCents,
    projectedTotalSpendCents,
    onTrack: projectedEndBalanceCents >= 0,
  };
}
