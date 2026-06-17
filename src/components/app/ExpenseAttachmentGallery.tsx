"use client";

import { StorageImage } from "@/components/app/StorageImage";
import type { ExpenseAttachment } from "@/types/finance";

export function ExpenseAttachmentGallery({
  attachments,
}: {
  attachments?: ExpenseAttachment[];
}) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <StorageImage
          key={attachment.id}
          storagePath={attachment.storage_path}
          alt={attachment.file_name}
          className="size-14 border border-border"
        />
      ))}
    </div>
  );
}
