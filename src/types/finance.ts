export type ExpenseSource = "manual" | "receipt_text" | "nl_text";

export type AlertType = "category_threshold" | "monthly_pace";

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  income_cents: number;
  alert_threshold_pct: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  budget_id: string;
  user_id: string;
  name: string;
  allocated_cents: number;
  sort_order: number;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  budget_id: string;
  category_id: string;
  suggested_category_id: string | null;
  amount_cents: number;
  description: string;
  expense_date: string;
  source: ExpenseSource;
  user_corrected: boolean;
  created_at: string;
};

export type Alert = {
  id: string;
  user_id: string;
  budget_id: string;
  category_id: string | null;
  type: AlertType;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type MonthlyReport = {
  id: string;
  user_id: string;
  budget_id: string;
  summary_json: MonthlyReportSummary;
  generated_at: string;
};

export type CategorySummary = {
  categoryId: string;
  name: string;
  allocatedCents: number;
  spentCents: number;
  remainingCents: number;
  percentUsed: number;
};

export type ForecastResult = {
  projectedEndBalanceCents: number;
  dailyBurnRateCents: number;
  daysRemaining: number;
  daysElapsed: number;
  daysInMonth: number;
  spentToDateCents: number;
  projectedTotalSpendCents: number;
  onTrack: boolean;
};

export type CategorySuggestion = {
  categoryId: string;
  categoryName: string;
  confidence: "high" | "medium" | "low";
  reason: string;
};

export type ParsedExpenseText = {
  amountCents: number | null;
  description: string;
  expenseDate: string | null;
};

export type DetectedAlert = {
  type: AlertType;
  categoryId: string | null;
  message: string;
};

export type MonthlyReportSummary = {
  periodLabel: string;
  incomeCents: number;
  totalSpentCents: number;
  remainingCents: number;
  categoryBreakdown: Array<{
    name: string;
    spentCents: number;
    allocatedCents: number;
    percentUsed: number;
  }>;
  forecast: ForecastResult;
  insights: string[];
  disclaimer: string;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export const DEFAULT_CATEGORIES = [
  { name: "Food", allocatedCents: 20000 },
  { name: "Transport", allocatedCents: 8000 },
  { name: "Subscriptions", allocatedCents: 4000 },
  { name: "Shopping", allocatedCents: 10000 },
  { name: "Other", allocatedCents: 5000 },
] as const;

export function formatMoney(cents: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function parseMoneyToCents(value: string): number | null {
  const cleaned = value.replace(/[£,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export function getCurrentBudgetPeriod(date = new Date()) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}
