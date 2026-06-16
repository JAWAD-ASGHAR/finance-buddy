"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { monthlyReports } from "@/db/schema";
import {
  getCurrentBudget,
  getLatestReport as fetchLatestReport,
  requireAuthUser,
} from "@/lib/db/queries";
import { buildMonthlyReport } from "@/lib/finance/report";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import type { ActionResult, MonthlyReportSummary } from "@/types/finance";

export async function generateMonthlyReport(): Promise<
  ActionResult<MonthlyReportSummary>
> {
  const db = getDb();
  const user = await requireAuthUser();
  const { budget, categories, expenses } = await getCurrentBudget();

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const summaries = computeCategorySummaries(categories, expenses);
  const forecast = computeForecast(budget, expenses);
  const summary = buildMonthlyReport(budget, summaries, expenses, forecast);

  await db
    .delete(monthlyReports)
    .where(
      and(
        eq(monthlyReports.budgetId, budget.id),
        eq(monthlyReports.userId, user.id),
      ),
    );

  await db.insert(monthlyReports).values({
    userId: user.id,
    budgetId: budget.id,
    summaryJson: summary,
  });

  revalidatePath("/reports");
  return { success: true, data: summary };
}

export async function getLatestReport() {
  return fetchLatestReport();
}
