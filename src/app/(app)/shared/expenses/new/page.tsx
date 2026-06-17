import Link from "next/link";
import { SharedExpenseForm } from "@/components/shared/SharedExpenseForm";
import { AppPageHeader } from "@/components/app/ui";
import { getAcceptedFriends } from "@/lib/db/shared-queries";
import { getCurrentBudget, requireAuthUser } from "@/lib/db/queries";

export default async function NewSharedExpensePage() {
  const user = await requireAuthUser();
  const [{ budget, categories }, friends] = await Promise.all([
    getCurrentBudget(),
    getAcceptedFriends(user.id),
  ]);

  return (
    <>
      <p className="mb-4">
        <Link
          href="/shared"
          className="text-sm text-accent-green underline-offset-4 hover:underline"
        >
          Back to shared expenses
        </Link>
      </p>
      <AppPageHeader
        title="Add shared expense"
        description="Split a bill equally between you and one or more friends."
      />
      <SharedExpenseForm
        friends={friends}
        currentUserId={user.id}
        categories={categories}
        hasBudget={Boolean(budget)}
      />
    </>
  );
}
