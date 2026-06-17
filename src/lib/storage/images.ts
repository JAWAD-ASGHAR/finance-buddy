export const IMAGES_BUCKET = "images";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const MAX_EXPENSE_IMAGES = 3;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const EXTENSION_BY_TYPE: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type ImageValidationResult =
  | { ok: true; contentType: AllowedImageType; extension: string }
  | { ok: false; error: string };

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return {
      ok: false,
      error: "Use a JPEG, PNG, WebP, or GIF image",
    };
  }

  if (file.size <= 0) {
    return { ok: false, error: "Image file is empty" };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      ok: false,
      error: "Each image must be 5 MB or smaller",
    };
  }

  const contentType = file.type as AllowedImageType;

  return {
    ok: true,
    contentType,
    extension: EXTENSION_BY_TYPE[contentType],
  };
}

export function validateImageCount(
  currentCount: number,
  incomingCount: number,
): string | null {
  if (incomingCount <= 0) {
    return "Choose at least one image";
  }

  if (incomingCount > MAX_EXPENSE_IMAGES) {
    return `You can attach up to ${MAX_EXPENSE_IMAGES} images`;
  }

  if (currentCount + incomingCount > MAX_EXPENSE_IMAGES) {
    return `You can attach up to ${MAX_EXPENSE_IMAGES} images per expense`;
  }

  return null;
}

export function buildProfileAvatarPath(userId: string, extension: string) {
  return `profiles/${userId}/avatar.${extension}`;
}

export function buildExpenseAttachmentPath(
  userId: string,
  expenseId: string,
  attachmentId: string,
  extension: string,
) {
  return `expenses/${userId}/${expenseId}/${attachmentId}.${extension}`;
}

export function isProfileAvatarPath(path: string, userId: string) {
  return path.startsWith(`profiles/${userId}/avatar.`);
}

export function isExpenseAttachmentPath(
  path: string,
  userId: string,
  expenseId: string,
) {
  const prefix = `expenses/${userId}/${expenseId}/`;
  return path.startsWith(prefix) && !path.slice(prefix.length).includes("/");
}

export function formatMaxImageSizeLabel() {
  return "5 MB";
}
