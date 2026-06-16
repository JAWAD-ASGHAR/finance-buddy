"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { refreshAlerts } from "@/actions/alerts";
import { suggestCategory } from "@/lib/finance/categorize";
import {
  parseExpenseText,
  parseReceiptText,
} from "@/lib/finance/parse-text";
import { getCurrentBudget, requireAuthUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
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
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      budget_id: budget.id,
      category_id: parsed.data.categoryId,
      suggested_category_id: parsed.data.suggestedCategoryId,
      amount_cents: parsed.data.amountCents,
      description: parsed.data.description,
      expense_date: parsed.data.expenseDate,
      source: parsed.data.source,
      user_corrected: parsed.data.userCorrected,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to add expense" };
  }

  await refreshAlerts(budget.id);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");

  return { success: true, data: data as Expense };
}

export async function addExpenseFromText(input: {
  rawText: string;
  source: "receipt_text" | "nl_text";
  categoryId?: string;
  expenseDate?: string;
}): Promise<ActionResult<Expense>> {
  await requireAuthUser();
  const { budget, categories, expenses } = await getCurrentBudget();

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
      error: "Could not find a valid amount in the text. Try including a number like 12.50",
    };
  }

  const suggestion = suggestCategory(
    parsedText.description,
    categories,
    expenses,
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
  const { categories, expenses } = await getCurrentBudget();

  if (categories.length === 0) {
    return { success: false, error: "Create categories first" };
  }

  const suggestion = suggestCategory(description, categories, expenses);
  return { success: true, data: suggestion };
}

export async function updateExpenseCategory(input: {
  expenseId: string;
  categoryId: string;
}): Promise<ActionResult<Expense>> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", input.expenseId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  const userCorrected = existing.category_id !== input.categoryId;

  const { data, error } = await supabase
    .from("expenses")
    .update({
      category_id: input.categoryId,
      user_corrected: userCorrected || existing.user_corrected,
    })
    .eq("id", input.expenseId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update expense" };
  }

  await refreshAlerts(existing.budget_id);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");

  return { success: true, data: data as Expense };
}

export async function deleteExpense(
  expenseId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("expenses")
    .select("budget_id")
    .eq("id", expenseId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, error: "Expense not found" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await refreshAlerts(existing.budget_id);
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  revalidatePath("/reports");

  return { success: true, data: undefined };
}

export async function deleteAllUserData(): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const tables = [
    "monthly_reports",
    "alerts",
    "expenses",
    "categories",
    "budgets",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
