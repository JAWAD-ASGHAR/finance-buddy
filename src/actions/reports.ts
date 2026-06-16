"use server";

import { getLatestReport, requireAuthUser } from "@/lib/db/queries";
import { generateMonthlyReportForUser } from "@/lib/services/reports";
import { revalidateReportPaths } from "@/lib/services/revalidate";
import type { ActionResult, MonthlyReportSummary } from "@/types/finance";

export async function generateMonthlyReport(): Promise<
  ActionResult<MonthlyReportSummary>
> {
  const user = await requireAuthUser();
  const result = await generateMonthlyReportForUser(user.id);
  if (result.success) {
    revalidateReportPaths();
  }
  return result;
}

export { getLatestReport };
