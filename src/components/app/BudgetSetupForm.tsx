"use client";

import { createMonthlyBudget, updateMonthlyBudget } from "@/actions/budgets";
import { BudgetStepper } from "@/components/app/BudgetStepper";
import { useCurrency } from "@/components/app/CurrencyProvider";
import {
  AppButton,
  AppCard,
  AppInput,
} from "@/components/app/ui";
import {
  buildEqualCategoryAllocations,
  getBudgetCoverageStatus,
} from "@/lib/finance/budget-allocation";
import { DEFAULT_CATEGORIES, parseMoneyToCents } from "@/types/finance";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CategoryRow = {
  id?: string;
  name: string;
  allocated: string;
  spentCents?: number;
};

const STEPS = [
  { id: 1, label: "Income" },
  { id: 2, label: "Categories" },
  { id: 3, label: "Review" },
] as const;

const SUGGESTED_CATEGORY_NAMES = DEFAULT_CATEGORIES.map((c) => c.name);

function buildInitialCategories(initialCategories?: CategoryRow[]): CategoryRow[] {
  if (initialCategories && initialCategories.length > 0) {
    return initialCategories;
  }

  return DEFAULT_CATEGORIES.map((c) => ({
    name: c.name,
    allocated: String(c.allocatedCents / 100),
  }));
}

export function BudgetSetupForm({
  mode = "create",
  budgetId,
  initialIncome,
  initialThreshold,
  initialCategories,
}: {
  mode?: "create" | "edit";
  budgetId?: string;
  initialIncome?: string;
  initialThreshold?: number;
  initialCategories?: CategoryRow[];
}) {
  const router = useRouter();
  const { symbol, formatMoney } = useCurrency();
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState(initialIncome ?? "800");
  const [threshold, setThreshold] = useState(String(initialThreshold ?? 80));
  const [categories, setCategories] = useState<CategoryRow[]>(() =>
    buildInitialCategories(initialCategories),
  );
  const [pending, setPending] = useState(false);

  const incomeCents = parseMoneyToCents(income);

  const coverage = useMemo(
    () => getBudgetCoverageStatus(incomeCents, categories),
    [categories, incomeCents],
  );

  const availableSuggestions = SUGGESTED_CATEGORY_NAMES.filter(
    (name) =>
      !categories.some(
        (existing) => existing.name.toLowerCase() === name.toLowerCase(),
      ),
  );

  function updateCategoryName(index: number, value: string) {
    setCategories((rows) =>
      rows.map((row, i) => (i === index ? { ...row, name: value } : row)),
    );
  }

  function updateCategoryAllocated(index: number, value: string) {
    setCategories((rows) =>
      rows.map((row, i) => (i === index ? { ...row, allocated: value } : row)),
    );
  }

  function addCategory(name = "") {
    setCategories((rows) => [...rows, { name, allocated: "0" }]);
  }

  function canRemoveCategory(category: CategoryRow) {
    return categories.length > 1 && !(category.spentCents && category.spentCents > 0);
  }

  function removeCategory(index: number) {
    const category = categories[index];
    if (!category || !canRemoveCategory(category)) return;
    setCategories((rows) => rows.filter((_, i) => i !== index));
  }

  function applyEqualSplit(nextCategories: CategoryRow[]) {
    if (incomeCents === null) return nextCategories;

    const names = nextCategories.map((category) => category.name.trim());
    const equalRows = buildEqualCategoryAllocations(names, incomeCents);

    return nextCategories.map((category, index) => ({
      ...category,
      name: equalRows[index]?.name ?? category.name,
      allocated: equalRows[index]?.allocated ?? category.allocated,
    }));
  }

  function rebalanceEqually() {
    if (incomeCents === null) {
      toast.error("Enter a valid income amount");
      return;
    }

    setCategories((rows) => applyEqualSplit(rows));
  }

  function validateIncomeStep(): boolean {
    if (incomeCents === null) {
      toast.error("Enter a valid income amount");
      return false;
    }
    return true;
  }

  function normalizeCategories(): CategoryRow[] | null {
    const trimmed = categories.map((category) => ({
      ...category,
      name: category.name.trim(),
    }));
    const nonEmpty = trimmed.filter((category) => category.name.length > 0);

    if (nonEmpty.length === 0) {
      toast.error("Add at least one category");
      return null;
    }

    const duplicates = nonEmpty.filter(
      (category, index) =>
        nonEmpty.findIndex(
          (other) =>
            other.name.toLowerCase() === category.name.toLowerCase(),
        ) !== index,
    );

    if (duplicates.length > 0) {
      toast.error("Each category needs a unique name");
      return null;
    }

    return nonEmpty;
  }

  function validateCategoriesStep(): CategoryRow[] | null {
    return normalizeCategories();
  }

  function validateAllocationStep(showToast = true): boolean {
    if (!validateIncomeStep()) return false;

    const normalized = normalizeCategories();
    if (!normalized) return false;

    const status = getBudgetCoverageStatus(incomeCents, normalized);

    if (status.hasInvalidAmounts) {
      if (showToast) {
        toast.error("Enter a valid amount for every category");
      }
      return false;
    }

    if (!status.valid) {
      if (showToast) {
        if (status.differenceCents !== null && status.differenceCents > 0) {
          toast.error(
            `Allocate ${formatMoney(status.differenceCents)} more to cover your income`,
          );
        } else if (
          status.differenceCents !== null &&
          status.differenceCents < 0
        ) {
          toast.error(
            `Reduce category limits by ${formatMoney(Math.abs(status.differenceCents))}`,
          );
        }
      }
      return false;
    }

    return true;
  }

  function goToNextStep() {
    if (step === 1 && !validateIncomeStep()) return;

    if (step === 2) {
      const normalized = validateCategoriesStep();
      if (!normalized || incomeCents === null) return;

      if (!isEdit) {
        setCategories(applyEqualSplit(normalized));
      } else {
        setCategories(normalized);
      }

      setStep(3);
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goToPreviousStep() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSave() {
    if (!validateAllocationStep()) return;

    const normalized = normalizeCategories();
    if (!normalized) return;

    if (isEdit && !budgetId) {
      toast.error("Budget not found");
      return;
    }

    setPending(true);

    const payload = {
      income,
      alertThresholdPct: Number.parseInt(threshold, 10) || 80,
      categories: normalized.map(({ id, name, allocated }) => ({
        id,
        name,
        allocated,
      })),
    };

    const result = isEdit
      ? await updateMonthlyBudget({ budgetId: budgetId!, ...payload })
      : await createMonthlyBudget(payload);

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const canSave = step === STEPS.length && coverage.valid && !pending;

  return (
    <div className="space-y-6">
      <BudgetStepper steps={[...STEPS]} currentStep={step} />

      {step === 1 ? (
        <AppCard
          title="Monthly income"
          description={
            isEdit
              ? "Update your allowance for this month and when you want spending alerts."
              : "Set how much you have to spend this month and when you want spending alerts."
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AppInput
              label={`Allowance / income (${symbol})`}
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
      ) : null}

      {step === 2 ? (
        <AppCard
          title="Your categories"
          description={
            isEdit
              ? "Rename categories, add new ones, or remove unused ones. Categories with expenses cannot be removed."
              : "Choose the spending groups for your budget. These apply only to your account."
          }
        >
          <div className="space-y-4">
            {availableSuggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Quick add
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addCategory(name)}
                      className="rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-accent-green hover:bg-accent-green-light/50 hover:text-accent-green"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              {categories.map((category, index) => {
                const removable = canRemoveCategory(category);

                return (
                  <div key={category.id ?? index} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <AppInput
                        label={`Category ${index + 1}`}
                        value={category.name}
                        onChange={(e) =>
                          updateCategoryName(index, e.target.value)
                        }
                        placeholder="e.g. Food"
                      />
                      {category.spentCents && category.spentCents > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatMoney(category.spentCents)} spent this month
                        </p>
                      ) : null}
                    </div>
                    <AppButton
                      type="button"
                      variant="secondary"
                      className="mb-0.5 shrink-0 px-3"
                      onClick={() => removeCategory(index)}
                      disabled={!removable}
                      aria-label={`Remove ${category.name || `category ${index + 1}`}`}
                      title={
                        !removable && category.spentCents
                          ? "Remove expenses from this category first"
                          : undefined
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </AppButton>
                  </div>
                );
              })}
            </div>

            <AppButton
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => addCategory()}
            >
              <Plus className="size-4" aria-hidden />
              Add category
            </AppButton>
          </div>
        </AppCard>
      ) : null}

      {step === 3 ? (
        <AppCard
          title={isEdit ? "Adjust your budget" : "Split your budget"}
          description={
            isEdit
              ? "Update category limits while keeping your existing spending history intact."
              : "We start with an equal split — adjust any category until your full income is allocated."
          }
        >
          <div className="space-y-4">
            <div className="grid gap-4 rounded-lg border border-border/80 bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Monthly income
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {incomeCents !== null ? formatMoney(incomeCents) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Alert threshold
                </p>
                <p className="mt-1 text-lg font-semibold">{threshold}%</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Edit limits below or reset to an equal split."
                  : "Edit limits below or reset to an equal split."}
              </p>
              <AppButton
                type="button"
                variant="secondary"
                onClick={rebalanceEqually}
              >
                Split equally
              </AppButton>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div
                  key={category.id ?? `${category.name}-${index}`}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <div>
                    <AppInput
                      label="Category"
                      value={category.name}
                      readOnly
                      tabIndex={-1}
                      className="bg-muted/40"
                    />
                    {category.spentCents && category.spentCents > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatMoney(category.spentCents)} spent
                      </p>
                    ) : null}
                  </div>
                  <AppInput
                    label={`Limit (${symbol})`}
                    value={category.allocated}
                    inputMode="decimal"
                    onChange={(e) =>
                      updateCategoryAllocated(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                coverage.valid
                  ? "border-accent-green/25 bg-accent-green-light/40 text-foreground"
                  : coverage.hasInvalidAmounts
                    ? "border-border bg-muted text-foreground"
                    : coverage.differenceCents !== null &&
                        coverage.differenceCents < 0
                      ? "border-destructive/25 bg-destructive/10 text-destructive"
                      : "border-border bg-muted text-foreground",
              )}
            >
              {coverage.hasInvalidAmounts ? (
                <p>Enter a valid amount for every category.</p>
              ) : coverage.valid ? (
                <p>
                  Budget fully allocated ·{" "}
                  {formatMoney(coverage.totalAllocatedCents ?? 0)} of{" "}
                  {formatMoney(incomeCents ?? 0)}
                </p>
              ) : coverage.differenceCents !== null &&
                coverage.differenceCents > 0 ? (
                <p>
                  {formatMoney(coverage.differenceCents)} left to allocate ·{" "}
                  {formatMoney(coverage.totalAllocatedCents ?? 0)} of{" "}
                  {formatMoney(incomeCents ?? 0)} assigned
                </p>
              ) : (
                <p>
                  {formatMoney(Math.abs(coverage.differenceCents ?? 0))} over
                  your income ·{" "}
                  {formatMoney(coverage.totalAllocatedCents ?? 0)} assigned
                </p>
              )}
            </div>
          </div>
        </AppCard>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <AppButton type="button" variant="secondary" onClick={goToPreviousStep}>
            Back
          </AppButton>
        ) : isEdit ? (
          <AppButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Cancel
          </AppButton>
        ) : (
          <span />
        )}

        {step < STEPS.length ? (
          <AppButton type="button" onClick={goToNextStep}>
            Continue
          </AppButton>
        ) : (
          <AppButton
            type="button"
            loading={pending}
            disabled={!canSave}
            onClick={() => void handleSave()}
          >
            {isEdit ? "Save budget changes" : "Save monthly budget"}
          </AppButton>
        )}
      </div>
    </div>
  );
}
