import Link from "next/link";
import { AppCard } from "@/components/app/ui";
import type { FriendBalanceTotals } from "@/lib/finance/friend-balances";
import type { CurrencyCode } from "@/lib/finance/currency";
import { formatMoney } from "@/types/finance";
import { cn } from "@/lib/utils";

function netSummary(netCents: number, currency: CurrencyCode): string {
  if (netCents === 0) return "All settled up with friends";
  if (netCents > 0) {
    return `You're owed ${formatMoney(netCents, currency)} overall`;
  }
  return `You owe ${formatMoney(Math.abs(netCents), currency)} overall`;
}

export function SharedBalanceSummary({
  totals,
  currency,
  compact = false,
  showLink = true,
}: {
  totals: FriendBalanceTotals;
  currency: CurrencyCode;
  compact?: boolean;
  showLink?: boolean;
}) {
  const hasActivity =
    totals.owedToYouCents > 0 || totals.youOweCents > 0 || totals.activeFriendCount > 0;

  if (!hasActivity && compact) {
    return null;
  }

  return (
    <AppCard
      title={compact ? "Shared with friends" : "Balance overview"}
      description={
        compact
          ? "Totals across everyone you split bills with."
          : "What friends owe you and what you owe them."
      }
    >
      <div className={cn("grid gap-4", compact ? "sm:grid-cols-3" : "md:grid-cols-3")}>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Friends owe you
          </p>
          <p className="mt-1 text-xl font-semibold text-accent-green sm:text-2xl">
            {formatMoney(totals.owedToYouCents, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            You owe friends
          </p>
          <p className="mt-1 text-xl font-semibold text-destructive sm:text-2xl">
            {formatMoney(totals.youOweCents, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Net balance
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold sm:text-2xl",
              totals.netCents > 0 && "text-accent-green",
              totals.netCents < 0 && "text-destructive",
              totals.netCents === 0 && "text-muted-foreground",
            )}
          >
            {totals.netCents === 0
              ? "Settled"
              : formatMoney(Math.abs(totals.netCents), currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {netSummary(totals.netCents, currency)}
          </p>
        </div>
      </div>

      {!compact && totals.activeFriendCount > 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {totals.activeFriendCount}{" "}
          {totals.activeFriendCount === 1 ? "friend has" : "friends have"} an open balance.
        </p>
      ) : null}

      {showLink ? (
        <p className="mt-4 text-sm">
          <Link
            href="/shared"
            className="font-medium text-accent-green underline-offset-4 hover:underline"
          >
            View shared expense details
          </Link>
        </p>
      ) : null}
    </AppCard>
  );
}
