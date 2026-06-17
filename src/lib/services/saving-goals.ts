import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { mapSavingContribution, mapSavingGoal } from "@/db/mappers";
import { getDb } from "@/db/index";
import { savingContributions, savingGoals } from "@/db/schema";
import {
  parseMoneyToCents,
  type ActionResult,
  type SavingContribution,
  type SavingGoal,
  type SavingGoalSummary,
} from "@/types/finance";

const createGoalSchema = z.object({
  name: z.string().min(1).max(80),
  targetCents: z.number().int().positive(),
  targetDate: z.string().nullable().optional(),
});

const addContributionSchema = z.object({
  goalId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  note: z.string().max(200).optional(),
  contributedAt: z.string().optional(),
});

function toSummary(
  goal: SavingGoal,
  savedCents: number,
): SavingGoalSummary {
  const remainingCents = Math.max(0, goal.target_cents - savedCents);
  const percentComplete =
    goal.target_cents > 0
      ? Math.min(100, Math.round((savedCents / goal.target_cents) * 100))
      : 0;

  return {
    ...goal,
    saved_cents: savedCents,
    remaining_cents: remainingCents,
    percent_complete: percentComplete,
    is_complete: goal.completed_at !== null || savedCents >= goal.target_cents,
  };
}

async function getSavedCentsByGoalIds(
  goalIds: string[],
): Promise<Map<string, number>> {
  if (goalIds.length === 0) {
    return new Map();
  }

  const db = getDb();
  const rows = await db
    .select({
      savingGoalId: savingContributions.savingGoalId,
      total: sql<number>`coalesce(sum(${savingContributions.amountCents}), 0)`.mapWith(
        Number,
      ),
    })
    .from(savingContributions)
    .where(inArray(savingContributions.savingGoalId, goalIds))
    .groupBy(savingContributions.savingGoalId);

  return new Map(rows.map((row) => [row.savingGoalId, row.total]));
}

export async function getSavingGoalsWithProgressForUser(
  userId: string,
): Promise<SavingGoalSummary[]> {
  const db = getDb();
  const goalRows = await db
    .select()
    .from(savingGoals)
    .where(eq(savingGoals.userId, userId))
    .orderBy(savingGoals.createdAt);

  const goals = goalRows.map(mapSavingGoal);
  const savedByGoal = await getSavedCentsByGoalIds(goals.map((goal) => goal.id));

  return goals.map((goal) =>
    toSummary(goal, savedByGoal.get(goal.id) ?? 0),
  );
}

export async function getActiveSavingGoalsForUser(
  userId: string,
  limit = 2,
): Promise<SavingGoalSummary[]> {
  const goals = await getSavingGoalsWithProgressForUser(userId);
  return goals
    .filter((goal) => !goal.is_complete)
    .slice(0, limit);
}

export async function createSavingGoalForUser(
  userId: string,
  input: { name: string; target: string; targetDate?: string },
): Promise<ActionResult<SavingGoal>> {
  const targetCents = parseMoneyToCents(input.target);
  if (targetCents === null || targetCents <= 0) {
    return { success: false, error: "Enter a valid target amount" };
  }

  const parsed = createGoalSchema.safeParse({
    name: input.name.trim(),
    targetCents,
    targetDate: input.targetDate?.trim() || null,
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid savings goal details" };
  }

  const db = getDb();
  const [row] = await db
    .insert(savingGoals)
    .values({
      userId,
      name: parsed.data.name,
      targetCents: parsed.data.targetCents,
      targetDate: parsed.data.targetDate,
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to create savings goal" };
  }

  return { success: true, data: mapSavingGoal(row) };
}

export async function addSavingContributionForUser(
  userId: string,
  input: {
    goalId: string;
    amount: string;
    note?: string;
    contributedAt?: string;
  },
): Promise<ActionResult<SavingContribution>> {
  const amountCents = parseMoneyToCents(input.amount);
  if (amountCents === null || amountCents <= 0) {
    return { success: false, error: "Enter a valid contribution amount" };
  }

  const parsed = addContributionSchema.safeParse({
    goalId: input.goalId,
    amountCents,
    note: input.note?.trim(),
    contributedAt: input.contributedAt?.trim(),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid contribution details" };
  }

  const db = getDb();
  const [goal] = await db
    .select()
    .from(savingGoals)
    .where(
      and(eq(savingGoals.id, parsed.data.goalId), eq(savingGoals.userId, userId)),
    )
    .limit(1);

  if (!goal) {
    return { success: false, error: "Savings goal not found" };
  }

  if (goal.completedAt) {
    return { success: false, error: "This savings goal is already complete" };
  }

  const [row] = await db
    .insert(savingContributions)
    .values({
      savingGoalId: parsed.data.goalId,
      userId,
      amountCents: parsed.data.amountCents,
      contributedAt: parsed.data.contributedAt ?? sql`CURRENT_DATE`,
      note: parsed.data.note ?? "",
    })
    .returning();

  if (!row) {
    return { success: false, error: "Failed to add contribution" };
  }

  const savedByGoal = await getSavedCentsByGoalIds([goal.id]);
  const savedCents = savedByGoal.get(goal.id) ?? 0;
  if (savedCents >= goal.targetCents) {
    await db
      .update(savingGoals)
      .set({ completedAt: new Date() })
      .where(eq(savingGoals.id, goal.id));
  }

  return { success: true, data: mapSavingContribution(row) };
}

export async function markSavingGoalCompleteForUser(
  userId: string,
  goalId: string,
): Promise<ActionResult<SavingGoal>> {
  const db = getDb();
  const [row] = await db
    .update(savingGoals)
    .set({ completedAt: new Date() })
    .where(and(eq(savingGoals.id, goalId), eq(savingGoals.userId, userId)))
    .returning();

  if (!row) {
    return { success: false, error: "Savings goal not found" };
  }

  return { success: true, data: mapSavingGoal(row) };
}

export async function deleteSavingGoalForUser(
  userId: string,
  goalId: string,
): Promise<ActionResult<void>> {
  const db = getDb();
  const result = await db
    .delete(savingGoals)
    .where(and(eq(savingGoals.id, goalId), eq(savingGoals.userId, userId)))
    .returning({ id: savingGoals.id });

  if (result.length === 0) {
    return { success: false, error: "Savings goal not found" };
  }

  return { success: true, data: undefined };
}

export async function deleteAllSavingGoalsForUser(
  userId: string,
): Promise<void> {
  const db = getDb();
  await db.delete(savingContributions).where(eq(savingContributions.userId, userId));
  await db.delete(savingGoals).where(eq(savingGoals.userId, userId));
}
