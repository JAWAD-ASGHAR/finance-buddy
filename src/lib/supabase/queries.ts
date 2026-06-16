import { getCurrentBudgetPeriod } from "@/types/finance";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import type { Budget, Category, Expense, Alert } from "@/types/finance";

export async function getCurrentBudget(): Promise<{
  budget: Budget | null;
  categories: Category[];
  expenses: Expense[];
}> {
  const user = await getAuthUser();
  if (!user) {
    return { budget: null, categories: [], expenses: [] };
  }

  const { year, month } = getCurrentBudgetPeriod();
  const supabase = await createClient();

  const { data: budget } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (!budget) {
    return { budget: null, categories: [], expenses: [] };
  }

  const [{ data: categories }, { data: expenses }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("budget_id", budget.id)
      .order("sort_order"),
    supabase
      .from("expenses")
      .select("*")
      .eq("budget_id", budget.id)
      .order("expense_date", { ascending: false }),
  ]);

  return {
    budget: budget as Budget,
    categories: (categories ?? []) as Category[],
    expenses: (expenses ?? []) as Expense[],
  };
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getUnreadAlerts(): Promise<Alert[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const { budget } = await getCurrentBudget();
  if (!budget) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("budget_id", budget.id)
    .eq("user_id", user.id)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []) as Alert[];
}
