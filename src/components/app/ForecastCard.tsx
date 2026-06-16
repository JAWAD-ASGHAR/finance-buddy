import type { ForecastResult } from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { AppCard } from "@/components/app/ui";

export function ForecastCard({ forecast }: { forecast: ForecastResult }) {
  return (
    <AppCard title="Month-end forecast">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Projected balance
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${forecast.onTrack ? "text-emerald-700" : "text-red-600"}`}
          >
            {formatMoney(forecast.projectedEndBalanceCents)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {forecast.onTrack
              ? "On track to finish under budget"
              : "Currently projected to overspend"}
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Daily burn rate</span>
            <span className="font-medium">
              {formatMoney(forecast.dailyBurnRateCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Spent so far</span>
            <span className="font-medium">
              {formatMoney(forecast.spentToDateCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Days remaining</span>
            <span className="font-medium">{forecast.daysRemaining}</span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}
