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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ExpenseForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("manual");
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

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="manual">Manual</TabsTrigger>
        <TabsTrigger value="receipt">Paste receipt</TabsTrigger>
        <TabsTrigger value="quick">Quick text</TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
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
            {suggestion ? <CategorySuggestion suggestion={suggestion} /> : null}
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
      </TabsContent>

      <TabsContent value="receipt">
        <AppCard
          title="Paste receipt text"
          description="Paste receipt lines — we'll extract the total and merchant."
        >
          <TextEntryForm
            rawText={rawText}
            setRawText={setRawText}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            error={error}
            pending={pending}
            placeholder={"COFFEE SHOP\nTotal: £4.50"}
            onSubmit={() => handleTextSubmit("receipt_text")}
          />
        </AppCard>
      </TabsContent>

      <TabsContent value="quick">
        <AppCard
          title="Quick text entry"
          description={'Try "12 uber home Friday" or "9.99 netflix"'}
        >
          <TextEntryForm
            rawText={rawText}
            setRawText={setRawText}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
            error={error}
            pending={pending}
            placeholder="12 uber home Friday"
            onSubmit={() => handleTextSubmit("nl_text")}
          />
        </AppCard>
      </TabsContent>
    </Tabs>
  );
}

function TextEntryForm({
  rawText,
  setRawText,
  categoryId,
  setCategoryId,
  categories,
  error,
  pending,
  placeholder,
  onSubmit,
}: {
  rawText: string;
  setRawText: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  categories: Category[];
  error: string | null;
  pending: boolean;
  placeholder: string;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <AppTextarea
        label="Text"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder={placeholder}
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
        onClick={onSubmit}
      >
        {pending ? "Parsing..." : "Add from text"}
      </AppButton>
    </div>
  );
}
