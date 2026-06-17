import { redirect } from "next/navigation";
import { BudgetSetupForm } from "@/components/app/BudgetSetupForm";
import { AppPageHeader } from "@/components/app/ui";
import { computeCategorySummaries } from "@/lib/finance/compute";
import { getCurrentBudget } from "@/lib/supabase/queries";

export default async function EditBudgetPage() {
  const { budget, categories, expenses } = await getCurrentBudget();

  if (!budget) {
    redirect("/dashboard");
  }

  const summaries = computeCategorySummaries(categories, expenses);
  const spentByCategoryId = new Map(
    summaries.map((summary) => [summary.categoryId, summary.spentCents]),
  );

  return (
    <>
      <AppPageHeader
        title="Edit budget"
        description="Update your allowance, categories, and limits for this month without losing expense history."
      />
      <BudgetSetupForm
        mode="edit"
        budgetId={budget.id}
        initialIncome={String(budget.income_cents / 100)}
        initialThreshold={budget.alert_threshold_pct}
        initialCategories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          allocated: String(category.allocated_cents / 100),
          spentCents: spentByCategoryId.get(category.id) ?? 0,
        }))}
      />
    </>
  );
}
