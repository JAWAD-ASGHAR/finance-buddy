"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { mapAlert } from "@/db/mappers";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { requireAuthUser } from "@/lib/db/queries";
import { syncAlertsForBudget } from "@/lib/finance/sync-alerts";
import type { ActionResult, Alert } from "@/types/finance";

export async function refreshAlerts(
  budgetId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await syncAlertsForBudget(budgetId, user.id);

  if (!result.ok) {
    return { success: false, error: result.error };
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
