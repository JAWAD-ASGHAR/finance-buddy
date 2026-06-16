import { and, eq } from "drizzle-orm";
import { mapAlert } from "@/db/mappers";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { syncAlertsForBudget } from "@/lib/finance/sync-alerts";
import type { ActionResult, Alert } from "@/types/finance";

export async function refreshAlertsForBudget(
  userId: string,
  budgetId: string,
): Promise<ActionResult<void>> {
  const result = await syncAlertsForBudget(budgetId, userId);

  if (!result.ok) {
    return { success: false, error: result.error };
  }

  return { success: true, data: undefined };
}

export async function markAlertReadForUser(
  userId: string,
  alertId: string,
): Promise<ActionResult<Alert>> {
  const db = getDb();

  const [row] = await db
    .update(alerts)
    .set({ readAt: new Date() })
    .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
    .returning();

  if (!row) {
    return { success: false, error: "Failed to mark alert read" };
  }

  return { success: true, data: mapAlert(row) };
}
