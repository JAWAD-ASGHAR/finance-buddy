import Link from "next/link";
import { BudgetSetupForm } from "@/components/app/BudgetSetupForm";
import { SharedBalanceSummary } from "@/components/shared/SharedBalanceSummary";
import { getUnreadAlerts, requireAuthUser } from "@/lib/db/queries";
import { syncAlertsForBudget } from "@/lib/finance/sync-alerts";
import { AlertBanner } from "@/components/app/AlertBanner";
import { CategoryProgressBar } from "@/components/app/CategoryProgressBar";
import { ForecastCard } from "@/components/app/ForecastCard";
import { SavingsSummaryCard } from "@/components/app/SavingsSummaryCard";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { FriendBalanceList } from "@/components/shared/FriendBalanceList";
import { computeCategorySummaries, computeMonthlyRemaining } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { computeFriendBalanceTotals } from "@/lib/finance/friend-balances";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { getCurrentBudget } from "@/lib/supabase/queries";
import { getActiveSavingGoals } from "@/actions/saving-goals";
import { getFriendBalancesForCurrentUser } from "@/actions/settlements";
import { formatMoney } from "@/types/finance";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const currency = await getUserCurrency(user.id);
  const [
    { budget, categories, expenses },
    activeSavingsGoals,
    friendBalances,
  ] = await Promise.all([
    getCurrentBudget(),
    getActiveSavingGoals(2),
    getFriendBalancesForCurrentUser(),
  ]);
  const friendBalanceTotals = computeFriendBalanceTotals(friendBalances);

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
        <BudgetSetupForm mode="create" />
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
          <>
            <Link href="/dashboard/budget/edit">
              <AppButton variant="secondary">Edit budget</AppButton>
            </Link>
            <Link href="/expenses/new">
              <AppButton>Add expense</AppButton>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <AlertBanner alerts={alerts} />

        <SharedBalanceSummary
          totals={friendBalanceTotals}
          currency={currency}
          compact
        />

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

        {friendBalances.some((balance) => balance.net_cents !== 0) ? (
          <FriendBalanceList
            balances={friendBalances.filter((balance) => balance.net_cents !== 0)}
          />
        ) : null}

        <ForecastCard forecast={forecast} />

        <SavingsSummaryCard goals={activeSavingsGoals} />

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
