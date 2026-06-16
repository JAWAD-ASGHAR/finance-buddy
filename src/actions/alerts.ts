"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { mapAlert } from "@/db/mappers";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { detectAlerts } from "@/lib/finance/alerts";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { getBudgetBundle, requireAuthUser } from "@/lib/db/queries";
import type { ActionResult, Alert } from "@/types/finance";

export async function refreshAlerts(
  budgetId: string,
): Promise<ActionResult<void>> {
  const db = getDb();
  const user = await requireAuthUser();
  const bundle = await getBudgetBundle(budgetId, user.id);

  if (!bundle) {
    return { success: false, error: "Budget not found" };
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

  await db.delete(alerts).where(eq(alerts.budgetId, budgetId));

  if (detected.length > 0) {
    await db.insert(alerts).values(
      detected.map((alert) => ({
        userId: user.id,
        budgetId,
        categoryId: alert.categoryId,
        type: alert.type,
        message: alert.message,
      })),
    );
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function markAlertRead(
  alertId: string,
): Promise<ActionResult<Alert>> {
  const db = getDb();
  const user = await requireAuthUser();

  const [row] = await db
    .update(alerts)
    .set({ readAt: new Date() })
    .where(and(eq(alerts.id, alertId), eq(alerts.userId, user.id)))
    .returning();

  if (!row) {
    return { success: false, error: "Failed to mark alert read" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: mapAlert(row) };
}
