import { FriendSearchForm, PendingRequestsPanel } from "@/components/shared/FriendSearchForm";
import { AppPageHeader } from "@/components/app/ui";
import { getAcceptedFriends, getPendingFriendRequests } from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";
import { AppCard } from "@/components/app/ui";

export default async function SharedFriendsPage() {
  const user = await requireAuthUser();
  const [friends, pending] = await Promise.all([
    getAcceptedFriends(user.id),
    getPendingFriendRequests(user.id),
  ]);

  return (
    <>
      <AppPageHeader
        title="Friends"
        description="Connect with people you split bills with."
      />
      <div className="space-y-6">
        <FriendSearchForm />
        <PendingRequestsPanel
          incoming={pending.incoming}
          outgoing={pending.outgoing}
        />
        <AppCard title="Your friends">
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No friends connected yet. Send a request using their sign-in email.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {friends.map((friend) => (
                <li key={friend.id} className="py-3 text-sm font-medium">
                  {friend.display_name ?? "Friend"}
                </li>
              ))}
            </ul>
          )}
        </AppCard>
      </div>
    </>
  );
}
