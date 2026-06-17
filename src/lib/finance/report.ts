import type {
  Budget,
  Category,
  CategorySummary,
  Expense,
  MonthlyReportSummary,
} from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { buildDailySpendingSeriesForRange } from "@/lib/finance/chart-data";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import {
  filterExpensesByDateRange,
  formatReportPeriodLabel,
  getMonthStartForDate,
} from "@/lib/finance/report-date-range";
import { parseISO } from "date-fns";

const DISCLAIMER =
  "This report is for informational purposes only and does not constitute financial advice.";

function buildInsights(
  summaries: CategorySummary[],
  totalSpentCents: number,
  forecast: MonthlyReportSummary["forecast"],
): string[] {
  const insights: string[] = [];
  const categoryBreakdown = summaries
    .slice()
    .sort((a, b) => b.spentCents - a.spentCents);

  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    if (top && top.spentCents > 0) {
      const share =
        totalSpentCents > 0
          ? Math.round((top.spentCents / totalSpentCents) * 100)
          : 0;
      insights.push(
        `You spent ${share}% of tracked spending on ${top.name} (${formatMoney(top.spentCents)} of ${formatMoney(top.allocatedCents)} allocated).`,
      );
    }
  }

  const overThreshold = summaries.filter((s) => s.percentUsed >= 80);
  if (overThreshold.length > 0) {
    insights.push(
      `${overThreshold.map((s) => s.name).join(", ")} crossed 80% of their category limits.`,
    );
  } else if (totalSpentCents > 0) {
    insights.push("All categories are below the 80% alert threshold in this period.");
  }

  if (totalSpentCents > 0) {
    if (forecast.onTrack) {
      insights.push(
        `At your current pace, you'll finish the month ${formatMoney(forecast.projectedEndBalanceCents)} under budget.`,
      );
    } else {
      insights.push(
        `At your current pace, you'll finish the month ${formatMoney(Math.abs(forecast.projectedEndBalanceCents))} over budget — consider slowing discretionary spending.`,
      );
    }
  }

  const onTrackCategories = summaries.filter(
    (s) => s.allocatedCents > 0 && s.percentUsed < 60,
  );
  if (onTrackCategories.length > 0) {
    insights.push(
      `${onTrackCategories.map((s) => s.name).join(", ")} ${onTrackCategories.length === 1 ? "is" : "are"} on track.`,
    );
  }

  if (insights.length === 0) {
    insights.push("No spending recorded for this period yet.");
  }

  return insights;
}

export function buildSpendingReport(
  budget: Budget,
  categories: Category[],
  allExpenses: Expense[],
  startDate: string,
  endDate: string,
): MonthlyReportSummary {
  const rangeExpenses = filterExpensesByDateRange(
    allExpenses,
    startDate,
    endDate,
  );
  const summaries = computeCategorySummaries(categories, rangeExpenses);

  const totalSpentCents = rangeExpenses.reduce(
    (sum, expense) => sum + expense.amount_cents,
    0,
  );
  const remainingCents = budget.income_cents - totalSpentCents;

  const monthStart = getMonthStartForDate(endDate);
  const monthToDateExpenses = allExpenses.filter(
    (expense) =>
      expense.expense_date >= monthStart && expense.expense_date <= endDate,
  );
  const forecast = computeForecast(
    budget,
    monthToDateExpenses,
    parseISO(endDate),
  );

  const categoryBreakdown = summaries
    .map((summary) => ({
      name: summary.name,
      spentCents: summary.spentCents,
      allocatedCents: summary.allocatedCents,
      percentUsed: summary.percentUsed,
    }))
    .sort((a, b) => b.spentCents - a.spentCents);

  return {
    periodLabel: formatReportPeriodLabel(startDate, endDate),
    incomeCents: budget.income_cents,
    totalSpentCents,
    remainingCents,
    categoryBreakdown,
    dailySpending: buildDailySpendingSeriesForRange(
      budget,
      rangeExpenses,
      startDate,
      endDate,
    ),
    forecast,
    insights: buildInsights(summaries, totalSpentCents, forecast),
    disclaimer: DISCLAIMER,
  };
}
