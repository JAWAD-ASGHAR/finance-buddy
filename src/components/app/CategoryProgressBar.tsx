import { cn } from "@/lib/utils";
import type { CategorySummary } from "@/types/finance";
import { formatMoney } from "@/types/finance";

export function CategoryProgressBar({
  summary,
  thresholdPct = 80,
}: {
  summary: CategorySummary;
  thresholdPct?: number;
}) {
  const width = Math.min(summary.percentUsed, 100);
  const tone =
    summary.percentUsed >= 100
      ? "bg-red-500"
      : summary.percentUsed >= thresholdPct
        ? "bg-amber-500"
        : "bg-accent-blue";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{summary.name}</span>
        <span className="text-muted-foreground">
          {formatMoney(summary.spentCents)} / {formatMoney(summary.allocatedCents)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatMoney(summary.remainingCents)} remaining · {summary.percentUsed}% used
      </p>
    </div>
  );
}
