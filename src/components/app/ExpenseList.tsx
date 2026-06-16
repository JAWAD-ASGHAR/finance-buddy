"use client";

import { deleteExpense, updateExpenseCategory } from "@/actions/expenses";
import type { Category, Expense } from "@/types/finance";
import { formatMoney } from "@/types/finance";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppButton, AppCard } from "@/components/app/ui";

export function ExpenseList({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const router = useRouter();
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Description</th>
              <th className="px-2 py-3">Amount</th>
              <th className="px-2 py-3">Category</th>
              <th className="px-2 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-border/70">
                <td className="px-2 py-3 whitespace-nowrap">
                  {expense.expense_date}
                </td>
                <td className="px-2 py-3">{expense.description}</td>
                <td className="px-2 py-3 whitespace-nowrap font-medium">
                  {formatMoney(expense.amount_cents)}
                </td>
                <td className="px-2 py-3">
                  <select
                    value={expense.category_id}
                    disabled={pendingId === expense.id}
                    onChange={(e) =>
                      handleCategoryChange(expense.id, e.target.value)
                    }
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-3">
                  <AppButton
                    type="button"
                    variant="secondary"
                    disabled={pendingId === expense.id}
                    onClick={() => handleDelete(expense.id)}
                  >
                    Delete
                  </AppButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
}
