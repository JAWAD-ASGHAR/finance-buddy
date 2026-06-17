"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordSettlement } from "@/actions/settlements";
import { useCurrency } from "@/components/app/CurrencyProvider";
import {
  AppButton,
  AppCard,
  AppError,
  AppInput,
} from "@/components/app/ui";
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
  const router = useRouter();
  const { formatMoney, amountLabel } = useCurrency();
  const [amount, setAmount] = useState(
    netCents < 0 ? (Math.abs(netCents) / 100).toFixed(2) : "",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showSettle, setShowSettle] = useState(netCents < 0);

  async function handleSettle(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await recordSettlement({
      friendId: friend.id,
      amount,
      note,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setAmount("");
    setNote("");
    setPending(false);
    setShowSettle(false);
    router.refresh();
  }

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
            {showSettle ? (
              <form onSubmit={handleSettle} className="space-y-4">
                <AppInput
                  label={amountLabel}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  required
                />
                <AppInput
                  label="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Cash, bank transfer..."
                />
                {error ? <AppError message={error} /> : null}
                <div className="flex gap-2">
                  <AppButton type="submit" loading={pending}>
                    Record payment
                  </AppButton>
                  <AppButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowSettle(false)}
                  >
                    Cancel
                  </AppButton>
                </div>
              </form>
            ) : (
              <AppButton type="button" onClick={() => setShowSettle(true)}>
                Settle up
              </AppButton>
            )}
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
