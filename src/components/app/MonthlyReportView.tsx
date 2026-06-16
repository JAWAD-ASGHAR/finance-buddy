import type { MonthlyReportSummary } from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { ForecastCard } from "@/components/app/ForecastCard";
import { AppCard } from "@/components/app/ui";
import { CategorySpendChart } from "@/components/charts/CategorySpendChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { buildCategoryChartData } from "@/lib/finance/chart-data";

export function MonthlyReportView({
  summary,
}: {
  summary: MonthlyReportSummary;
}) {
  const categoryChartData = buildCategoryChartData(
    summary.categoryBreakdown.map((category) => ({
      categoryId: category.name,
      name: category.name,
      allocatedCents: category.allocatedCents,
      spentCents: category.spentCents,
      remainingCents: category.allocatedCents - category.spentCents,
      percentUsed: category.percentUsed,
    })),
  );

  return (
    <div className="space-y-6">
      <AppCard title={`${summary.periodLabel} summary`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Income
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(summary.incomeCents)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Total spent
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(summary.totalSpentCents)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Remaining
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(summary.remainingCents)}
            </p>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6 lg:grid-cols-5">
        <AppCard
          className="lg:col-span-3"
          title="Spending trend"
          description="Cumulative spend through the month compared to an even budget pace."
        >
          {summary.dailySpending?.length ? (
            <SpendingTrendChart data={summary.dailySpending} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Regenerate the report to include the spending trend chart.
            </p>
          )}
        </AppCard>

        <AppCard
          className="lg:col-span-2"
          title="Category spend"
          description="Spent vs allocated by category."
        >
          {categoryChartData.length > 0 ? (
            <CategorySpendChart data={categoryChartData} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No category spending recorded yet.
            </p>
          )}
        </AppCard>
      </div>

      <AppCard title="Category breakdown">
        <ul className="space-y-3">
          {summary.categoryBreakdown.map((category) => (
            <li
              key={category.name}
              className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0"
            >
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground">
                {formatMoney(category.spentCents)} /{" "}
                {formatMoney(category.allocatedCents)} ({category.percentUsed}%)
              </span>
            </li>
          ))}
        </ul>
      </AppCard>

      <AppCard title="Insights">
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {summary.insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{summary.disclaimer}</p>
      </AppCard>

      <ForecastCard forecast={summary.forecast} />
    </div>
  );
}
