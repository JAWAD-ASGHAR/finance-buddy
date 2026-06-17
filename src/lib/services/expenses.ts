import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { mapExpense } from "@/db/mappers";
import { getDb } from "@/db/index";
import {
  alerts,
  budgets,
  categories,
  expenses,
  monthlyReports,
} from "@/db/schema";
import { getCurrentBudgetForUser } from "@/lib/db/queries";
import { deleteExpenseAttachmentsForExpense } from "@/lib/services/images";
import { suggestCategory } from "@/lib/finance/categorize";
import {
  parseExpenseText,
  parseReceiptText,
} from "@/lib/finance/parse-text";
import { refreshAlertsForBudget } from "@/lib/services/alerts";
import type { ActionResult, Expense, ExpenseSource } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";

const addExpenseSchema = z.object({
  amountCents: z.number().int().positive(),
  description: z.string().min(1).max(200),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categoryId: z.string().uuid(),
  suggestedCategoryId: z.string().uuid().nullable(),
  userCorrected: z.boolean().default(false),
  source: z.enum(["manual", "receipt_text", "nl_text"]),
});

export async function addExpenseForUser(
  userId: string,
  input: {
    amount: string;
    description: string;
    expenseDate: string;
    categoryId: string;
    suggestedCategoryId?: string | null;
    userCorrected?: boolean;
    source?: ExpenseSource;
  },
): Promise<ActionResult<Expense>> {
  const db = getDb();
  const { budget } = await getCurrentBudgetForUser(userId);

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const amountCents = parseMoneyToCents(input.amount);
  if (amountCents === null || amountCents <= 0) {
    return { success: false, error: "Enter a valid amount" };
  }

  const parsed = addExpenseSchema.safeParse({
    amountCents,
    description: input.description.trim(),
    expenseDate: input.expenseDate,
    categoryId: input.categoryId,
    suggestedCategoryId: input.suggestedCategoryId ?? null,
    userCorrected: input.userCorrected ?? false,
    source: input.source ?? "manual",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const [row] = await db
      .insert(expenses)
      .values({
        userId,
        budgetId: budget.id,
        categoryId: parsed.data.categoryId,
        suggestedCategoryId: parsed.data.suggestedCategoryId,
        amountCents: parsed.data.amountCents,
        description: parsed.data.description,
        expenseDate: parsed.data.expenseDate,
        source: parsed.data.source,
        userCorrected: parsed.data.userCorrected,
      })
      .returning();

    await refreshAlertsForBudget(userId, budget.id);

    return { success: true, data: mapExpense(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add expense",
    };
  }
}

export async function addExpenseFromTextForUser(
  userId: string,
  input: {
    rawText: string;
    source: "receipt_text" | "nl_text";
    categoryId?: string;
    expenseDate?: string;
  },
): Promise<ActionResult<Expense>> {
  const { budget, categories: budgetCategories, expenses: existingExpenses } =
    await getCurrentBudgetForUser(userId);

  if (!budget) {
    return { success: false, error: "Create a monthly budget first" };
  }

  const parsedText =
    input.source === "receipt_text"
      ? parseReceiptText(input.rawText)
      : parseExpenseText(input.rawText);

  if (!parsedText.amountCents || parsedText.amountCents <= 0) {
    return {
      success: false,
      error:
        "Could not find a valid amount in the text. Try including a number like 12.50",
    };
  }

  const suggestion = suggestCategory(
    parsedText.description,
    budgetCategories,
    existingExpenses,
  );

  const categoryId = input.categoryId ?? suggestion.categoryId;
  const userCorrected = Boolean(
    input.categoryId && input.categoryId !== suggestion.categoryId,
  );

  return addExpenseForUser(userId, {
    amount: String(parsedText.amountCents / 100),
    description: parsedText.description,
    expenseDate:
      input.expenseDate ??
      parsedText.expenseDate ??
      new Date().toISOString().slice(0, 10),
    categoryId,
    suggestedCategoryId: suggestion.categoryId,
    userCorrected,
    source: input.source,
  });
}

export async function suggestCategoryForDescriptionForUser(
  userId: string,
  description: string,
): Promise<ActionResult<ReturnType<typeof suggestCategory>>> {
  const { categories: budgetCategories, expenses: existingExpenses } =
    await getCurrentBudgetForUser(userId);

  if (budgetCategories.length === 0) {
    return { success: false, error: "Create categories first" };
  }

  const suggestion = suggestCategory(
    description,
    budgetCategories,
    existingExpenses,
  );
  return { success: true, data: suggestion };
}

export async function updateExpenseCategoryForUser(
  userId: string,
  input: { expenseId: string; categoryId: string },
): Promise<ActionResult<Expense>> {
  const db = getDb();

  const existing = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, input.expenseId), eq(expenses.userId, userId)),
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  const userCorrected = existing.categoryId !== input.categoryId;

  const [row] = await db
    .update(expenses)
    .set({
      categoryId: input.categoryId,
      userCorrected: userCorrected || existing.userCorrected,
    })
    .where(and(eq(expenses.id, input.expenseId), eq(expenses.userId, userId)))
    .returning();

  if (!row) {
    return { success: false, error: "Failed to update expense" };
  }

  await refreshAlertsForBudget(userId, existing.budgetId);

  return { success: true, data: mapExpense(row) };
}

export async function deleteExpenseForUser(
  userId: string,
  expenseId: string,
): Promise<ActionResult<void>> {
  const db = getDb();

  const existing = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, expenseId), eq(expenses.userId, userId)),
    columns: { budgetId: true },
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  try {
    await deleteExpenseAttachmentsForExpense(userId, expenseId);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete attachments",
    };
  }

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)));

  await refreshAlertsForBudget(userId, existing.budgetId);

  return { success: true, data: undefined };
}

export async function deleteAllUserDataForUser(
  userId: string,
): Promise<ActionResult<void>> {
  const db = getDb();

  try {
    await db.transaction(async (tx) => {
      await tx.delete(monthlyReports).where(eq(monthlyReports.userId, userId));
      await tx.delete(alerts).where(eq(alerts.userId, userId));
      await tx.delete(expenses).where(eq(expenses.userId, userId));
      await tx.delete(categories).where(eq(categories.userId, userId));
      await tx.delete(budgets).where(eq(budgets.userId, userId));
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete data",
    };
  }

  return { success: true, data: undefined };
}
