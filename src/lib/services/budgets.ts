import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { mapBudget } from "@/db/mappers";
import { getDb } from "@/db/index";
import { budgets, categories } from "@/db/schema";
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

type CreateBudgetData = z.infer<typeof createBudgetSchema>;

async function updateExistingBudgetForUser(
  budgetId: string,
  userId: string,
  data: CreateBudgetData,
): Promise<ActionResult<{ budgetId: string }>> {
  const db = getDb();
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(budgets)
        .set({
          incomeCents: data.incomeCents,
          alertThresholdPct: data.alertThresholdPct,
          updatedAt: new Date(),
        })
        .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));

      await tx.delete(categories).where(eq(categories.budgetId, budgetId));

      await tx.insert(categories).values(
        data.categories.map((category, index) => ({
          budgetId,
          userId,
          name: category.name,
          allocatedCents: category.allocatedCents,
          sortOrder: index,
        })),
      );
    });

    return { success: true, data: { budgetId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update budget",
    };
  }
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

  const categoryInputs =
    input.categories && input.categories.length > 0
      ? input.categories
          .map((c) => ({
            name: c.name.trim(),
            allocatedCents: parseMoneyToCents(c.allocated) ?? 0,
          }))
          .filter((c) => c.name.length > 0)
      : DEFAULT_CATEGORIES.map((c) => ({
          name: c.name,
          allocatedCents: c.allocatedCents,
        }));

  const incomeCents = parseMoneyToCents(input.income);
  if (incomeCents === null) {
    return { success: false, error: "Enter a valid income amount" };
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

  const parsed = createBudgetSchema.safeParse({
    incomeCents,
    alertThresholdPct: input.alertThresholdPct ?? 80,
    categories: categoryInputs,
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
    return updateExistingBudgetForUser(existing.id, userId, parsed.data);
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
