"use client";

import { useCurrency } from "@/components/app/CurrencyProvider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/types/finance";

export function CategoryProgressBar({
  summary,
  thresholdPct = 80,
}: {
  summary: CategorySummary;
  thresholdPct?: number;
}) {
  const { formatMoney } = useCurrency();
  const tone =
    summary.percentUsed >= 100
      ? "[&_[data-slot=progress-indicator]]:bg-red-500"
      : summary.percentUsed >= thresholdPct
        ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
        : "[&_[data-slot=progress-indicator]]:bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="font-medium">{summary.name}</span>
        <span className="text-muted-foreground sm:text-right">
          {formatMoney(summary.spentCents)} / {formatMoney(summary.allocatedCents)}
        </span>
      </div>
      <Progress
        value={Math.min(summary.percentUsed, 100)}
        className={cn("h-2", tone)}
      />
      <p className="text-xs text-muted-foreground">
        {formatMoney(summary.remainingCents)} remaining · {summary.percentUsed}% used
      </p>
    </div>
  );
}
