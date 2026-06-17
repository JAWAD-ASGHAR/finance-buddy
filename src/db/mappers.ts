import type {
  Alert as FinanceAlert,
  Budget,
  Category,
  Expense,
  ExpenseAttachment,
  MonthlyReport,
  SavingContribution,
  SavingGoal,
} from "@/types/finance";
import type {
  AlertRow,
  BudgetRow,
  CategoryRow,
  ExpenseAttachmentRow,
  ExpenseRow,
  MonthlyReportRow,
  SavingContributionRow,
  SavingGoalRow,
} from "@/db/schema";

export function mapBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    user_id: row.userId,
    year: row.year,
    month: row.month,
    income_cents: row.incomeCents,
    alert_threshold_pct: row.alertThresholdPct,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    budget_id: row.budgetId,
    user_id: row.userId,
    name: row.name,
    allocated_cents: row.allocatedCents,
    sort_order: row.sortOrder,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapExpenseAttachment(row: ExpenseAttachmentRow): ExpenseAttachment {
  return {
    id: row.id,
    expense_id: row.expenseId,
    user_id: row.userId,
    storage_path: row.storagePath,
    file_name: row.fileName,
    content_type: row.contentType,
    size_bytes: row.sizeBytes,
    sort_order: row.sortOrder,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapExpense(
  row: ExpenseRow,
  attachments?: ExpenseAttachment[],
): Expense {
  return {
    id: row.id,
    user_id: row.userId,
    budget_id: row.budgetId,
    category_id: row.categoryId,
    suggested_category_id: row.suggestedCategoryId,
    amount_cents: row.amountCents,
    description: row.description,
    expense_date: row.expenseDate,
    source: row.source,
    user_corrected: row.userCorrected,
    created_at: row.createdAt.toISOString(),
    attachments,
  };
}

export function mapAlert(row: AlertRow): FinanceAlert {
  return {
    id: row.id,
    user_id: row.userId,
    budget_id: row.budgetId,
    category_id: row.categoryId,
    type: row.type,
    message: row.message,
    read_at: row.readAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
  };
}

export function mapMonthlyReport(row: MonthlyReportRow): MonthlyReport {
  return {
    id: row.id,
    user_id: row.userId,
    budget_id: row.budgetId,
    summary_json: row.summaryJson as MonthlyReport["summary_json"],
    generated_at: row.generatedAt.toISOString(),
  };
}

export function mapSavingGoal(row: SavingGoalRow): SavingGoal {
  return {
    id: row.id,
    user_id: row.userId,
    name: row.name,
    target_cents: row.targetCents,
    target_date: row.targetDate,
    created_at: row.createdAt.toISOString(),
    completed_at: row.completedAt?.toISOString() ?? null,
  };
}

export function mapSavingContribution(
  row: SavingContributionRow,
): SavingContribution {
  return {
    id: row.id,
    saving_goal_id: row.savingGoalId,
    user_id: row.userId,
    amount_cents: row.amountCents,
    contributed_at: row.contributedAt,
    note: row.note,
    created_at: row.createdAt.toISOString(),
  };
}
