"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSharedExpense } from "@/actions/shared-expenses";
import { useCurrency } from "@/components/app/CurrencyProvider";
import {
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
} from "@/components/app/ui";
import { computeEqualSplits } from "@/lib/finance/shared-splits";
import type { Category } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";
import type { Friend, SplitMode } from "@/types/shared";

export function SharedExpenseForm({
  friends,
  currentUserId,
  categories,
  hasBudget,
}: {
  friends: Friend[];
  currentUserId: string;
  categories: Category[];
  hasBudget: boolean;
}) {
  const router = useRouter();
  const { amountLabel, formatMoney } = useCurrency();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [payerId, setPayerId] = useState(currentUserId);
  const [addToBudget, setAddToBudget] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [pending, setPending] = useState(false);

  const participants = [
    { id: currentUserId, label: "You" },
    ...friends.map((f) => ({
      id: f.id,
      label: f.username
        ? `${f.display_name ?? "Friend"} (@${f.username})`
        : (f.display_name ?? "Friend"),
    })),
  ];

  const activeParticipants = participants.filter(
    (participant) =>
      participant.id === currentUserId
      || selectedFriendIds.includes(participant.id),
  );

  const participantCount = activeParticipants.length;
  const amountCents = parseMoneyToCents(amount);

  const splitPreview = useMemo(() => {
    if (!amountCents || selectedFriendIds.length === 0) {
      return null;
    }

    try {
      return computeEqualSplits({
        totalCents: amountCents,
        participantIds: [currentUserId, ...selectedFriendIds],
        payerId,
      });
    } catch {
      return null;
    }
  }, [amountCents, currentUserId, payerId, selectedFriendIds]);

  function toggleFriend(friendId: string) {
    setSelectedFriendIds((current) => {
      const next = current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId];

      if (payerId === friendId && !next.includes(friendId)) {
        setPayerId(currentUserId);
      }

      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const result = await createSharedExpense({
      amount,
      description,
      expenseDate,
      friendIds: selectedFriendIds,
      splitMode,
      payerId,
      addToBudget,
      categoryId: addToBudget ? categoryId : undefined,
    });

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    router.push("/shared");
    router.refresh();
  }

  if (friends.length === 0) {
    return (
      <AppCard title="Add shared expense">
        <p className="text-sm text-muted-foreground">
          Connect with at least one friend before adding a shared bill.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard title="Bill details">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AppInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, groceries, taxi..."
          required
        />
        <AppInput
          label={amountLabel}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="24.50"
          inputMode="decimal"
          required
        />
        <AppInput
          label="Date"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Split with</p>
            <p className="text-xs text-muted-foreground">
              Select one or more friends. Group bills can include as many people
              as you need.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {friends.map((friend) => {
              const selected = selectedFriendIds.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleFriend(friend.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    selected
                      ? "border-accent-green bg-accent-green-light text-accent-green"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {friend.display_name ?? "Friend"}
                </button>
              );
            })}
          </div>
          {selectedFriendIds.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedFriendIds.length}{" "}
              {selectedFriendIds.length === 1 ? "friend" : "friends"} selected ·{" "}
              {participantCount} people total
            </p>
          ) : null}
        </div>

        <AppSelect
          label="Split type"
          value={splitMode}
          onChange={(e) => setSplitMode(e.target.value as SplitMode)}
        >
          <option value="equal">Split equally</option>
          <option value="single_payer">One person paid</option>
        </AppSelect>

        <AppSelect
          label="Who paid?"
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
        >
          {activeParticipants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.label}
            </option>
          ))}
        </AppSelect>

        {splitPreview ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm">
            <p className="font-medium">Split preview</p>
            <p className="mt-1 text-muted-foreground">
              {formatMoney(amountCents ?? 0)} split {participantCount} ways ·{" "}
              {formatMoney(splitPreview[0]?.shareCents ?? 0)} each
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              {splitPreview.map((split) => {
                const participant = activeParticipants.find(
                  (item) => item.id === split.userId,
                );

                return (
                  <li key={split.userId}>
                    {participant?.label ?? "Participant"}: share{" "}
                    {formatMoney(split.shareCents)}
                    {split.paidCents > 0
                      ? ` · paid ${formatMoney(split.paidCents)}`
                      : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {hasBudget ? (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={addToBudget}
                onChange={(e) => setAddToBudget(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Add my share to personal budget
            </label>
            {addToBudget ? (
              <AppSelect
                label="Budget category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </AppSelect>
            ) : null}
          </div>
        ) : null}

        <AppButton
          type="submit"
          loading={pending}
          disabled={selectedFriendIds.length === 0}
        >
          Add shared expense
        </AppButton>
      </form>
    </AppCard>
  );
}
