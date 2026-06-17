import type { CategorySummary } from "@/types/finance";

export type CategoryBudgetDisplay = {
  hasLimit: boolean;
  isOverBudget: boolean;
  isAtLimit: boolean;
  progressValue: number;
  spentCents: number;
  allocatedCents: number;
  remainingCents: number;
  overByCents: number;
  /** Safe percentage for under/at-limit categories only. */
  usedPercent: number | null;
};

export function getCategoryBudgetDisplay(
  summary: CategorySummary,
): CategoryBudgetDisplay {
  const { allocatedCents, spentCents, remainingCents, percentUsed } = summary;
  const hasLimit = allocatedCents > 0;
  const isOverBudget = hasLimit && remainingCents < 0;
  const isAtLimit = hasLimit && remainingCents === 0;

  return {
    hasLimit,
    isOverBudget,
    isAtLimit,
    progressValue: hasLimit
      ? Math.min(Math.max(percentUsed, 0), 100)
      : spentCents > 0
        ? 100
        : 0,
    spentCents,
    allocatedCents,
    remainingCents: Math.max(remainingCents, 0),
    overByCents: isOverBudget ? Math.abs(remainingCents) : 0,
    usedPercent: hasLimit && !isOverBudget ? percentUsed : null,
  };
}

export function getCategoryBudgetTone(
  display: CategoryBudgetDisplay,
  thresholdPct: number,
): "default" | "warning" | "over" {
  if (display.isOverBudget || display.isAtLimit) {
    return "over";
  }

  if (
    display.usedPercent !== null &&
    display.usedPercent >= thresholdPct
  ) {
    return "warning";
  }

  return "default";
}
