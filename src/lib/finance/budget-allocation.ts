import { parseMoneyToCents } from "@/types/finance";

/**
 * Split income equally across categories, distributing remainder cents
 * to the first categories so the total always matches income.
 */
export function divideIncomeEqually(
  incomeCents: number,
  categoryCount: number,
): number[] {
  if (categoryCount <= 0) return [];

  const base = Math.floor(incomeCents / categoryCount);
  const remainder = incomeCents % categoryCount;

  return Array.from({ length: categoryCount }, (_, index) =>
    base + (index < remainder ? 1 : 0),
  );
}

export function centsToAmountString(cents: number): string {
  return String(cents / 100);
}

export function buildEqualCategoryAllocations(
  categoryNames: string[],
  incomeCents: number,
): Array<{ name: string; allocated: string }> {
  const allocations = divideIncomeEqually(incomeCents, categoryNames.length);

  return categoryNames.map((name, index) => ({
    name,
    allocated: centsToAmountString(allocations[index] ?? 0),
  }));
}

export function sumAllocationCents(
  categories: Array<{ allocated: string }>,
): number | null {
  let total = 0;

  for (const category of categories) {
    const cents = parseMoneyToCents(category.allocated);
    if (cents === null) return null;
    total += cents;
  }

  return total;
}

export type BudgetCoverageStatus = {
  valid: boolean;
  totalAllocatedCents: number | null;
  differenceCents: number | null;
  hasInvalidAmounts: boolean;
};

export function getBudgetCoverageStatus(
  incomeCents: number | null,
  categories: Array<{ allocated: string }>,
): BudgetCoverageStatus {
  if (incomeCents === null) {
    return {
      valid: false,
      totalAllocatedCents: null,
      differenceCents: null,
      hasInvalidAmounts: true,
    };
  }

  const totalAllocatedCents = sumAllocationCents(categories);
  if (totalAllocatedCents === null) {
    return {
      valid: false,
      totalAllocatedCents: null,
      differenceCents: null,
      hasInvalidAmounts: true,
    };
  }

  const differenceCents = incomeCents - totalAllocatedCents;

  return {
    valid: differenceCents === 0,
    totalAllocatedCents,
    differenceCents,
    hasInvalidAmounts: false,
  };
}
