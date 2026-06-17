import Link from "next/link";
import {
  FriendSearchForm,
  PendingRequestsPanel,
} from "@/components/shared/FriendSearchForm";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import {
  getAcceptedFriends,
  getPendingFriendRequests,
} from "@/lib/db/shared-queries";
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
        description="Find people, manage requests, and view your connections."
      />
      <div className="space-y-6">
        <FriendSearchForm />
        <div id="requests">
          <PendingRequestsPanel
            incoming={pending.incoming}
            outgoing={pending.outgoing}
          />
        </div>
        <AppCard title="Your friends">
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No friends connected yet. Search by username above to send a
              request.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {friends.map((friend) => (
                <li key={friend.id}>
                  <Link
                    href={`/friends/${friend.id}`}
                    className="flex flex-col gap-0.5 py-3 transition-colors hover:text-accent-green sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium">
                      {friend.display_name ?? "Friend"}
                      {friend.username ? (
                        <span className="ml-2 font-normal text-muted-foreground">
                          @{friend.username}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      View activity →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AppCard>
      </div>
    </>
  );
}
