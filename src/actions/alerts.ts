"use server";

import { revalidatePath } from "next/cache";
import { detectAlerts } from "@/lib/finance/alerts";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { requireAuthUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Alert } from "@/types/finance";

export async function refreshAlerts(
  budgetId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const [{ data: budget }, { data: categories }, { data: expenses }] =
    await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("id", budgetId)
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("categories")
        .select("*")
        .eq("budget_id", budgetId)
        .order("sort_order"),
      supabase.from("expenses").select("*").eq("budget_id", budgetId),
    ]);

  if (!budget || !categories) {
    return { success: false, error: "Budget not found" };
  }

  const summaries = computeCategorySummaries(
    categories,
    expenses ?? [],
  );
  const forecast = computeForecast(budget, expenses ?? []);
  const detected = detectAlerts(
    summaries,
    forecast,
    budget.alert_threshold_pct,
  );

  await supabase.from("alerts").delete().eq("budget_id", budgetId);

  if (detected.length === 0) {
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  }

  const rows = detected.map((alert) => ({
    user_id: user.id,
    budget_id: budgetId,
    category_id: alert.categoryId,
    type: alert.type,
    message: alert.message,
  }));

  const { error } = await supabase.from("alerts").insert(rows);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function markAlertRead(
  alertId: string,
): Promise<ActionResult<Alert>> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to mark alert read" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: data as Alert };
}
