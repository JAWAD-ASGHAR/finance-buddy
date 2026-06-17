import { getCurrentBudgetForUser } from "@/lib/db/queries";
import { buildSpendingReport } from "@/lib/finance/report";
import { validateReportDateRange } from "@/lib/finance/report-date-range";
import type { ActionResult, MonthlyReportSummary } from "@/types/finance";

export async function getSpendingReportForUser(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ActionResult<MonthlyReportSummary>> {
  const validation = validateReportDateRange(startDate, endDate);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const { budget, categories, expenses } = await getCurrentBudgetForUser(userId);

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const summary = buildSpendingReport(
    budget,
    categories,
    expenses,
    startDate,
    endDate,
  );

  return { success: true, data: summary };
}
