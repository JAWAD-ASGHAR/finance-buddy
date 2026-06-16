import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { mapSharedExpenseDetail } from "@/db/shared-mappers";
import { getDb } from "@/db/index";
import {
  expenses,
  sharedExpenseSplits,
  sharedExpenses,
} from "@/db/schema";
import {
  areFriends,
  getSharedExpenseDetailForUser,
  getSharedExpensesForUser,
} from "@/lib/db/shared-queries";
import { getCurrentBudgetForUser } from "@/lib/db/queries";
import { refreshAlertsForBudget } from "@/lib/services/alerts";
import {
  computeEqualSplits,
  validateSplits,
} from "@/lib/finance/shared-splits";
import type { ActionResult } from "@/types/finance";
import { parseMoneyToCents } from "@/types/finance";
import type { SharedExpenseDetail, SplitMode } from "@/types/shared";

const createSharedExpenseSchema = z.object({
  description: z.string().min(1).max(200),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  friendIds: z.array(z.string().uuid()).min(1),
  splitMode: z.enum(["equal", "single_payer"]),
  payerId: z.string().uuid(),
  addToBudget: z.boolean().default(false),
  categoryId: z.string().uuid().optional(),
});

export async function createSharedExpenseForUser(
  userId: string,
  input: {
    amount: string;
    description: string;
    expenseDate: string;
    friendIds: string[];
    splitMode: SplitMode;
    payerId: string;
    addToBudget?: boolean;
    categoryId?: string;
  },
): Promise<ActionResult<SharedExpenseDetail>> {
  const totalCents = parseMoneyToCents(input.amount);

  if (totalCents === null || totalCents <= 0) {
    return { success: false, error: "Enter a valid amount" };
  }

  const parsed = createSharedExpenseSchema.safeParse({
    description: input.description.trim(),
    expenseDate: input.expenseDate,
    friendIds: input.friendIds,
    splitMode: input.splitMode,
    payerId: input.payerId,
    addToBudget: input.addToBudget ?? false,
    categoryId: input.categoryId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const participantIds = [userId, ...parsed.data.friendIds];
  const uniqueParticipants = [...new Set(participantIds)];

  if (uniqueParticipants.length < 2) {
    return { success: false, error: "Select at least one friend" };
  }

  for (const friendId of parsed.data.friendIds) {
    if (!(await areFriends(userId, friendId))) {
      return { success: false, error: "You can only split with accepted friends" };
    }
  }

  if (!uniqueParticipants.includes(parsed.data.payerId)) {
    return { success: false, error: "Payer must be a participant" };
  }

  if (parsed.data.addToBudget) {
    if (!parsed.data.categoryId) {
      return { success: false, error: "Choose a category to add to your budget" };
    }

    const { budget } = await getCurrentBudgetForUser(userId);
    if (!budget) {
      return { success: false, error: "Create a monthly budget first" };
    }
  }

  let splits;
  try {
    splits = computeEqualSplits({
      totalCents,
      participantIds: uniqueParticipants,
      payerId: parsed.data.payerId,
    });
    validateSplits(totalCents, splits);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid split",
    };
  }

  const db = getDb();

  try {
    const result = await db.transaction(async (tx) => {
      const [expenseRow] = await tx
        .insert(sharedExpenses)
        .values({
          description: parsed.data.description,
          totalCents,
          expenseDate: parsed.data.expenseDate,
          createdByUserId: userId,
        })
        .returning();

      if (!expenseRow) {
        throw new Error("Failed to create shared expense");
      }

      const userSplit = splits.find((s) => s.userId === userId);
      let linkedPersonalExpenseId: string | null = null;

      if (parsed.data.addToBudget && userSplit && parsed.data.categoryId) {
        const { budget } = await getCurrentBudgetForUser(userId);
        if (!budget) {
          throw new Error("Create a monthly budget first");
        }

        const [personalRow] = await tx
          .insert(expenses)
          .values({
            userId,
            budgetId: budget.id,
            categoryId: parsed.data.categoryId,
            suggestedCategoryId: parsed.data.categoryId,
            amountCents: userSplit.shareCents,
            description: `Shared: ${parsed.data.description}`,
            expenseDate: parsed.data.expenseDate,
            source: "manual",
          })
          .returning();

        linkedPersonalExpenseId = personalRow?.id ?? null;
      }

      const splitRows = await tx
        .insert(sharedExpenseSplits)
        .values(
          splits.map((split) => ({
            sharedExpenseId: expenseRow.id,
            userId: split.userId,
            shareCents: split.shareCents,
            paidCents: split.paidCents,
            personalExpenseId:
              split.userId === userId ? linkedPersonalExpenseId : null,
          })),
        )
        .returning();

      return { expenseRow, splitRows, linkedPersonalExpenseId };
    });

    if (result.linkedPersonalExpenseId) {
      const { budget } = await getCurrentBudgetForUser(userId);
      if (budget) {
        await refreshAlertsForBudget(userId, budget.id);
      }
    }

    const detail = await getSharedExpenseDetailForUser(
      result.expenseRow.id,
      userId,
    );

    if (!detail) {
      return {
        success: true,
        data: mapSharedExpenseDetail(
          result.expenseRow,
          result.splitRows.map((row) => ({
            id: row.id,
            shared_expense_id: row.sharedExpenseId,
            user_id: row.userId,
            share_cents: row.shareCents,
            paid_cents: row.paidCents,
            personal_expense_id: row.personalExpenseId,
          })),
        ),
      };
    }

    return { success: true, data: detail };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expense",
    };
  }
}

export async function listSharedExpensesForUser(
  userId: string,
): Promise<ActionResult<SharedExpenseDetail[]>> {
  const items = await getSharedExpensesForUser(userId);
  return { success: true, data: items };
}

export async function getSharedExpenseDetailForUserService(
  userId: string,
  expenseId: string,
): Promise<ActionResult<SharedExpenseDetail>> {
  const detail = await getSharedExpenseDetailForUser(expenseId, userId);

  if (!detail) {
    return { success: false, error: "Shared expense not found" };
  }

  return { success: true, data: detail };
}

export async function deleteSharedExpenseForUser(
  userId: string,
  expenseId: string,
): Promise<ActionResult<void>> {
  const db = getDb();

  const expense = await db.query.sharedExpenses.findFirst({
    where: and(
      eq(sharedExpenses.id, expenseId),
      eq(sharedExpenses.createdByUserId, userId),
    ),
  });

  if (!expense) {
    return { success: false, error: "Shared expense not found" };
  }

  const splits = await db.query.sharedExpenseSplits.findMany({
    where: eq(sharedExpenseSplits.sharedExpenseId, expenseId),
  });

  const personalExpenseIds = splits
    .map((s) => s.personalExpenseId)
    .filter((id): id is string => id !== null);

  await db.transaction(async (tx) => {
    if (personalExpenseIds.length > 0) {
      await tx
        .delete(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            inArray(expenses.id, personalExpenseIds),
          ),
        );
    }

    await tx.delete(sharedExpenses).where(eq(sharedExpenses.id, expenseId));
  });

  const { budget } = await getCurrentBudgetForUser(userId);
  if (budget && personalExpenseIds.length > 0) {
    await refreshAlertsForBudget(userId, budget.id);
  }

  return { success: true, data: undefined };
}
