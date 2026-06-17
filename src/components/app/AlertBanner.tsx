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
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AlertBanner({ alerts }: { alerts: FinanceAlert[] }) {
  const router = useRouter();
  const [visibleAlerts, setVisibleAlerts] = useState(alerts);
  const [dismissing, setDismissing] = useState<string | null>(null);

  useEffect(() => {
    setVisibleAlerts(alerts);
  }, [alerts]);

  if (visibleAlerts.length === 0) return null;

  async function dismiss(alertId: string) {
    const previousAlerts = visibleAlerts;
    setDismissing(alertId);
    setVisibleAlerts((current) => current.filter((item) => item.id !== alertId));

    const result = await markAlertRead(alertId);

    if (!result.success) {
      setVisibleAlerts(previousAlerts);
      toast.error(result.error);
      setDismissing(null);
      return;
    }

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
        {visibleAlerts.map((item) => (
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
                onClick={() => void dismiss(item.id)}
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
