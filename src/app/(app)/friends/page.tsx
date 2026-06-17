import {
  FriendSearchForm,
  PendingRequestsPanel,
} from "@/components/shared/FriendSearchForm";
import { FriendList } from "@/components/shared/FriendList";
import { AppPageHeader } from "@/components/app/ui";
import { getAcceptedFriends, getPendingFriendRequests } from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";

export default async function FriendsPage() {
  const user = await requireAuthUser();
  const [friends, pending] = await Promise.all([
    getAcceptedFriends(user.id),
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

        <div id="requests">
          <PendingRequestsPanel
            incoming={pending.incoming}
            outgoing={pending.outgoing}
          />
        </div>

        <FriendList friends={friends} />
      </div>
    </>
  );
}
