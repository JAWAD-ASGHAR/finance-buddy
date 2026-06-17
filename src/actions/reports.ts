"use server";

import { requireAuthUser } from "@/lib/db/queries";
import { getSpendingReportForUser } from "@/lib/services/reports";
import type { ActionResult, MonthlyReportSummary } from "@/types/finance";

export async function getSpendingReport({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): Promise<ActionResult<MonthlyReportSummary>> {
  const user = await requireAuthUser();
  return getSpendingReportForUser(user.id, startDate, endDate);
}
