"use client";

import { createMonthlyBudget } from "@/actions/budgets";
import { DEFAULT_CATEGORIES } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AppButton,
  AppCard,
  AppError,
  AppInput,
} from "@/components/app/ui";

type CategoryRow = { name: string; allocated: string };

export function BudgetSetupForm({
  initialIncome,
  initialThreshold,
  initialCategories,
}: {
  initialIncome?: string;
  initialThreshold?: number;
  initialCategories?: CategoryRow[];
}) {
  const router = useRouter();
  const [income, setIncome] = useState(initialIncome ?? "800");
  const [threshold, setThreshold] = useState(String(initialThreshold ?? 80));
  const [categories, setCategories] = useState<CategoryRow[]>(
    initialCategories ??
      DEFAULT_CATEGORIES.map((c) => ({
        name: c.name,
        allocated: String(c.allocatedCents / 100),
      })),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function updateCategory(index: number, field: keyof CategoryRow, value: string) {
    setCategories((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await createMonthlyBudget({
      income,
      alertThresholdPct: Number.parseInt(threshold, 10) || 80,
      categories,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AppCard title="Monthly income">
        <div className="grid gap-4 sm:grid-cols-2">
          <AppInput
            label="Allowance / income (£)"
            name="income"
            type="text"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
          />
          <AppInput
            label="Alert threshold (%)"
            name="threshold"
            type="number"
            min={1}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
      </AppCard>

      <AppCard title="Category budgets">
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="grid gap-3 sm:grid-cols-2"
            >
              <AppInput
                label={`Category ${index + 1}`}
                value={category.name}
                onChange={(e) => updateCategory(index, "name", e.target.value)}
              />
              <AppInput
                label="Limit (£)"
                value={category.allocated}
                inputMode="decimal"
                onChange={(e) =>
                  updateCategory(index, "allocated", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </AppCard>

      {error ? <AppError message={error} /> : null}

      <AppButton type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save monthly budget"}
      </AppButton>
    </form>
  );
}
