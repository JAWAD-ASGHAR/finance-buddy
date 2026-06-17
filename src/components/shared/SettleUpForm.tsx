"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordSettlement } from "@/actions/settlements";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppButton, AppInput } from "@/components/app/ui";
import type { SettlementDirection } from "@/types/shared";

function defaultAmount(defaultAmountCents: number): string {
  return (defaultAmountCents / 100).toFixed(2);
}

export function SettleUpForm({
  friendId,
  direction,
  defaultAmountCents,
  onCancel,
}: {
  friendId: string;
  direction: SettlementDirection;
  defaultAmountCents: number;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const { amountLabel } = useCurrency();
  const [amount, setAmount] = useState(defaultAmount(defaultAmountCents));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  const isPayFriend = direction === "pay_friend";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const result = await recordSettlement({
      friendId,
      amount,
      note,
      direction,
    });

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    toast.success(
      isPayFriend
        ? "Payment sent and your friend has been notified"
        : "Payment recorded and your friend has been notified",
    );
    setPending(false);
    onCancel?.();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder={isPayFriend ? "Bank transfer, cash, Venmo..." : "Cash, bank transfer..."}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <AppButton type="submit" loading={pending}>
          {isPayFriend ? "Send payment" : "Record payment received"}
        </AppButton>
        {onCancel ? (
          <AppButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </AppButton>
        ) : null}
      </div>
    </form>
  );
}

export function SettleUpSection({
  friendId,
  direction,
  defaultAmountCents,
  title,
  description,
}: {
  friendId: string;
  direction: SettlementDirection;
  defaultAmountCents: number;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <AppButton
          type="button"
          className="mt-3"
          variant={direction === "pay_friend" ? "primary" : "secondary"}
          onClick={() => setOpen(true)}
        >
          {direction === "pay_friend" ? "Settle up" : "Record payment"}
        </AppButton>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">
        <SettleUpForm
          friendId={friendId}
          direction={direction}
          defaultAmountCents={defaultAmountCents}
          onCancel={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
