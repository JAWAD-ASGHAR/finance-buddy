"use client";

import Link from "next/link";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppCard } from "@/components/app/ui";
import {
  computeFriendBalanceTotals,
  type FriendBalanceTotals,
} from "@/lib/finance/friend-balances";
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

function BalanceSection({
  title,
  description,
  balances,
  formatMoney,
}: {
  title: string;
  description: string;
  balances: FriendBalance[];
  formatMoney: (cents: number) => string;
}) {
  if (balances.length === 0) return null;

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {balances.map(({ friend, net_cents }) => (
          <li key={friend.id} className="transition-colors hover:bg-muted/40">
            <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <Link
                href={`/friends/${friend.id}`}
                className="min-w-0 transition-colors hover:text-accent-green"
              >
                <span className="font-medium">
                  {friend.display_name ?? "Friend"}
                  {friend.username ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      @{friend.username}
                    </span>
                  ) : null}
                </span>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    net_cents > 0 && "text-accent-green",
                    net_cents < 0 && "text-destructive",
                    net_cents === 0 && "text-muted-foreground",
                  )}
                >
                  {balanceLabel(net_cents, formatMoney)}
                </p>
              </Link>
              {net_cents !== 0 ? (
                <Link
                  href={`/friends/${friend.id}`}
                  className="shrink-0 text-sm font-medium text-accent-green underline-offset-4 hover:underline"
                >
                  Settle up
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FriendBalanceList({
  balances,
  totals: totalsProp,
}: {
  balances: FriendBalance[];
  totals?: FriendBalanceTotals;
}) {
  const { formatMoney } = useCurrency();
  const totals = totalsProp ?? computeFriendBalanceTotals(balances);

  if (balances.length === 0) {
    return (
      <AppCard title="Friends" description="Connect with friends to split bills.">
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
      </AppCard>
    );
  }

  const owedToYou = balances.filter((balance) => balance.net_cents > 0);
  const youOwe = balances.filter((balance) => balance.net_cents < 0);
  const settled = balances.filter((balance) => balance.net_cents === 0);

  return (
    <div className="space-y-6">
      <AppCard title="Totals" description="Quick summary across all friends.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Friends owe you
            </p>
            <p className="mt-1 text-lg font-semibold text-accent-green">
              {formatMoney(totals.owedToYouCents)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              You owe friends
            </p>
            <p className="mt-1 text-lg font-semibold text-destructive">
              {formatMoney(totals.youOweCents)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Net
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-semibold",
                totals.netCents > 0 && "text-accent-green",
                totals.netCents < 0 && "text-destructive",
                totals.netCents === 0 && "text-muted-foreground",
              )}
            >
              {totals.netCents === 0
                ? "Settled"
                : formatMoney(Math.abs(totals.netCents))}
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard title="By friend" description="Tap a friend for activity and settle up.">
        <div className="space-y-6">
          <BalanceSection
            title="Friends who owe you"
            description="They still need to pay you back."
            balances={owedToYou}
            formatMoney={formatMoney}
          />
          <BalanceSection
            title="Friends you owe"
            description="You still need to pay them back."
            balances={youOwe}
            formatMoney={formatMoney}
          />
          <BalanceSection
            title="Settled up"
            description="No open balance right now."
            balances={settled}
            formatMoney={formatMoney}
          />
        </div>
      </AppCard>
    </div>
  );
}
