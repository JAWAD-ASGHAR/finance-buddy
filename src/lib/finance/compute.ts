import type { Category, CategorySummary, Expense } from "@/types/finance";

export function computeCategorySummaries(
  categories: Category[],
  expenses: Expense[],
): CategorySummary[] {
  return categories
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => {
      const spentCents = expenses
        .filter((expense) => expense.category_id === category.id)
        .reduce((sum, expense) => sum + expense.amount_cents, 0);

      const allocatedCents = category.allocated_cents;
      const remainingCents = allocatedCents - spentCents;
      const percentUsed =
        allocatedCents > 0
          ? Math.round((spentCents / allocatedCents) * 100)
          : spentCents > 0
            ? 100
            : 0;

      return {
        categoryId: category.id,
        name: category.name,
        allocatedCents,
        spentCents,
        remainingCents,
        percentUsed,
      };
    });
}

export function computeTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount_cents, 0);
}

export function computeMonthlyRemaining(
  incomeCents: number,
  expenses: Expense[],
): number {
  return incomeCents - computeTotalSpent(expenses);
}
