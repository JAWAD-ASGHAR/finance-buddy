import { format, getDaysInMonth, startOfMonth } from "date-fns";
import type {
  Budget,
  CategorySummary,
  DailySpendPoint,
  Expense,
} from "@/types/finance";

export type { DailySpendPoint };

export type CategoryChartPoint = {
  name: string;
  spent: number;
  allocated: number;
};

export function buildDailySpendingSeries(
  budget: Budget,
  expenses: Expense[],
  today: Date = new Date(),
): DailySpendPoint[] {
  const monthStart = startOfMonth(new Date(budget.year, budget.month - 1, 1));
  const daysInMonth = getDaysInMonth(monthStart);
  const monthEnd = new Date(budget.year, budget.month - 1, daysInMonth);
  const referenceDate =
    today < monthStart ? monthStart : today > monthEnd ? monthEnd : today;
  const activeDay = referenceDate.getDate();

  const dailyTotals = new Map<number, number>();
  for (const expense of expenses) {
    const day = Number.parseInt(expense.expense_date.slice(8, 10), 10);
    if (Number.isNaN(day)) continue;
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + expense.amount_cents);
  }

  const dailyPaceCents = budget.income_cents / daysInMonth;
  let cumulativeCents = 0;

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const spentCents = dailyTotals.get(day) ?? 0;
    cumulativeCents += spentCents;

    return {
      day,
      label: format(new Date(budget.year, budget.month - 1, day), "d MMM"),
      spentCents: day <= activeDay ? spentCents : 0,
      cumulativeCents: day <= activeDay ? cumulativeCents : 0,
      paceCents: Math.round(dailyPaceCents * day),
    };
  });
}

export function buildCategoryChartData(
  summaries: CategorySummary[],
): CategoryChartPoint[] {
  return summaries
    .filter((summary) => summary.spentCents > 0 || summary.allocatedCents > 0)
    .map((summary) => ({
      name: summary.name,
      spent: summary.spentCents / 100,
      allocated: summary.allocatedCents / 100,
    }));
}

export function toChartCurrency(cents: number): number {
  return Math.round(cents) / 100;
}
