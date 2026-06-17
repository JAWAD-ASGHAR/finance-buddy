import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { getBudgetBundle } from "@/lib/db/queries";
import { detectAlerts } from "@/lib/finance/alerts";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { notifyBudgetAlert } from "@/lib/notifications/dispatch";
import type { AlertType } from "@/types/finance";

function alertKey(type: AlertType, categoryId: string | null): string {
  return `${type}:${categoryId ?? ""}`;
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

  const existingAlerts = await db.query.alerts.findMany({
    where: and(eq(alerts.budgetId, budgetId), eq(alerts.userId, userId)),
  });
  const existingKeys = new Set(
    existingAlerts.map((alert) => alertKey(alert.type, alert.categoryId)),
  );

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

  const newlyTriggered = detected.filter(
    (alert) => !existingKeys.has(alertKey(alert.type, alert.categoryId)),
  );

  await db.delete(alerts).where(eq(alerts.budgetId, budgetId));

  let insertedAlerts: (typeof alerts.$inferSelect)[] = [];

  if (detected.length > 0) {
    insertedAlerts = await db
      .insert(alerts)
      .values(
        detected.map((alert) => ({
          userId,
          budgetId,
          categoryId: alert.categoryId,
          type: alert.type,
          message: alert.message,
        })),
      )
      .returning();
  }

  if (newlyTriggered.length > 0) {
    const insertedByKey = new Map(
      insertedAlerts.map((alert) => [
        alertKey(alert.type, alert.categoryId),
        alert,
      ]),
    );

    await Promise.all(
      newlyTriggered.map(async (alert) => {
        const row = insertedByKey.get(
          alertKey(alert.type, alert.categoryId),
        );
        if (!row) return;

        await notifyBudgetAlert({
          userId,
          alertId: row.id,
          alertType: alert.type,
          message: alert.message,
        });
      }),
    );
  }

  return { ok: true };
}
