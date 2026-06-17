"use client";

import { createClient } from "@/lib/supabase/client";
import {
  buildExpenseAttachmentPath,
  buildProfileAvatarPath,
  IMAGES_BUCKET,
  validateImageFile,
} from "@/lib/storage/images";

function createProfileAvatarUploadTarget(userId: string, extension: string) {
  return { storagePath: buildProfileAvatarPath(userId, extension) };
}

function createExpenseAttachmentUploadTarget(
  userId: string,
  expenseId: string,
  extension: string,
) {
  const attachmentId = crypto.randomUUID();
  return {
    attachmentId,
    storagePath: buildExpenseAttachmentPath(
      userId,
      expenseId,
      attachmentId,
      extension,
    ),
  };
}

export async function uploadImageToStorage(storagePath: string, file: File) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(storagePath, file, {
      upsert: true,
      contentType: validation.contentType,
    });

  if (error) {
    throw new Error(error.message);
  }

  return validation;
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const { storagePath } = createProfileAvatarUploadTarget(
    userId,
    validation.extension,
  );

  await uploadImageToStorage(storagePath, file);
  return storagePath;
}

export async function uploadExpenseImages(
  userId: string,
  expenseId: string,
  files: File[],
) {
  const uploads: Array<{
    storagePath: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    sortOrder: number;
  }> = [];

  for (const [index, file] of files.entries()) {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const { storagePath } = createExpenseAttachmentUploadTarget(
      userId,
      expenseId,
      validation.extension,
    );

    await uploadImageToStorage(storagePath, file);

    uploads.push({
      storagePath,
      fileName: file.name,
      contentType: validation.contentType,
      sizeBytes: file.size,
      sortOrder: index,
    });
  }

  return uploads;
}

export async function getSignedImageUrl(storagePath: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}
