import {
  FriendSearchForm,
  PendingRequestsPanel,
} from "@/components/shared/FriendSearchForm";
import { FriendBalanceList } from "@/components/shared/FriendBalanceList";
import { AppPageHeader } from "@/components/app/ui";
import { getFriendBalancesForCurrentUser } from "@/actions/settlements";
import { getPendingFriendRequests } from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";

export default async function FriendsPage() {
  const user = await requireAuthUser();
  const [balances, pending] = await Promise.all([
    getFriendBalancesForCurrentUser(),
    getPendingFriendRequests(user.id),
  ]);

  return (
    <>
      <AppPageHeader
        title="Friends"
        description="Find people, manage requests, and view shared activity."
      />
      <div className="space-y-6">
        <FriendSearchForm />

        <div id="requests" className="grid gap-6 lg:grid-cols-2">
          <PendingRequestsPanel
            incoming={pending.incoming}
            outgoing={pending.outgoing}
          />
          <FriendBalanceList balances={balances} />
        </div>
      </div>
    </>
  );
}
