import { format, parseISO, startOfMonth } from "date-fns";
import { getCurrentBudgetPeriod } from "@/types/finance";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function getDefaultReportDateRange(date = new Date()) {
  const { year, month } = getCurrentBudgetPeriod(date);
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = format(date, "yyyy-MM-dd");
  return { startDate, endDate };
}

export function validateReportDateRange(
  startDate: string,
  endDate: string,
): { ok: true } | { ok: false; error: string } {
  if (!ISO_DATE.test(startDate) || !ISO_DATE.test(endDate)) {
    return { ok: false, error: "Use valid dates (YYYY-MM-DD)" };
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { ok: false, error: "Use valid dates (YYYY-MM-DD)" };
  }

  if (startDate > endDate) {
    return { ok: false, error: "Start date must be on or before end date" };
  }

  return { ok: true };
}

export function formatReportPeriodLabel(startDate: string, endDate: string) {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (startDate === endDate) {
    return format(start, "MMM d, yyyy");
  }

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")} – ${format(end, "MMM d, yyyy")}`;
}

export function filterExpensesByDateRange<
  T extends { expense_date: string },
>(expenses: T[], startDate: string, endDate: string): T[] {
  return expenses.filter(
    (expense) =>
      expense.expense_date >= startDate && expense.expense_date <= endDate,
  );
}

export function getMonthStartForDate(endDate: string) {
  return format(startOfMonth(parseISO(endDate)), "yyyy-MM-dd");
}
