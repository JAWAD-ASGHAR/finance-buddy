import Link from "next/link";
import {
  FriendSearchForm,
  PendingRequestsPanel,
} from "@/components/shared/FriendSearchForm";
import { AppCard, AppPageHeader } from "@/components/app/ui";
import { getFriendBalancesForUser } from "@/lib/services/settlements";
import {
  getAcceptedFriends,
  getPendingFriendRequests,
} from "@/lib/db/shared-queries";
import { requireAuthUser } from "@/lib/db/queries";
import { getUserCurrency } from "@/lib/auth/user-preferences";
import type { CurrencyCode } from "@/lib/finance/currency";
import { formatMoney } from "@/types/finance";
import { cn } from "@/lib/utils";

function balanceLabel(netCents: number, currency: CurrencyCode): string {
  if (netCents === 0) return "Settled up";
  if (netCents > 0) return `Owes you ${formatMoney(netCents, currency)}`;
  return `You owe ${formatMoney(Math.abs(netCents), currency)}`;
}

export default async function FriendsPage() {
  const user = await requireAuthUser();
  const [friends, pending, balances, currency] = await Promise.all([
    getAcceptedFriends(user.id),
    getPendingFriendRequests(user.id),
    getFriendBalancesForUser(user.id),
    getUserCurrency(user.id),
  ]);
  const balanceByFriendId = new Map(
    balances.map((balance) => [balance.friend.id, balance.net_cents]),
  );

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
              {friends.map((friend) => {
                const netCents = balanceByFriendId.get(friend.id) ?? 0;

                return (
                  <li key={friend.id}>
                    <Link
                      href={`/friends/${friend.id}`}
                      className="flex flex-col gap-1 py-3 transition-colors hover:text-accent-green sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm font-medium">
                        {friend.display_name ?? "Friend"}
                        {friend.username ? (
                          <span className="ml-2 font-normal text-muted-foreground">
                            @{friend.username}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "text-xs sm:text-sm",
                          netCents > 0 && "text-accent-green",
                          netCents < 0 && "text-destructive",
                          netCents === 0 && "text-muted-foreground",
                        )}
                      >
                        {balanceLabel(netCents, currency)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </AppCard>
      </div>
    </>
  );
}
