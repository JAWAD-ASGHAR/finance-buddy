"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  addExpenseForUser,
  addExpenseFromTextForUser,
  deleteAllUserDataForUser,
  deleteExpenseForUser,
  suggestCategoryForDescriptionForUser,
  updateExpenseCategoryForUser,
} from "@/lib/services/expenses";
import {
  revalidateBudgetPaths,
  revalidateExpensePaths,
} from "@/lib/services/revalidate";
import { suggestCategory } from "@/lib/finance/categorize";
import type { ActionResult, Expense, ExpenseSource } from "@/types/finance";

export async function addExpense(input: {
  amount: string;
  description: string;
  expenseDate: string;
  categoryId: string;
  suggestedCategoryId?: string | null;
  userCorrected?: boolean;
  source?: ExpenseSource;
}): Promise<ActionResult<Expense>> {
  const user = await requireAuthUser();
  const result = await addExpenseForUser(user.id, input);
  if (result.success) {
    revalidateExpensePaths();
  }
  return result;
}

export async function addExpenseFromText(input: {
  rawText: string;
  source: "receipt_text" | "nl_text";
  categoryId?: string;
  expenseDate?: string;
}): Promise<ActionResult<Expense>> {
  const user = await requireAuthUser();
  const result = await addExpenseFromTextForUser(user.id, input);
  if (result.success) {
    revalidateExpensePaths();
  }
  return result;
}

export async function suggestCategoryForDescription(
  description: string,
): Promise<ActionResult<ReturnType<typeof suggestCategory>>> {
  const user = await requireAuthUser();
  return suggestCategoryForDescriptionForUser(user.id, description);
}

export async function updateExpenseCategory(input: {
  expenseId: string;
  categoryId: string;
}): Promise<ActionResult<Expense>> {
  const user = await requireAuthUser();
  const result = await updateExpenseCategoryForUser(user.id, input);
  if (result.success) {
    revalidateExpensePaths();
  }
  return result;
}

export async function deleteExpense(
  expenseId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await deleteExpenseForUser(user.id, expenseId);
  if (result.success) {
    revalidateExpensePaths();
  }
  return result;
}

export async function deleteAllUserData(): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await deleteAllUserDataForUser(user.id);
  if (result.success) {
    revalidateBudgetPaths();
    revalidateExpensePaths();
  }
  return result;
}
