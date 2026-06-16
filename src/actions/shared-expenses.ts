"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  createSharedExpenseForUser,
  deleteSharedExpenseForUser,
  getSharedExpenseDetailForUserService,
  listSharedExpensesForUser,
} from "@/lib/services/shared-expenses";
import {
  revalidateExpensePaths,
  revalidateSharedPaths,
} from "@/lib/services/revalidate";
import type { ActionResult } from "@/types/finance";
import type { SharedExpenseDetail, SplitMode } from "@/types/shared";

export async function createSharedExpense(input: {
  amount: string;
  description: string;
  expenseDate: string;
  friendIds: string[];
  splitMode: SplitMode;
  payerId: string;
  addToBudget?: boolean;
  categoryId?: string;
}): Promise<ActionResult<SharedExpenseDetail>> {
  const user = await requireAuthUser();
  const result = await createSharedExpenseForUser(user.id, input);
  if (result.success) {
    revalidateSharedPaths();
    revalidateExpensePaths();
  }
  return result;
}

export async function listSharedExpenses(): Promise<
  ActionResult<SharedExpenseDetail[]>
> {
  const user = await requireAuthUser();
  return listSharedExpensesForUser(user.id);
}

export async function getSharedExpenseDetail(
  expenseId: string,
): Promise<ActionResult<SharedExpenseDetail>> {
  const user = await requireAuthUser();
  return getSharedExpenseDetailForUserService(user.id, expenseId);
}

export async function deleteSharedExpense(
  expenseId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await deleteSharedExpenseForUser(user.id, expenseId);
  if (result.success) {
    revalidateSharedPaths();
    revalidateExpensePaths();
  }
  return result;
}
