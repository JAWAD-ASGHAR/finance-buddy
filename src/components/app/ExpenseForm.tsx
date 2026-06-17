"use client";

import { addExpense, addExpenseFromText } from "@/actions/expenses";
import { registerExpenseAttachment } from "@/actions/images";
import { ImageFilePicker } from "@/components/app/ImageFilePicker";
import type { Category } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/components/app/CurrencyProvider";
import {
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
  AppTextarea,
} from "@/components/app/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadExpenseImages } from "@/lib/storage/client-upload";

export function ExpenseForm({
  categories,
  userId,
}: {
  categories: Category[];
  userId: string;
}) {
  const router = useRouter();
  const { amountLabel } = useCurrency();
  const [tab, setTab] = useState("manual");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [rawText, setRawText] = useState("");
  const [pending, setPending] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  async function attachImages(expenseId: string) {
    if (imageFiles.length === 0) {
      return true;
    }

    const uploads = await uploadExpenseImages(userId, expenseId, imageFiles);

    for (const upload of uploads) {
      const result = await registerExpenseAttachment({
        expenseId,
        storagePath: upload.storagePath,
        fileName: upload.fileName,
        contentType: upload.contentType,
        sizeBytes: upload.sizeBytes,
        sortOrder: upload.sortOrder,
      });

      if (!result.success) {
        throw new Error(result.error);
      }
    }

    return true;
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    try {
      const result = await addExpense({
        amount,
        description,
        expenseDate,
        categoryId,
        source: "manual",
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      try {
        await attachImages(result.data.id);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Expense saved but images failed to upload",
        );
        return;
      }

      await router.push("/expenses");
    } finally {
      setPending(false);
    }
  }

  async function handleTextSubmit(source: "receipt_text" | "nl_text") {
    setPending(true);

    try {
      const result = await addExpenseFromText({
        rawText,
        source,
        categoryId: categoryId || undefined,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await router.push("/expenses");
    } finally {
      setPending(false);
    }
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
                label={amountLabel}
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
              placeholder="Coffee before lecture"
              required
            />
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
            <ImageFilePicker
              files={imageFiles}
              onChange={setImageFiles}
              disabled={pending}
            />
            <AppButton type="submit" loading={pending}>
              Add expense
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
  pending,
  placeholder,
  onSubmit,
}: {
  rawText: string;
  setRawText: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  categories: Category[];
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
      <AppButton
        type="button"
        loading={pending}
        disabled={!rawText.trim()}
        onClick={onSubmit}
      >
        Add from text
      </AppButton>
    </div>
  );
}
