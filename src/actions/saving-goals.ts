"use server";

import { requireAuthUser } from "@/lib/db/queries";
import {
  addSavingContributionForUser,
  createSavingGoalForUser,
  deleteSavingGoalForUser,
  getActiveSavingGoalsForUser,
  getSavingGoalsWithProgressForUser,
  markSavingGoalCompleteForUser,
} from "@/lib/services/saving-goals";
import { revalidateSavingsPaths } from "@/lib/services/revalidate";
import type {
  ActionResult,
  SavingContribution,
  SavingGoal,
  SavingGoalSummary,
} from "@/types/finance";

export async function getSavingGoals(): Promise<SavingGoalSummary[]> {
  const user = await requireAuthUser();
  return getSavingGoalsWithProgressForUser(user.id);
}

export async function getActiveSavingGoals(
  limit = 2,
): Promise<SavingGoalSummary[]> {
  const user = await requireAuthUser();
  return getActiveSavingGoalsForUser(user.id, limit);
}

export async function createSavingGoal(input: {
  name: string;
  target: string;
  targetDate?: string;
}): Promise<ActionResult<SavingGoal>> {
  const user = await requireAuthUser();
  const result = await createSavingGoalForUser(user.id, input);
  if (result.success) {
    revalidateSavingsPaths();
  }
  return result;
}

export async function addSavingContribution(input: {
  goalId: string;
  amount: string;
  note?: string;
  contributedAt?: string;
}): Promise<ActionResult<SavingContribution>> {
  const user = await requireAuthUser();
  const result = await addSavingContributionForUser(user.id, input);
  if (result.success) {
    revalidateSavingsPaths();
  }
  return result;
}

export async function markSavingGoalComplete(
  goalId: string,
): Promise<ActionResult<SavingGoal>> {
  const user = await requireAuthUser();
  const result = await markSavingGoalCompleteForUser(user.id, goalId);
  if (result.success) {
    revalidateSavingsPaths();
  }
  return result;
}

export async function deleteSavingGoal(
  goalId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await deleteSavingGoalForUser(user.id, goalId);
  if (result.success) {
    revalidateSavingsPaths();
  }
  return result;
}
