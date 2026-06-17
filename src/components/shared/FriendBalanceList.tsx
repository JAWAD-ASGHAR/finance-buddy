"use client";

import Link from "next/link";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppCard } from "@/components/app/ui";
import type { FriendBalance } from "@/types/shared";
import { cn } from "@/lib/utils";

function balanceLabel(
  netCents: number,
  formatMoney: (cents: number) => string,
): string {
  if (netCents === 0) return "Settled up";
  if (netCents > 0) return `owes you ${formatMoney(netCents)}`;
  return `you owe ${formatMoney(Math.abs(netCents))}`;
}

export function FriendBalanceList({ balances }: { balances: FriendBalance[] }) {
  const { formatMoney } = useCurrency();

  if (balances.length === 0) {
    return (
      <AppCard title="Friends" description="Connect with friends to split bills.">
        <p className="text-sm text-muted-foreground">
          No friends yet.{" "}
          <Link href="/shared/friends" className="font-medium text-accent-green underline-offset-4 hover:underline">
            Add a friend
          </Link>{" "}
          to get started.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard title="Balances" description="Who owes whom across shared bills.">
      <ul className="divide-y divide-border">
        {balances.map(({ friend, net_cents }) => (
          <li key={friend.id}>
            <Link
              href={`/shared/friends/${friend.id}`}
              className="flex flex-col gap-1 py-4 transition-colors hover:text-accent-green sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="font-medium">
                {friend.display_name ?? "Friend"}
              </span>
              <span
                className={cn(
                  "text-sm sm:text-right",
                  net_cents > 0 && "text-accent-green",
                  net_cents < 0 && "text-destructive",
                  net_cents === 0 && "text-muted-foreground",
                )}
              >
                {balanceLabel(net_cents, formatMoney)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppCard>
  );
}
