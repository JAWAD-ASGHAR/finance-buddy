"use client";

import { deleteExpense, updateExpenseCategory } from "@/actions/expenses";
import type { Category, Expense } from "@/types/finance";
import { formatMoney } from "@/types/finance";
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {expense.expense_date}
              </TableCell>
              <TableCell>{expense.description}</TableCell>
              <TableCell className="font-medium">
                {formatMoney(expense.amount_cents)}
              </TableCell>
              <TableCell>
                <select
                  value={expense.category_id}
                  disabled={pendingId === expense.id}
                  onChange={(e) =>
                    handleCategoryChange(expense.id, e.target.value)
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell className="text-right">
                <AppButton
                  type="button"
                  variant="secondary"
                  disabled={pendingId === expense.id}
                  onClick={() => handleDelete(expense.id)}
                >
                  Delete
                </AppButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppCard>
  );
}
