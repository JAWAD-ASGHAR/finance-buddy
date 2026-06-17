import { addDays, format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
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

export function buildDailySpendingSeriesForRange(
  budget: Budget,
  expenses: Expense[],
  startDate: string,
  endDate: string,
): DailySpendPoint[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const daysInMonth = getDaysInMonth(start);
  const dailyPaceCents = budget.income_cents / daysInMonth;

  const dailyTotals = new Map<string, number>();
  for (const expense of expenses) {
    dailyTotals.set(
      expense.expense_date,
      (dailyTotals.get(expense.expense_date) ?? 0) + expense.amount_cents,
    );
  }

  let cumulativeCents = 0;
  const points: DailySpendPoint[] = [];
  let current = start;

  while (current <= end) {
    const dateKey = format(current, "yyyy-MM-dd");
    const spentCents = dailyTotals.get(dateKey) ?? 0;
    cumulativeCents += spentCents;

    points.push({
      day: points.length + 1,
      label: format(current, "d MMM"),
      spentCents,
      cumulativeCents,
      paceCents: Math.round(dailyPaceCents * current.getDate()),
    });

    current = addDays(current, 1);
  }

  return points;
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
