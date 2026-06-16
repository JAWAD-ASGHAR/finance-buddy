"use client";

import {
  addExpense,
  addExpenseFromText,
  suggestCategoryForDescription,
} from "@/actions/expenses";
import type { Category } from "@/types/finance";
import { suggestCategory } from "@/lib/finance/categorize";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategorySuggestion } from "@/components/app/CategorySuggestion";
import {
  AppButton,
  AppCard,
  AppError,
  AppInput,
  AppSelect,
  AppTextarea,
} from "@/components/app/ui";

type Tab = "manual" | "receipt" | "quick";

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("manual");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [rawText, setRawText] = useState("");
  const [suggestion, setSuggestion] = useState<ReturnType<
    typeof suggestCategory
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function refreshSuggestion(nextDescription: string) {
    if (tab !== "manual" || nextDescription.length < 2) {
      setSuggestion(null);
      return;
    }

    const result = await suggestCategoryForDescription(nextDescription);
    if (result.success) {
      setSuggestion(result.data);
      setCategoryId((current) =>
        !current || current === categories[0]?.id
          ? result.data.categoryId
          : current,
      );
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const suggestedId = suggestion?.categoryId ?? categoryId;
    const userCorrected = suggestedId !== categoryId;

    const result = await addExpense({
      amount,
      description,
      expenseDate,
      categoryId,
      suggestedCategoryId: suggestedId,
      userCorrected,
      source: "manual",
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  async function handleTextSubmit(source: "receipt_text" | "nl_text") {
    setPending(true);
    setError(null);

    const result = await addExpenseFromText({
      rawText,
      source,
      categoryId: categoryId || undefined,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/expenses");
    router.refresh();
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "manual", label: "Manual" },
    { id: "receipt", label: "Paste receipt" },
    { id: "quick", label: "Quick text" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${
              tab === item.id
                ? "bg-dark text-white"
                : "border border-border bg-background text-muted-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "manual" ? (
        <AppCard title="Manual expense">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AppInput
                label="Amount (£)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
            </div>
            <AppInput
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={(e) => void refreshSuggestion(e.target.value)}
              placeholder="Coffee before lecture"
              required
            />
            {suggestion ? (
              <CategorySuggestion suggestion={suggestion} />
            ) : null}
            <AppSelect
              label="Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AppSelect>
            {error ? <AppError message={error} /> : null}
            <AppButton type="submit" disabled={pending}>
              {pending ? "Saving..." : "Add expense"}
            </AppButton>
          </form>
        </AppCard>
      ) : null}

      {tab === "receipt" || tab === "quick" ? (
        <AppCard
          title={tab === "receipt" ? "Paste receipt text" : "Quick text entry"}
          description={
            tab === "quick"
              ? 'Try "12 uber home Friday" or "9.99 netflix"'
              : "Paste receipt lines — we'll extract the total and merchant."
          }
        >
          <div className="space-y-4">
            <AppTextarea
              label="Text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                tab === "receipt"
                  ? "COFFEE SHOP\nTotal: £4.50"
                  : "12 uber home Friday"
              }
            />
            <AppSelect
              label="Override category (optional)"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AppSelect>
            {error ? <AppError message={error} /> : null}
            <AppButton
              type="button"
              disabled={pending || !rawText.trim()}
              onClick={() =>
                handleTextSubmit(tab === "receipt" ? "receipt_text" : "nl_text")
              }
            >
              {pending ? "Parsing..." : "Add from text"}
            </AppButton>
          </div>
        </AppCard>
      ) : null}
    </div>
  );
}
