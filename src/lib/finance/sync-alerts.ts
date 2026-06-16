import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { alerts } from "@/db/schema";
import { getBudgetBundle } from "@/lib/db/queries";
import { detectAlerts } from "@/lib/finance/alerts";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";

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

  await db.delete(alerts).where(eq(alerts.budgetId, budgetId));

  if (detected.length > 0) {
    await db.insert(alerts).values(
      detected.map((alert) => ({
        userId,
        budgetId,
        categoryId: alert.categoryId,
        type: alert.type,
        message: alert.message,
      })),
    );
  }

  return { ok: true };
}
