import Link from "next/link";
import { AppCard } from "@/components/app/ui";
import { UserAvatar } from "@/components/app/UserAvatar";
import type { Friend } from "@/types/shared";

type FriendListProps = {
  friends: Friend[];
};

export function FriendList({ friends }: FriendListProps) {
  if (friends.length === 0) {
    return (
      <AppCard title="Your friends" description="People you are connected with.">
        <p className="text-sm text-muted-foreground">
          No friends yet. Search above to find people and send a request.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard title="Your friends" description="Tap a friend to view shared activity.">
      <ul className="space-y-3">
        {friends.map((friend) => (
          <li key={friend.id}>
            <Link
              href={`/friends/${friend.id}`}
              className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <UserAvatar
                displayName={friend.display_name}
                username={friend.username}
                avatarPath={friend.avatar_path}
                className="size-10"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {friend.display_name ?? "Friend"}
                </p>
                {friend.username ? (
                  <p className="text-xs text-muted-foreground">
                    @{friend.username}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppCard>
  );
}
