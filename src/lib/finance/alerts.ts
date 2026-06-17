import type {
  CategorySummary,
  DetectedAlert,
  ForecastResult,
} from "@/types/finance";
import { formatMoney } from "@/types/finance";

export function detectAlerts(
  summaries: CategorySummary[],
  forecast: ForecastResult,
  thresholdPct: number,
): DetectedAlert[] {
  const alerts: DetectedAlert[] = [];

  for (const summary of summaries) {
    if (summary.allocatedCents <= 0) continue;

    if (summary.percentUsed >= thresholdPct) {
      const usageMessage =
        summary.remainingCents < 0
          ? `over budget by ${formatMoney(Math.abs(summary.remainingCents))} (${formatMoney(summary.spentCents)} of ${formatMoney(summary.allocatedCents)})`
          : `${summary.percentUsed}% of its budget (${formatMoney(summary.spentCents)} of ${formatMoney(summary.allocatedCents)})`;

      alerts.push({
        type: "category_threshold",
        categoryId: summary.categoryId,
        message: `${summary.name} is ${usageMessage}.`,
      });
    }
  }

  if (!forecast.onTrack) {
    alerts.push({
      type: "monthly_pace",
      categoryId: null,
      message: `At your current pace, you'll finish the month ${formatMoney(Math.abs(forecast.projectedEndBalanceCents))} over budget.`,
    });
  }

  return alerts;
}
