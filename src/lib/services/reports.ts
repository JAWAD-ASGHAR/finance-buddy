import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { monthlyReports } from "@/db/schema";
import { getCurrentBudgetForUser, getLatestReportForUser } from "@/lib/db/queries";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { computeForecast } from "@/lib/finance/forecast";
import { buildMonthlyReport } from "@/lib/finance/report";
import type { ActionResult, MonthlyReportSummary } from "@/types/finance";

export async function generateMonthlyReportForUser(
  userId: string,
): Promise<ActionResult<MonthlyReportSummary>> {
  const db = getDb();
  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);

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
        eq(monthlyReports.userId, userId),
      ),
    );

  await db.insert(monthlyReports).values({
    userId,
    budgetId: budget.id,
    summaryJson: summary,
  });

  return { success: true, data: summary };
}

export async function getLatestReportForUserService(userId: string) {
  return getLatestReportForUser(userId);
}
