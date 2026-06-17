import Link from "next/link";
import { getUnreadAlerts, requireAuthUser } from "@/lib/db/queries";
import { syncAlertsForBudget } from "@/lib/finance/sync-alerts";
import { AlertBanner } from "@/components/app/AlertBanner";
import { CategoryProgressBar } from "@/components/app/CategoryProgressBar";
import { ForecastCard } from "@/components/app/ForecastCard";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { CategorySpendChart } from "@/components/charts/CategorySpendChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import {
  buildCategoryChartData,
  buildDailySpendingSeries,
} from "@/lib/finance/chart-data";
import { computeForecast } from "@/lib/finance/forecast";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { getCurrentBudget } from "@/lib/supabase/queries";
import { formatMoney } from "@/types/finance";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const currency = await getUserCurrency(user.id);
  const { budget, categories, expenses } = await getCurrentBudget();

  if (budget) {
    await syncAlertsForBudget(budget.id, user.id);
  }

  const alerts = await getUnreadAlerts();

  if (!budget) {
    return (
      <>
        <AppPageHeader
          title="Dashboard"
          description="Set up your monthly budget to start tracking spending."
        />
        <AppCard title="No budget yet">
          <p className="mb-4 text-sm text-muted-foreground">
            Create your allowance and category limits for this month.
          </p>
          <Link href="/budget/setup">
            <AppButton>Set up budget</AppButton>
          </Link>
        </AppCard>
      </>
    );
  }

  const summaries = computeCategorySummaries(categories, expenses);
  const forecast = computeForecast(budget, expenses);
  const monthlyRemaining = computeMonthlyRemaining(
    budget.income_cents,
    expenses,
  );
  const dailySpending = buildDailySpendingSeries(budget, expenses);
  const categoryChartData = buildCategoryChartData(summaries);

  return (
    <>
      <AppPageHeader
        title="Dashboard"
        description="Your remaining budget, forecast, and alerts for this month."
        action={
          <Link href="/expenses/new">
            <AppButton>Add expense</AppButton>
          </Link>
        }
      />

      <div className="space-y-6">
        <AlertBanner alerts={alerts} />

        <div className="grid gap-4 sm:grid-cols-3">
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Monthly income
            </p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">
              {formatMoney(budget.income_cents, currency)}
            </p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Remaining this month
            </p>
            <p
              className={`mt-1 text-xl font-semibold sm:text-2xl ${monthlyRemaining >= 0 ? "text-emerald-700" : "text-red-600"}`}
            >
              {formatMoney(monthlyRemaining, currency)}
            </p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Alert threshold
            </p>
            <p className="mt-1 text-xl font-semibold sm:text-2xl">
              {budget.alert_threshold_pct}%
            </p>
          </AppCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <AppCard
            className="lg:col-span-3"
            title="Spending trend"
            description="Your cumulative spend this month against an even budget pace."
          >
            <SpendingTrendChart data={dailySpending} />
          </AppCard>

          <AppCard
            className="lg:col-span-2"
            title="Category spend"
            description="Quick view of where your budget is going."
          >
            {categoryChartData.length > 0 ? (
              <CategorySpendChart data={categoryChartData} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Add expenses to see category spending.
              </p>
            )}
          </AppCard>
        </div>

        <ForecastCard forecast={forecast} />

        <AppCard title="Category budgets">
          <div className="space-y-5">
            {summaries.map((summary) => (
              <CategoryProgressBar
                key={summary.categoryId}
                summary={summary}
                thresholdPct={budget.alert_threshold_pct}
              />
            ))}
          </div>
        </AppCard>
      </div>
    </>
  );
}
