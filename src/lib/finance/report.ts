import type {
  Budget,
  CategorySummary,
  Expense,
  ForecastResult,
  MonthlyReportSummary,
} from "@/types/finance";
import { formatMoney } from "@/types/finance";

const DISCLAIMER =
  "This report is for informational purposes only and does not constitute financial advice.";

export function buildMonthlyReport(
  budget: Budget,
  summaries: CategorySummary[],
  expenses: Expense[],
  forecast: ForecastResult,
): MonthlyReportSummary {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const totalSpentCents = expenses.reduce(
    (sum, e) => sum + e.amount_cents,
    0,
  );
  const remainingCents = budget.income_cents - totalSpentCents;

  const categoryBreakdown = summaries
    .map((s) => ({
      name: s.name,
      spentCents: s.spentCents,
      allocatedCents: s.allocatedCents,
      percentUsed: s.percentUsed,
    }))
    .sort((a, b) => b.spentCents - a.spentCents);

  const insights: string[] = [];

  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    if (top && top.spentCents > 0) {
      const share =
        totalSpentCents > 0
          ? Math.round((top.spentCents / totalSpentCents) * 100)
          : 0;
      insights.push(
        `You spent ${share}% of your total budget on ${top.name} (${formatMoney(top.spentCents)} of ${formatMoney(top.allocatedCents)} allocated).`,
      );
    }
  }

  const overThreshold = summaries.filter((s) => s.percentUsed >= 80);
  if (overThreshold.length > 0) {
    insights.push(
      `${overThreshold.map((s) => s.name).join(", ")} crossed 80% of their category limits.`,
    );
  } else {
    insights.push("All categories are below the 80% alert threshold so far.");
  }

  if (forecast.onTrack) {
    insights.push(
      `At your current pace, you'll finish the month ${formatMoney(forecast.projectedEndBalanceCents)} under budget.`,
    );
  } else {
    insights.push(
      `At your current pace, you'll finish the month ${formatMoney(Math.abs(forecast.projectedEndBalanceCents))} over budget — consider slowing discretionary spending.`,
    );
  }

  const onTrackCategories = summaries.filter(
    (s) => s.allocatedCents > 0 && s.percentUsed < 60,
  );
  if (onTrackCategories.length > 0) {
    insights.push(
      `${onTrackCategories.map((s) => s.name).join(", ")} ${onTrackCategories.length === 1 ? "is" : "are"} on track.`,
    );
  }

  return {
    periodLabel: `${monthNames[budget.month - 1]} ${budget.year}`,
    incomeCents: budget.income_cents,
    totalSpentCents,
    remainingCents,
    categoryBreakdown,
    forecast,
    insights,
    disclaimer: DISCLAIMER,
  };
}
