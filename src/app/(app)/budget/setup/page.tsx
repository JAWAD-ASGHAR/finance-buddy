import { redirect } from "next/navigation";
import { getCurrentBudget } from "@/lib/supabase/queries";

export default async function BudgetSetupRedirectPage() {
  const { budget } = await getCurrentBudget();

  redirect(budget ? "/dashboard/budget/edit" : "/dashboard");
}
