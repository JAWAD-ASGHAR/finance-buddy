"use client";

import { useState } from "react";
import { ImageLightbox } from "@/components/app/ImageLightbox";
import { StorageImage } from "@/components/app/StorageImage";
import type { ExpenseAttachment } from "@/types/finance";
import { cn } from "@/lib/utils";

export function ExpenseAttachmentGallery({
  attachments,
  className,
  thumbnailClassName = "size-14",
}: {
  attachments?: ExpenseAttachment[];
  className?: string;
  thumbnailClassName?: string;
}) {
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("flex flex-nowrap gap-2", className)}>
        {attachments.map((attachment) => (
          <StorageImage
            key={attachment.id}
            storagePath={attachment.storage_path}
            alt={attachment.file_name}
            className={cn("shrink-0 border border-border", thumbnailClassName)}
            onClick={(url) =>
              setLightbox({ src: url, alt: attachment.file_name })
            }
          />
        ))}
      </div>

      <ImageLightbox
        src={lightbox?.src ?? null}
        alt={lightbox?.alt ?? "Expense image"}
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
