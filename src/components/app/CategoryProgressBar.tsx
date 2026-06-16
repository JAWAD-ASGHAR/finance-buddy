import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { Progress } from "@/components/ui/progress";

export function CategoryProgressBar({
  summary,
  thresholdPct = 80,
}: {
  summary: CategorySummary;
  thresholdPct?: number;
}) {
  const tone =
    summary.percentUsed >= 100
      ? "[&_[data-slot=progress-indicator]]:bg-red-500"
      : summary.percentUsed >= thresholdPct
        ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
        : "[&_[data-slot=progress-indicator]]:bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{summary.name}</span>
        <span className="text-muted-foreground">
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
