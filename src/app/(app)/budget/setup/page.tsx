import { BudgetSetupForm } from "@/components/app/BudgetSetupForm";
import { AppPageHeader } from "@/components/app/ui";
import { getCurrentBudget } from "@/lib/supabase/queries";

export default async function BudgetSetupPage() {
  const { budget, categories } = await getCurrentBudget();

  return (
    <>
      <AppPageHeader
        title="Monthly budget"
        description="Set your allowance and split it across categories like food, transport, and subscriptions."
      />
      <BudgetSetupForm
        initialIncome={
          budget ? String(budget.income_cents / 100) : undefined
        }
        initialThreshold={budget?.alert_threshold_pct}
        initialCategories={
          categories.length > 0
            ? categories.map((c) => ({
                name: c.name,
                allocated: String(c.allocated_cents / 100),
              }))
            : undefined
        }
      />
    </>
  );
}
