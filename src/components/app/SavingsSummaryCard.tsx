import Link from "next/link";
import { SavingGoalProgressBar } from "@/components/app/SavingGoalProgressBar";
import { AppButton, AppCard } from "@/components/app/ui";
import type { SavingGoalSummary } from "@/types/finance";

export function SavingsSummaryCard({ goals }: { goals: SavingGoalSummary[] }) {
  if (goals.length === 0) {
    return (
      <AppCard title="Savings goals">
        <p className="mb-4 text-sm text-muted-foreground">
          Track progress toward an emergency fund or something you are saving for.
        </p>
        <Link href="/savings">
          <AppButton>Create a savings goal</AppButton>
        </Link>
      </AppCard>
    );
  }

  return (
    <AppCard
      title="Savings goals"
      description="Progress toward your active targets."
    >
      <div className="space-y-5">
        {goals.map((goal) => (
          <SavingGoalProgressBar key={goal.id} goal={goal} />
        ))}
      </div>
      <div className="mt-4">
        <Link href="/savings">
          <AppButton variant="secondary">Manage savings</AppButton>
        </Link>
      </div>
    </AppCard>
  );
}
