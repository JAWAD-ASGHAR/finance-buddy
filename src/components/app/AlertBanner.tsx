"use client";

import { markAlertRead } from "@/actions/alerts";
import type { Alert as FinanceAlert } from "@/types/finance";
import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <span className="min-w-0">{item.message}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={dismissing === item.id}
                aria-busy={dismissing === item.id || undefined}
                onClick={() => dismiss(item.id)}
                className="h-8 shrink-0 self-start text-amber-700 sm:self-auto"
              >
                {dismissing === item.id ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Dismiss
              </Button>
            </AlertDescription>
          </AlertUI>
        ))}
      </CardContent>
    </Card>
  );
}
