"use client";

import {
  addSavingContribution,
  deleteSavingGoal,
  markSavingGoalComplete,
} from "@/actions/saving-goals";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { SavingGoalProgressBar } from "@/components/app/SavingGoalProgressBar";
import { AppButton, AppCard, AppInput } from "@/components/app/ui";
import type { SavingGoalSummary } from "@/types/finance";

function ContributionForm({ goalId }: { goalId: string }) {
  const router = useRouter();
  const { amountLabel } = useCurrency();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [contributedAt, setContributedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);

    const result = await addSavingContribution({
      goalId,
      amount,
      note: note || undefined,
      contributedAt,
    });

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    toast.success("Contribution added");
    setAmount("");
    setNote("");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-border pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <AppInput
          label={`Amount (${amountLabel})`}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          required
        />
        <AppInput
          label="Date"
          type="date"
          value={contributedAt}
          onChange={(event) => setContributedAt(event.target.value)}
          required
        />
      </div>
      <AppInput
        label="Note (optional)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Part-time pay"
      />
      <AppButton type="submit" loading={pending}>
        Add contribution
      </AppButton>
    </form>
  );
}

function GoalActions({ goal }: { goal: SavingGoalSummary }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleComplete() {
    setPending(true);
    const result = await markSavingGoalComplete(goal.id);
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success("Goal marked complete");
    setPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${goal.name}" and all its contributions?`)) {
      return;
    }

    setPending(true);
    const result = await deleteSavingGoal(goal.id);
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success("Goal deleted");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {!goal.is_complete ? (
        <AppButton
          type="button"
          variant="secondary"
          loading={pending}
          onClick={handleComplete}
        >
          Mark complete
        </AppButton>
      ) : null}
      <AppButton
        type="button"
        variant="danger"
        loading={pending}
        onClick={handleDelete}
      >
        Delete
      </AppButton>
    </div>
  );
}

export function SavingGoalsPanel({ goals }: { goals: SavingGoalSummary[] }) {
  const activeGoals = goals.filter((goal) => !goal.is_complete);
  const completedGoals = goals.filter((goal) => goal.is_complete);

  if (goals.length === 0) {
    return (
      <AppCard title="Your goals">
        <p className="text-sm text-muted-foreground">
          No savings goals yet. Create one above to start tracking progress.
        </p>
      </AppCard>
    );
  }

  return (
    <div className="space-y-6">
      {activeGoals.length > 0 ? (
        <AppCard title="Active goals">
          <div className="space-y-6">
            {activeGoals.map((goal) => (
              <div key={goal.id}>
                <SavingGoalProgressBar goal={goal} />
                <ContributionForm goalId={goal.id} />
                <GoalActions goal={goal} />
              </div>
            ))}
          </div>
        </AppCard>
      ) : null}

      {completedGoals.length > 0 ? (
        <AppCard title="Completed goals">
          <div className="space-y-6">
            {completedGoals.map((goal) => (
              <div key={goal.id}>
                <SavingGoalProgressBar goal={goal} />
                <GoalActions goal={goal} />
              </div>
            ))}
          </div>
        </AppCard>
      ) : null}
    </div>
  );
}
