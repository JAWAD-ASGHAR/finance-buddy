"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  markAlertReadForUser,
  refreshAlertsForBudget,
} from "@/lib/services/alerts";
import { revalidateBudgetPaths } from "@/lib/services/revalidate";
import type { ActionResult, Alert } from "@/types/finance";

export async function refreshAlerts(
  budgetId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await refreshAlertsForBudget(user.id, budgetId);
  if (result.success) {
    revalidateBudgetPaths();
  }
  return result;
}

export async function markAlertRead(
  alertId: string,
): Promise<ActionResult<Alert>> {
  const user = await requireAuthUser();
  const result = await markAlertReadForUser(user.id, alertId);
  if (result.success) {
    revalidateBudgetPaths();
  }
  return result;
}
