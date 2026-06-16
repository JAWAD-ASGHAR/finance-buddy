"use client";

import { markAlertRead } from "@/actions/alerts";
import type { Alert } from "@/types/finance";
import { AppCard } from "@/components/app/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState<string | null>(null);

  if (alerts.length === 0) return null;

  async function dismiss(alertId: string) {
    setDismissing(alertId);
    await markAlertRead(alertId);
    router.refresh();
    setDismissing(null);
  }

  return (
    <AppCard title="Alerts" className="border-amber-200 bg-amber-50/60">
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex items-start justify-between gap-3 rounded-md border border-amber-200 bg-background px-3 py-2"
          >
            <p className="text-sm">{alert.message}</p>
            <button
              type="button"
              disabled={dismissing === alert.id}
              onClick={() => dismiss(alert.id)}
              className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700"
            >
              Dismiss
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Guidance only — not financial advice.
      </p>
    </AppCard>
  );
}
