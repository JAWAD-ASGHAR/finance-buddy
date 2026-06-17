import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { mapBudget } from "@/db/mappers";
import { getDb } from "@/db/index";
import { budgets, categories, expenses } from "@/db/schema";
import {
  DEFAULT_CATEGORIES,
  getCurrentBudgetPeriod,
  parseMoneyToCents,
  type ActionResult,
  type Budget,
} from "@/types/finance";

const categoryInputSchema = z.object({
  name: z.string().min(1).max(50),
  allocatedCents: z.number().int().min(0),
});

const createBudgetSchema = z.object({
  incomeCents: z.number().int().min(0),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
  categories: z.array(categoryInputSchema).min(1),
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
});

const updateCategoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(50),
  allocatedCents: z.number().int().min(0),
});

const updateBudgetSchema = z.object({
  budgetId: z.string().uuid(),
  incomeCents: z.number().int().min(0),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
  categories: z.array(updateCategoryInputSchema).min(1),
});

type CreateBudgetData = z.infer<typeof createBudgetSchema>;
type UpdateBudgetData = z.infer<typeof updateBudgetSchema>;

function validateAllocationTotal(
  incomeCents: number,
  categoryInputs: Array<{ allocatedCents: number }>,
): { success: false; error: string } | null {
  if (categoryInputs.some((category) => category.allocatedCents < 0)) {
    return { success: false, error: "Enter a valid amount for every category" };
  }

  const totalAllocatedCents = categoryInputs.reduce(
    (sum, category) => sum + category.allocatedCents,
    0,
  );

  if (totalAllocatedCents !== incomeCents) {
    return {
      success: false,
      error: "Category limits must add up to your monthly income",
    };
  }

  return null;
}

type ParsedCategoryInput = {
  id?: string;
  name: string;
  allocatedCents: number;
};

function parseCategoryInputs(
  categoriesInput?: Array<{ id?: string; name: string; allocated: string }>,
): ParsedCategoryInput[] {
  if (categoriesInput && categoriesInput.length > 0) {
    return categoriesInput
      .map((category) => ({
        id: category.id,
        name: category.name.trim(),
        allocatedCents: parseMoneyToCents(category.allocated) ?? -1,
      }))
      .filter((category) => category.name.length > 0);
  }

  return DEFAULT_CATEGORIES.map((category) => ({
    name: category.name,
    allocatedCents: category.allocatedCents,
  }));
}

export async function createMonthlyBudgetForUser(
  userId: string,
  input: {
    income: string;
    alertThresholdPct?: number;
    categories?: Array<{ name: string; allocated: string }>;
  },
): Promise<ActionResult<{ budgetId: string }>> {
  const db = getDb();
  const { year, month } = getCurrentBudgetPeriod();

  const categoryInputs = parseCategoryInputs(input.categories);

  const incomeCents = parseMoneyToCents(input.income);
  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
  }

  const allocationError = validateAllocationTotal(incomeCents, categoryInputs);
  if (allocationError) {
    return allocationError;
  }

  const parsed = createBudgetSchema.safeParse({
    incomeCents,
    alertThresholdPct: input.alertThresholdPct ?? 80,
    categories: categoryInputs.map(({ name, allocatedCents }) => ({
      name,
      allocatedCents,
    })),
    year,
    month,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const existing = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.userId, userId),
      eq(budgets.year, year),
      eq(budgets.month, month),
    ),
    columns: { id: true },
  });

  if (existing) {
    return {
      success: false,
      error: "You already have a budget for this month. Edit it instead.",
    };
  }

  try {
    const budgetId = await db.transaction(async (tx) => {
      const [budget] = await tx
        .insert(budgets)
        .values({
          userId,
          year,
          month,
          incomeCents: parsed.data.incomeCents,
          alertThresholdPct: parsed.data.alertThresholdPct,
        })
        .returning({ id: budgets.id });

      await tx.insert(categories).values(
        parsed.data.categories.map((category, index) => ({
          budgetId: budget.id,
          userId,
          name: category.name,
          allocatedCents: category.allocatedCents,
          sortOrder: index,
        })),
      );

      return budget.id;
    });

    return { success: true, data: { budgetId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create budget",
    };
  }
}

export async function updateMonthlyBudgetForUser(
  userId: string,
  input: {
    budgetId: string;
    income: string;
    alertThresholdPct?: number;
    categories: Array<{ id?: string; name: string; allocated: string }>;
  },
): Promise<ActionResult<{ budgetId: string }>> {
  const db = getDb();
  const { year, month } = getCurrentBudgetPeriod();

  const categoryInputs = parseCategoryInputs(input.categories);

  const incomeCents = parseMoneyToCents(input.income);
  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
  }

  const allocationError = validateAllocationTotal(incomeCents, categoryInputs);
  if (allocationError) {
    return allocationError;
  }

  const parsed = updateBudgetSchema.safeParse({
    budgetId: input.budgetId,
    incomeCents,
    alertThresholdPct: input.alertThresholdPct ?? 80,
    categories: categoryInputs.map(({ id, name, allocatedCents }) => ({
      id,
      name,
      allocatedCents,
    })),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const budget = await db.query.budgets.findFirst({
    where: and(
      eq(budgets.id, parsed.data.budgetId),
      eq(budgets.userId, userId),
      eq(budgets.year, year),
      eq(budgets.month, month),
    ),
    columns: { id: true },
  });

  if (!budget) {
    return { success: false, error: "Budget not found" };
  }

  const existingCategories = await db.query.categories.findMany({
    where: and(
      eq(categories.budgetId, parsed.data.budgetId),
      eq(categories.userId, userId),
    ),
    columns: { id: true, name: true },
  });

  const existingCategoryIds = new Set(existingCategories.map((c) => c.id));
  const incomingCategoryIds = new Set(
    parsed.data.categories
      .map((category) => category.id)
      .filter((id): id is string => Boolean(id)),
  );

  for (const categoryId of incomingCategoryIds) {
    if (!existingCategoryIds.has(categoryId)) {
      return { success: false, error: "One or more categories could not be found" };
    }
  }

  const categoriesToRemove = existingCategories.filter(
    (category) => !incomingCategoryIds.has(category.id),
  );

  if (categoriesToRemove.length > 0) {
    const usedCategoryRows = await db
      .select({
        categoryId: expenses.categoryId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.budgetId, parsed.data.budgetId),
          inArray(
            expenses.categoryId,
            categoriesToRemove.map((category) => category.id),
          ),
        ),
      )
      .groupBy(expenses.categoryId);

    if (usedCategoryRows.length > 0) {
      const blockedNames = categoriesToRemove
        .filter((category) =>
          usedCategoryRows.some((row) => row.categoryId === category.id),
        )
        .map((category) => category.name);

      return {
        success: false,
        error: `Cannot remove ${blockedNames.join(", ")} — expenses are linked to ${blockedNames.length === 1 ? "this category" : "these categories"}.`,
      };
    }
  }

  const duplicateNames = parsed.data.categories.filter(
    (category, index) =>
      parsed.data.categories.findIndex(
        (other) => other.name.toLowerCase() === category.name.toLowerCase(),
      ) !== index,
  );

  if (duplicateNames.length > 0) {
    return { success: false, error: "Each category needs a unique name" };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(budgets)
        .set({
          incomeCents: parsed.data.incomeCents,
          alertThresholdPct: parsed.data.alertThresholdPct,
          updatedAt: new Date(),
        })
        .where(
          and(eq(budgets.id, parsed.data.budgetId), eq(budgets.userId, userId)),
        );

      for (const [index, category] of parsed.data.categories.entries()) {
        if (category.id) {
          await tx
            .update(categories)
            .set({
              name: category.name,
              allocatedCents: category.allocatedCents,
              sortOrder: index,
            })
            .where(
              and(
                eq(categories.id, category.id),
                eq(categories.budgetId, parsed.data.budgetId),
                eq(categories.userId, userId),
              ),
            );
        } else {
          await tx.insert(categories).values({
            budgetId: parsed.data.budgetId,
            userId,
            name: category.name,
            allocatedCents: category.allocatedCents,
            sortOrder: index,
          });
        }
      }

      if (categoriesToRemove.length > 0) {
        await tx.delete(categories).where(
          inArray(
            categories.id,
            categoriesToRemove.map((category) => category.id),
          ),
        );
      }
    });

    return { success: true, data: { budgetId: parsed.data.budgetId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update budget",
    };
  }
}

export async function updateBudgetIncomeForUser(
  userId: string,
  input: { budgetId: string; income: string },
): Promise<ActionResult<Budget>> {
  const db = getDb();
  const incomeCents = parseMoneyToCents(input.income);

  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
  }

  const [row] = await db
    .update(budgets)
    .set({ incomeCents, updatedAt: new Date() })
    .where(and(eq(budgets.id, input.budgetId), eq(budgets.userId, userId)))
    .returning();

  if (!row) {
    return { success: false, error: "Failed to update budget" };
  }

  return { success: true, data: mapBudget(row) };
}

export async function updateBudgetAlertThresholdForUser(
  userId: string,
  input: { budgetId: string; alertThresholdPct: number },
): Promise<ActionResult<Budget>> {
  if (input.alertThresholdPct < 1 || input.alertThresholdPct > 100) {
    return {
      success: false,
      error: "Alert threshold must be between 1 and 100",
    };
  }

  const db = getDb();
  const [row] = await db
    .update(budgets)
    .set({
      alertThresholdPct: input.alertThresholdPct,
      updatedAt: new Date(),
    })
    .where(and(eq(budgets.id, input.budgetId), eq(budgets.userId, userId)))
    .returning();

  if (!row) {
    return { success: false, error: "Budget not found" };
  }

  return { success: true, data: mapBudget(row) };
}
