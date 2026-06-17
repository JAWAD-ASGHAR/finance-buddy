import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { getBudgetBundle } from "@/lib/db/queries";
import { detectAlerts } from "@/lib/finance/alerts";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import type { AlertType } from "@/types/finance";

function alertKey(type: AlertType, categoryId: string | null): string {
  return `${type}:${categoryId ?? "none"}`;
}

export async function syncAlertsForBudget(
  budgetId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const bundle = await getBudgetBundle(budgetId, userId);

  if (!bundle) {
    return { ok: false, error: "Budget not found" };
  }

  const summaries = computeCategorySummaries(
    bundle.categories,
    bundle.expenses,
  );
  const forecast = computeForecast(bundle.budget, bundle.expenses);
  const detected = detectAlerts(
    summaries,
    forecast,
    bundle.budget.alert_threshold_pct,
  );

  const existingRows = await db.query.alerts.findMany({
    where: eq(alerts.budgetId, budgetId),
  });

  const existingByKey = new Map(
    existingRows.map((row) => [alertKey(row.type, row.categoryId), row]),
  );
  const detectedKeys = new Set(
    detected.map((alert) => alertKey(alert.type, alert.categoryId)),
  );

  try {
    await db.transaction(async (tx) => {
      for (const alert of detected) {
        const key = alertKey(alert.type, alert.categoryId);
        const existing = existingByKey.get(key);

        if (existing) {
          if (existing.message !== alert.message) {
            await tx
              .update(alerts)
              .set({ message: alert.message })
              .where(eq(alerts.id, existing.id));
          }
          continue;
        }

        await tx.insert(alerts).values({
          userId,
          budgetId,
          categoryId: alert.categoryId,
          type: alert.type,
          message: alert.message,
        });
      }

      const staleAlertIds = existingRows
        .filter(
          (row) => !detectedKeys.has(alertKey(row.type, row.categoryId)),
        )
        .map((row) => row.id);

      if (staleAlertIds.length > 0) {
        await tx.delete(alerts).where(inArray(alerts.id, staleAlertIds));
      }
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to sync alerts",
    };
  }

  return { ok: true };
}
