import type { MonthlyReportSummary } from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { ForecastCard } from "@/components/app/ForecastCard";
import { AppCard } from "@/components/app/ui";

export function MonthlyReportView({
  summary,
}: {
  summary: MonthlyReportSummary;
}) {
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
