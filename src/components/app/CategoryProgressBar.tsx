"use client";

import { useCurrency } from "@/components/app/CurrencyProvider";
import { Progress } from "@/components/ui/progress";
import {
  getCategoryBudgetDisplay,
  getCategoryBudgetTone,
} from "@/lib/finance/category-budget-display";
import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/types/finance";

const toneClasses = {
  default: "[&_[data-slot=progress-indicator]]:bg-primary",
  warning: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  over: "[&_[data-slot=progress-indicator]]:bg-red-500",
} as const;

export function CategoryProgressBar({
  summary,
  thresholdPct = 80,
}: {
  summary: CategorySummary;
  thresholdPct?: number;
}) {
  const { formatMoney } = useCurrency();
  const display = getCategoryBudgetDisplay(summary);
  const tone = getCategoryBudgetTone(display, thresholdPct);

  const amountLabel = display.hasLimit
    ? `${formatMoney(display.spentCents)} of ${formatMoney(display.allocatedCents)}`
    : display.spentCents > 0
      ? `${formatMoney(display.spentCents)} spent`
      : "No spending yet";

  let statusLabel: string;
  if (!display.hasLimit) {
    statusLabel = "No category limit set";
  } else if (display.isOverBudget) {
    statusLabel = `${formatMoney(display.overByCents)} over budget`;
  } else if (display.isAtLimit) {
    statusLabel = "At limit";
  } else {
    statusLabel = `${formatMoney(display.remainingCents)} left`;
  }

  const usageLabel =
    display.usedPercent !== null ? `${display.usedPercent}% used` : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="font-medium">{summary.name}</span>
        <span className="text-muted-foreground sm:text-right">{amountLabel}</span>
      </div>
      <Progress
        value={display.progressValue}
        className={cn("h-2", toneClasses[tone])}
      />
      <p
        className={cn(
          "text-xs",
          display.isOverBudget
            ? "font-medium text-red-600"
            : "text-muted-foreground",
        )}
      >
        {statusLabel}
        {usageLabel ? ` · ${usageLabel}` : null}
      </p>
    </div>
  );
}
