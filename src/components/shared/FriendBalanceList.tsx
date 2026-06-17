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

type FriendBalanceListProps = {
  balances: FriendBalance[];
  title?: string;
  description?: string;
  emptyMessage?: React.ReactNode;
  owingOnly?: boolean;
  footerLink?: { href: string; label: string };
};

export function FriendBalanceList({
  balances,
  title = "Balances",
  description,
  emptyMessage,
  owingOnly = false,
  footerLink,
}: FriendBalanceListProps) {
  const { formatMoney } = useCurrency();

  const visibleBalances = owingOnly
    ? balances.filter((b) => b.net_cents !== 0)
    : balances;

  if (balances.length === 0) {
    return (
      <AppCard title={title} description={description}>
        {emptyMessage ?? (
          <p className="text-sm text-muted-foreground">
            No friends yet.{" "}
            <Link
              href="/friends"
              className="font-medium text-accent-green underline-offset-4 hover:underline"
            >
              Find people
            </Link>{" "}
            to get started.
          </p>
        )}
      </AppCard>
    );
  }

  if (owingOnly && visibleBalances.length === 0) {
    return (
      <AppCard title={title} description={description}>
        <p className="text-sm text-muted-foreground">
          All settled up with your friends.
          {footerLink ? (
            <>
              {" "}
              <Link
                href={footerLink.href}
                className="font-medium text-accent-green underline-offset-4 hover:underline"
              >
                {footerLink.label}
              </Link>
            </>
          ) : null}
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard title={title} description={description}>
      <ul className="divide-y divide-border">
        {visibleBalances.map(({ friend, net_cents }) => (
          <li key={friend.id}>
            <Link
              href={`/friends/${friend.id}`}
              className="flex flex-col gap-1 py-3 transition-colors hover:text-accent-green sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
      {footerLink ? (
        <p className="mt-4 text-sm">
          <Link
            href={footerLink.href}
            className="font-medium text-accent-green underline-offset-4 hover:underline"
          >
            {footerLink.label}
          </Link>
        </p>
      ) : null}
    </AppCard>
  );
}
