"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuthUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CATEGORIES,
  getCurrentBudgetPeriod,
  parseMoneyToCents,
  type ActionResult,
  type Budget,
} from "@/types/finance";

const categoryInputSchema = z.object({
  name: z.string().min(1).max(50),
  allocatedCents: z.number().int().min(0),
});

const createBudgetSchema = z.object({
  incomeCents: z.number().int().min(0),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
  categories: z.array(categoryInputSchema).min(1),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
});

export async function createMonthlyBudget(input: {
  income: string;
  alertThresholdPct?: number;
  categories?: Array<{ name: string; allocated: string }>;
}): Promise<ActionResult<{ budgetId: string }>> {
  const user = await requireAuthUser();
  const { year, month } = getCurrentBudgetPeriod();

  const categories =
    input.categories && input.categories.length > 0
      ? input.categories
          .map((c) => ({
            name: c.name.trim(),
            allocatedCents: parseMoneyToCents(c.allocated) ?? 0,
          }))
          .filter((c) => c.name.length > 0)
      : DEFAULT_CATEGORIES.map((c) => ({
          name: c.name,
          allocatedCents: c.allocatedCents,
        }));

  const incomeCents = parseMoneyToCents(input.income);
  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
  }

  const parsed = createBudgetSchema.safeParse({
    incomeCents,
    alertThresholdPct: input.alertThresholdPct ?? 80,
    categories,
    year,
    month,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (existing) {
    return updateExistingBudget(existing.id, user.id, parsed.data);
  }

  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      user_id: user.id,
      year,
      month,
      income_cents: parsed.data.incomeCents,
      alert_threshold_pct: parsed.data.alertThresholdPct,
    })
    .select("*")
    .single();

  if (budgetError || !budget) {
    return { success: false, error: budgetError?.message ?? "Failed to create budget" };
  }

  const categoryRows = parsed.data.categories.map((category, index) => ({
    budget_id: budget.id,
    user_id: user.id,
    name: category.name,
    allocated_cents: category.allocatedCents,
    sort_order: index,
  }));

  const { error: categoryError } = await supabase
    .from("categories")
    .insert(categoryRows);

  if (categoryError) {
    return { success: false, error: categoryError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/budget/setup");
  return { success: true, data: { budgetId: budget.id } };
}

async function updateExistingBudget(
  budgetId: string,
  userId: string,
  data: z.infer<typeof createBudgetSchema>,
): Promise<ActionResult<{ budgetId: string }>> {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("budgets")
    .update({
      income_cents: data.incomeCents,
      alert_threshold_pct: data.alertThresholdPct,
    })
    .eq("id", budgetId)
    .eq("user_id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await supabase.from("categories").delete().eq("budget_id", budgetId);

  const categoryRows = data.categories.map((category, index) => ({
    budget_id: budgetId,
    user_id: userId,
    name: category.name,
    allocated_cents: category.allocatedCents,
    sort_order: index,
  }));

  const { error: categoryError } = await supabase
    .from("categories")
    .insert(categoryRows);

  if (categoryError) {
    return { success: false, error: categoryError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/budget/setup");
  return { success: true, data: { budgetId } };
}

export async function updateBudgetIncome(input: {
  budgetId: string;
  income: string;
}): Promise<ActionResult<Budget>> {
  const user = await requireAuthUser();
  const incomeCents = parseMoneyToCents(input.income);

  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .update({ income_cents: incomeCents })
    .eq("id", input.budgetId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to update budget" };
  }

  revalidatePath("/dashboard");
  return { success: true, data: data as Budget };
}
