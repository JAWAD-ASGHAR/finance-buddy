"use server";

import { revalidatePath } from "next/cache";
import { requireAuthUser } from "@/lib/db/queries";
import {
  registerExpenseAttachmentForUser,
  removeProfileAvatarForUser,
  setProfileAvatarPathForUser,
} from "@/lib/services/images";
import type { ActionResult, ExpenseAttachment } from "@/types/finance";

export async function saveProfileAvatarPath(
  storagePath: string,
): Promise<ActionResult<{ avatarPath: string }>> {
  const user = await requireAuthUser();
  const result = await setProfileAvatarPathForUser(user.id, storagePath);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result.success && result.data.avatarPath
    ? { success: true, data: { avatarPath: result.data.avatarPath } }
    : { success: false, error: result.success ? "Missing avatar path" : result.error };
}

export async function clearProfileAvatar(): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  const result = await removeProfileAvatarForUser(user.id);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}

export async function registerExpenseAttachment(input: {
  expenseId: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
}): Promise<ActionResult<ExpenseAttachment>> {
  const user = await requireAuthUser();
  return registerExpenseAttachmentForUser(user.id, input);
}
