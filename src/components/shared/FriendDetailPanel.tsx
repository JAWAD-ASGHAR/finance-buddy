"use client";

import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppCard } from "@/components/app/ui";
import { SettleUpSection } from "@/components/shared/SettleUpForm";
import type { FriendActivityItem, FriendBalance } from "@/types/shared";
import { cn } from "@/lib/utils";

function balanceSummary(
  netCents: number,
  formatMoney: (cents: number) => string,
): string {
  if (netCents === 0) return "You are all settled up.";
  if (netCents > 0) return `${formatMoney(netCents)} owed to you`;
  return `You owe ${formatMoney(Math.abs(netCents))}`;
}

export function FriendDetailPanel({
  friend,
  netCents,
  activity,
}: {
  friend: FriendBalance["friend"];
  netCents: number;
  activity: FriendActivityItem[];
}) {
  const { formatMoney } = useCurrency();

  return (
    <div className="space-y-6">
      <AppCard title="Balance">
        <p
          className={cn(
            "text-lg font-medium",
            netCents > 0 && "text-accent-green",
            netCents < 0 && "text-destructive",
            netCents === 0 && "text-muted-foreground",
          )}
        >
          {balanceSummary(netCents, formatMoney)}
        </p>

        {netCents < 0 ? (
          <div className="mt-4">
            <SettleUpSection
              friendId={friend.id}
              direction="pay_friend"
              defaultAmountCents={Math.abs(netCents)}
              title="Send payment"
              description="Record money you sent to this friend. They'll get a notification when you settle up."
            />
          </div>
        ) : null}

        {netCents > 0 ? (
          <div className="mt-4">
            <SettleUpSection
              friendId={friend.id}
              direction="record_friend_payment"
              defaultAmountCents={netCents}
              title="Record payment received"
              description="Use this when your friend paid you back. They'll be notified that you recorded it."
            />
          </div>
        ) : null}
      </AppCard>

      <AppCard title="Activity">
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shared expenses or settlements yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`} className="py-4">
                {item.type === "expense" ? (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.date} · Total {formatMoney(item.total_cents)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your share {formatMoney(item.your_share_cents)}
                        {item.your_paid_cents > 0
                          ? ` · You paid ${formatMoney(item.your_paid_cents)}`
                          : null}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">
                      {item.direction === "you_paid" ? "You paid" : "You received"}{" "}
                      {formatMoney(item.amount_cents)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.date}
                      {item.note ? ` · ${item.note}` : null}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </AppCard>
    </div>
  );
}
