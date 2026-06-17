"use client";

import { useCurrency } from "@/components/app/CurrencyProvider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SavingGoalSummary } from "@/types/finance";

export function SavingGoalProgressBar({
  goal,
}: {
  goal: SavingGoalSummary;
}) {
  const { formatMoney } = useCurrency();
  const tone = goal.is_complete
    ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
    : goal.percent_complete >= 80
      ? "[&_[data-slot=progress-indicator]]:bg-primary"
      : "[&_[data-slot=progress-indicator]]:bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="font-medium">{goal.name}</span>
        <span className="text-muted-foreground sm:text-right">
          {formatMoney(goal.saved_cents)} / {formatMoney(goal.target_cents)}
        </span>
      </div>
      <Progress
        value={Math.min(goal.percent_complete, 100)}
        className={cn("h-2", tone)}
      />
      <p className="text-xs text-muted-foreground">
        {goal.is_complete
          ? "Goal reached"
          : `${formatMoney(goal.remaining_cents)} to go · ${goal.percent_complete}% saved`}
        {goal.target_date ? ` · Target ${goal.target_date}` : ""}
      </p>
    </div>
  );
}
