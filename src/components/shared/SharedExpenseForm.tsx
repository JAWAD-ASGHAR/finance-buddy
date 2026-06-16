"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSharedExpense } from "@/actions/shared-expenses";
import {
  AppButton,
  AppCard,
  AppError,
  AppInput,
  AppSelect,
} from "@/components/app/ui";
import type { Category } from "@/types/finance";
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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const participants = [
    { id: currentUserId, label: "You" },
    ...friends.map((f) => ({
      id: f.id,
      label: f.display_name ?? "Friend",
    })),
  ];

  function toggleFriend(friendId: string) {
    setSelectedFriendIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

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
      setError(result.error);
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
          label="Amount (£)"
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

        <div className="space-y-2">
          <p className="text-sm font-medium">Split with</p>
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
          {participants
            .filter(
              (p) =>
                p.id === currentUserId || selectedFriendIds.includes(p.id),
            )
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
        </AppSelect>

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

        {error ? <AppError message={error} /> : null}

        <AppButton type="submit" disabled={pending || selectedFriendIds.length === 0}>
          {pending ? "Saving..." : "Add shared expense"}
        </AppButton>
      </form>
    </AppCard>
  );
}
