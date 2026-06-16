import Link from "next/link";
import { ExpenseList } from "@/components/app/ExpenseList";
import { AppButton, AppPageHeader } from "@/components/app/ui";
import { getCurrentBudget } from "@/lib/supabase/queries";

export default async function ExpensesPage() {
  const { budget, categories, expenses } = await getCurrentBudget();

  return (
    <>
      <AppPageHeader
        title="Expenses"
        description="Review, recategorize, or delete your spending records."
        action={
          budget ? (
            <Link href="/expenses/new">
              <AppButton>Add expense</AppButton>
            </Link>
          ) : undefined
        }
      />
      <ExpenseList expenses={expenses} categories={categories} />
    </>
  );
}
