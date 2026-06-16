import Link from "next/link";
import { getUnreadAlerts, requireAuthUser } from "@/lib/db/queries";
import { syncAlertsForBudget } from "@/lib/finance/sync-alerts";
import { AlertBanner } from "@/components/app/AlertBanner";
import { CategoryProgressBar } from "@/components/app/CategoryProgressBar";
import { ForecastCard } from "@/components/app/ForecastCard";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { getCurrentBudget } from "@/lib/supabase/queries";
import { formatMoney } from "@/types/finance";

export default async function DashboardPage() {
  const { budget, categories, expenses } = await getCurrentBudget();

  if (budget) {
    const user = await requireAuthUser();
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
            <p className="mt-1 text-2xl font-semibold">
              {formatMoney(budget.income_cents)}
            </p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Remaining this month
            </p>
            <p
              className={`mt-1 text-2xl font-semibold ${monthlyRemaining >= 0 ? "text-emerald-700" : "text-red-600"}`}
            >
              {formatMoney(monthlyRemaining)}
            </p>
          </AppCard>
          <AppCard>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Alert threshold
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {budget.alert_threshold_pct}%
            </p>
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
