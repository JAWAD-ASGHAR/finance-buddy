import { getCurrentBudgetForUser } from "@/lib/db/queries";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import { buildSpendingReport } from "@/lib/finance/report";
import { validateReportDateRange } from "@/lib/finance/report-date-range";
import { getSavingGoalsWithProgressForUser } from "@/lib/services/saving-goals";
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

  const [{ budget, categories, expenses }, savingGoals, currency] =
    await Promise.all([
      getCurrentBudgetForUser(userId),
      getSavingGoalsWithProgressForUser(userId),
      getUserCurrency(userId),
    ]);

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const summary = buildSpendingReport(
    budget,
    categories,
    expenses,
    startDate,
    endDate,
    savingGoals,
    currency,
  );

  return { success: true, data: summary };
}
