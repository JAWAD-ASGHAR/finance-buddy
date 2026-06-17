"use client";

import { deleteExpense, updateExpenseCategory } from "@/actions/expenses";
import { ExpenseAttachmentGallery } from "@/components/app/ExpenseAttachmentGallery";
import { useCurrency } from "@/components/app/CurrencyProvider";
import type { Category, Expense } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppButton, AppCard } from "@/components/app/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const stickyActionsClass =
  "sticky right-0 z-10 bg-card group-hover:bg-muted/50 shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.12)]";

function ExpenseCategorySelect({
  expense,
  categories,
  disabled,
  onChange,
}: {
  expense: Expense;
  categories: Category[];
  disabled: boolean;
  onChange: (categoryId: string) => void;
}) {
  return (
    <select
      value={expense.category_id}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

export function ExpenseList({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const router = useRouter();
  const { formatMoney } = useCurrency();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleCategoryChange(expenseId: string, categoryId: string) {
    setPendingId(expenseId);
    await updateExpenseCategory({ expenseId, categoryId });
    router.refresh();
    setPendingId(null);
  }

  async function handleDelete(expenseId: string) {
    setPendingId(expenseId);
    await deleteExpense(expenseId);
    router.refresh();
    setPendingId(null);
  }

  if (expenses.length === 0) {
    return (
      <AppCard title="No expenses yet">
        <p className="text-sm text-muted-foreground">
          Add your first expense to start tracking spending.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard title="All expenses">
      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium break-words">{expense.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {expense.expense_date}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold">
                {formatMoney(expense.amount_cents)}
              </p>
            </div>

            <ExpenseAttachmentGallery attachments={expense.attachments} />

            <ExpenseCategorySelect
              expense={expense}
              categories={categories}
              disabled={pendingId === expense.id}
              onChange={(categoryId) =>
                handleCategoryChange(expense.id, categoryId)
              }
            />

            <AppButton
              type="button"
              variant="secondary"
              loading={pendingId === expense.id}
              onClick={() => handleDelete(expense.id)}
              className="w-full"
            >
              Delete
            </AppButton>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table className="min-w-[48rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[7rem]">Date</TableHead>
                <TableHead className="min-w-[14rem]">Description</TableHead>
                <TableHead className="min-w-[6rem]">Amount</TableHead>
                <TableHead className="min-w-[10rem]">Category</TableHead>
                <TableHead className="min-w-[12rem]">Images</TableHead>
                <TableHead
                  className={cn(
                    "min-w-[6.5rem] bg-card text-right",
                    stickyActionsClass,
                  )}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="group">
                  <TableCell className="whitespace-nowrap">
                    {expense.expense_date}
                  </TableCell>
                  <TableCell className="max-w-[24rem] min-w-[14rem] break-words whitespace-normal">
                    {expense.description}
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatMoney(expense.amount_cents)}
                  </TableCell>
                  <TableCell className="min-w-[10rem]">
                    <ExpenseCategorySelect
                      expense={expense}
                      categories={categories}
                      disabled={pendingId === expense.id}
                      onChange={(categoryId) =>
                        handleCategoryChange(expense.id, categoryId)
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-[12rem] whitespace-normal">
                    <ExpenseAttachmentGallery attachments={expense.attachments} />
                  </TableCell>
                  <TableCell
                    className={cn("text-right whitespace-nowrap", stickyActionsClass)}
                  >
                    <AppButton
                      type="button"
                      variant="secondary"
                      loading={pendingId === expense.id}
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </AppButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </AppCard>
  );
}
