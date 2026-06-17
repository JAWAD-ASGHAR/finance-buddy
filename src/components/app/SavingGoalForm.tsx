"use client";

import { createSavingGoal } from "@/actions/saving-goals";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/components/app/CurrencyProvider";
import { AppButton, AppCard, AppInput } from "@/components/app/ui";

export function SavingGoalForm() {
  const router = useRouter();
  const { amountLabel } = useCurrency();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);

    const result = await createSavingGoal({
      name,
      target,
      targetDate: targetDate || undefined,
    });

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    toast.success("Savings goal created");
    setName("");
    setTarget("");
    setTargetDate("");
    setPending(false);
    router.refresh();
  }

  return (
    <AppCard
      title="New savings goal"
      description="Set a target amount and optional deadline for something you're saving toward."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AppInput
          label="Goal name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Emergency fund"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput
            label={`Target (${amountLabel})`}
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            inputMode="decimal"
            placeholder="500"
            required
          />
          <AppInput
            label="Target date (optional)"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
        </div>
        <AppButton type="submit" loading={pending}>
          Create goal
        </AppButton>
      </form>
    </AppCard>
  );
}
