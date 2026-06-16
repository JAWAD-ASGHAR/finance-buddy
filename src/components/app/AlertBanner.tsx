"use client";

import { markAlertRead } from "@/actions/alerts";
import type { Alert as FinanceAlert } from "@/types/finance";
import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AlertBanner({ alerts }: { alerts: FinanceAlert[] }) {
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
    <Card className="border-amber-200 bg-amber-50/60">
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
        <CardDescription>
          Guidance only — not financial advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((item) => (
          <AlertUI key={item.id} className="bg-background">
            <AlertTitle className="sr-only">Budget alert</AlertTitle>
            <AlertDescription className="flex items-start justify-between gap-3">
              <span>{item.message}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={dismissing === item.id}
                onClick={() => dismiss(item.id)}
                className="shrink-0 text-amber-700"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </AlertUI>
        ))}
      </CardContent>
    </Card>
  );
}
