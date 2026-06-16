"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { refreshAlerts } from "@/actions/alerts";
import { mapExpense } from "@/db/mappers";
import { getDb } from "@/db/index";
import {
  alerts,
  budgets,
  categories,
  expenses,
  monthlyReports,
} from "@/db/schema";
import { suggestCategory } from "@/lib/finance/categorize";
import {
  parseExpenseText,
  parseReceiptText,
} from "@/lib/finance/parse-text";
import { getCurrentBudget, requireAuthUser } from "@/lib/db/queries";
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

export async function addExpense(input: {
  amount: string;
  description: string;
  expenseDate: string;
  categoryId: string;
  suggestedCategoryId?: string | null;
  userCorrected?: boolean;
  source?: ExpenseSource;
}): Promise<ActionResult<Expense>> {
  const db = getDb();
  const user = await requireAuthUser();
  const { budget } = await getCurrentBudget();

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
        userId: user.id,
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

    await refreshAlerts(budget.id);
    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath("/reports");

    return { success: true, data: mapExpense(row) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add expense",
    };
  }
}

export async function addExpenseFromText(input: {
  rawText: string;
  source: "receipt_text" | "nl_text";
  categoryId?: string;
  expenseDate?: string;
}): Promise<ActionResult<Expense>> {
  await requireAuthUser();
  const { budget, categories, expenses: existingExpenses } =
    await getCurrentBudget();

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
    categories,
    existingExpenses,
  );

  const categoryId = input.categoryId ?? suggestion.categoryId;
  const userCorrected = Boolean(
    input.categoryId && input.categoryId !== suggestion.categoryId,
  );

  return addExpense({
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

export async function suggestCategoryForDescription(
  description: string,
): Promise<ActionResult<ReturnType<typeof suggestCategory>>> {
  await requireAuthUser();
  const { categories, expenses: existingExpenses } = await getCurrentBudget();

  if (categories.length === 0) {
    return { success: false, error: "Create categories first" };
  }

  const suggestion = suggestCategory(
    description,
    categories,
    existingExpenses,
  );
  return { success: true, data: suggestion };
}

export async function updateExpenseCategory(input: {
  expenseId: string;
  categoryId: string;
}): Promise<ActionResult<Expense>> {
  const db = getDb();
  const user = await requireAuthUser();

  const existing = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, input.expenseId), eq(expenses.userId, user.id)),
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
    .where(and(eq(expenses.id, input.expenseId), eq(expenses.userId, user.id)))
    .returning();

  if (!row) {
    return { success: false, error: "Failed to update expense" };
  }

  await refreshAlerts(existing.budgetId);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");

  return { success: true, data: mapExpense(row) };
}

export async function deleteExpense(
  expenseId: string,
): Promise<ActionResult<void>> {
  const db = getDb();
  const user = await requireAuthUser();

  const existing = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)),
    columns: { budgetId: true },
  });

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, expenseId), eq(expenses.userId, user.id)));

  await refreshAlerts(existing.budgetId);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");

  return { success: true, data: undefined };
}

export async function deleteAllUserData(): Promise<ActionResult<void>> {
  const db = getDb();
  const user = await requireAuthUser();

  try {
    await db.transaction(async (tx) => {
      await tx.delete(monthlyReports).where(eq(monthlyReports.userId, user.id));
      await tx.delete(alerts).where(eq(alerts.userId, user.id));
      await tx.delete(expenses).where(eq(expenses.userId, user.id));
      await tx.delete(categories).where(eq(categories.userId, user.id));
      await tx.delete(budgets).where(eq(budgets.userId, user.id));
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete data",
    };
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
