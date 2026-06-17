import Link from "next/link";
import { ExpenseForm } from "@/components/app/ExpenseForm";
import { AppButton, AppCard, AppPageHeader } from "@/components/app/ui";
import { getCurrentBudget } from "@/lib/supabase/queries";

export default async function NewExpensePage() {
  const { budget, categories } = await getCurrentBudget();

  if (!budget || categories.length === 0) {
    return (
      <>
        <AppPageHeader title="Add expense" />
        <AppCard title="Budget required">
          <p className="mb-4 text-sm text-muted-foreground">
            Set up your monthly budget before logging expenses.
          </p>
          <Link href="/dashboard">
            <AppButton>Set up budget</AppButton>
          </Link>
        </AppCard>
      </>
    );
  }

  return (
    <>
      <AppPageHeader
        title="Add expense"
        description="Log manually, paste receipt text, or use quick text like '12 uber home Friday'."
      />
      <ExpenseForm categories={categories} />
    </>
  );
}
