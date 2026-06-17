import Link from "next/link";
import { getFriendBalancesForCurrentUser } from "@/actions/settlements";
import { FriendBalanceList } from "@/components/shared/FriendBalanceList";
import { PendingRequestsBanner } from "@/components/shared/FriendSearchForm";
import { AppButton, AppPageHeader } from "@/components/app/ui";
import { getPendingFriendRequests } from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";

export default async function SharedPage() {
  const user = await requireAuthUser();
  const [balances, pending] = await Promise.all([
    getFriendBalancesForCurrentUser(),
    getPendingFriendRequests(user.id),
  ]);

  return (
    <>
      <AppPageHeader
        title="Shared expenses"
        description="Split bills with friends and track who owes what."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/friends">
              <AppButton variant="secondary">Manage friends</AppButton>
            </Link>
            <Link href="/shared/expenses/new">
              <AppButton>Add expense</AppButton>
            </Link>
          </div>
        }
      />
      <div className="space-y-6">
        <PendingRequestsBanner incoming={pending.incoming} />
        <FriendBalanceList balances={balances} />
      </div>
    </>
  );
}
