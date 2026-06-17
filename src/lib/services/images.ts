import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { mapExpenseAttachment } from "@/db/mappers";
import { getDb } from "@/db/index";
import { expenseAttachments, expenses, profiles } from "@/db/schema";
import {
  isExpenseAttachmentPath,
  isProfileAvatarPath,
  MAX_EXPENSE_IMAGES,
  validateImageCount,
} from "@/lib/storage/images";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult, ExpenseAttachment } from "@/types/finance";

async function removeStorageObjects(paths: string[]) {
  if (paths.length === 0) return;

  const admin = createAdminClient();
  const { error } = await admin.storage.from("images").remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getProfileAvatarPathForUser(
  userId: string,
): Promise<string | null> {
  const db = getDb();
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { avatarPath: true },
  });

  return row?.avatarPath ?? null;
}

export async function setProfileAvatarPathForUser(
  userId: string,
  avatarPath: string | null,
): Promise<ActionResult<{ avatarPath: string | null }>> {
  if (avatarPath !== null && !isProfileAvatarPath(avatarPath, userId)) {
    return { success: false, error: "Invalid avatar path" };
  }

  const db = getDb();
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { avatarPath: true },
  });

  if (!existing) {
    return { success: false, error: "Profile not found" };
  }

  const [row] = await db
    .update(profiles)
    .set({ avatarPath })
    .where(eq(profiles.id, userId))
    .returning({ avatarPath: profiles.avatarPath });

  if (!row) {
    return { success: false, error: "Failed to update profile image" };
  }

  if (existing.avatarPath && existing.avatarPath !== avatarPath) {
    try {
      await removeStorageObjects([existing.avatarPath]);
    } catch {
      // Keep the new avatar even if cleanup fails.
    }
  }

  return { success: true, data: { avatarPath: row.avatarPath } };
}

export async function removeProfileAvatarForUser(
  userId: string,
): Promise<ActionResult<void>> {
  const result = await setProfileAvatarPathForUser(userId, null);
  if (!result.success) {
    return result;
  }

  return { success: true, data: undefined };
}

export async function registerExpenseAttachmentForUser(
  userId: string,
  input: {
    expenseId: string;
    storagePath: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    sortOrder: number;
  },
): Promise<ActionResult<ExpenseAttachment>> {
  if (
    !isExpenseAttachmentPath(input.storagePath, userId, input.expenseId)
  ) {
    return { success: false, error: "Invalid attachment path" };
  }

  if (input.sortOrder < 0 || input.sortOrder >= MAX_EXPENSE_IMAGES) {
    return { success: false, error: "Invalid attachment order" };
  }

  const db = getDb();
  const expense = await db.query.expenses.findFirst({
    where: and(eq(expenses.id, input.expenseId), eq(expenses.userId, userId)),
    columns: { id: true },
  });

  if (!expense) {
    return { success: false, error: "Expense not found" };
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(expenseAttachments)
    .where(eq(expenseAttachments.expenseId, input.expenseId));

  const existingCount = countRow?.count ?? 0;

  const countError = validateImageCount(existingCount, 1);
  if (countError) {
    return { success: false, error: countError };
  }

  try {
    const [row] = await db
      .insert(expenseAttachments)
      .values({
        expenseId: input.expenseId,
        userId,
        storagePath: input.storagePath,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        sortOrder: input.sortOrder,
      })
      .returning();

    return { success: true, data: mapExpenseAttachment(row) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save attachment",
    };
  }
}

export async function listExpenseAttachmentsForExpenses(
  expenseIds: string[],
): Promise<Record<string, ExpenseAttachment[]>> {
  if (expenseIds.length === 0) {
    return {};
  }

  const db = getDb();
  const rows = await db.query.expenseAttachments.findMany({
    where: inArray(expenseAttachments.expenseId, expenseIds),
    orderBy: asc(expenseAttachments.sortOrder),
  });

  return rows.reduce<Record<string, ExpenseAttachment[]>>((acc, row) => {
    const attachment = mapExpenseAttachment(row);
    const current = acc[attachment.expense_id] ?? [];
    current.push(attachment);
    acc[attachment.expense_id] = current;
    return acc;
  }, {});
}

export async function deleteExpenseAttachmentsForExpense(
  userId: string,
  expenseId: string,
): Promise<void> {
  const db = getDb();
  const rows = await db.query.expenseAttachments.findMany({
    where: and(
      eq(expenseAttachments.expenseId, expenseId),
      eq(expenseAttachments.userId, userId),
    ),
    columns: { storagePath: true },
  });

  if (rows.length === 0) {
    return;
  }

  await removeStorageObjects(rows.map((row) => row.storagePath));
}
