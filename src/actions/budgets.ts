"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  createMonthlyBudgetForUser,
  updateBudgetIncomeForUser,
} from "@/lib/services/budgets";
import { revalidateBudgetPaths } from "@/lib/services/revalidate";
import type { ActionResult, Budget } from "@/types/finance";

export async function createMonthlyBudget(input: {
  income: string;
  alertThresholdPct?: number;
  categories?: Array<{ name: string; allocated: string }>;
}): Promise<ActionResult<{ budgetId: string }>> {
  const user = await requireAuthUser();
  const result = await createMonthlyBudgetForUser(user.id, input);
  if (result.success) {
    revalidateBudgetPaths();
  }
  return result;
}

export async function updateBudgetIncome(input: {
  budgetId: string;
  income: string;
}): Promise<ActionResult<Budget>> {
  const user = await requireAuthUser();
  const result = await updateBudgetIncomeForUser(user.id, input);
  if (result.success) {
    revalidateBudgetPaths();
  }
  return result;
}
