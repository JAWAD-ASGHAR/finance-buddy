"use server";

import { revalidatePath } from "next/cache";
import { buildMonthlyReport } from "@/lib/finance/report";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { getCurrentBudget, requireAuthUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, MonthlyReport, MonthlyReportSummary } from "@/types/finance";

export async function generateMonthlyReport(): Promise<
  ActionResult<MonthlyReportSummary>
> {
  const user = await requireAuthUser();
  const { budget, categories, expenses } = await getCurrentBudget();

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const summaries = computeCategorySummaries(categories, expenses);
  const forecast = computeForecast(budget, expenses);
  const summary = buildMonthlyReport(budget, summaries, expenses, forecast);

  const supabase = await createClient();

  await supabase
    .from("monthly_reports")
    .delete()
    .eq("budget_id", budget.id)
    .eq("user_id", user.id);

  const { error } = await supabase.from("monthly_reports").insert({
    user_id: user.id,
    budget_id: budget.id,
    summary_json: summary,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/reports");
  return { success: true, data: summary };
}

export async function getLatestReport(): Promise<MonthlyReport | null> {
  const user = await requireAuthUser();
  const { budget } = await getCurrentBudget();

  if (!budget) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("monthly_reports")
    .select("*")
    .eq("budget_id", budget.id)
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as MonthlyReport | null) ?? null;
}
