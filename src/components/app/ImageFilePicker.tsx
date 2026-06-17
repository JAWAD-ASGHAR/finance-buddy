"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/app/ui";
import {
  formatMaxImageSizeLabel,
  MAX_EXPENSE_IMAGES,
  validateImageCount,
  validateImageFile,
} from "@/lib/storage/images";
import { cn } from "@/lib/utils";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export function ImageFilePicker({
  files,
  onChange,
  disabled = false,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.previewUrl);
      }
    };
  }, [previews]);

  function handleSelect(selectedFiles: FileList | null) {
    if (!selectedFiles || disabled) {
      return;
    }

    const nextFiles = [...files];
    const incoming = Array.from(selectedFiles);

    const countError = validateImageCount(files.length, incoming.length);
    if (countError) {
      setError(countError);
      return;
    }

    for (const file of incoming) {
      const validation = validateImageFile(file);
      if (!validation.ok) {
        setError(validation.error);
        return;
      }

      nextFiles.push(file);
    }

    setError(null);
    onChange(nextFiles.slice(0, MAX_EXPENSE_IMAGES));
  }

  function removeFile(index: number) {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
    setError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {previews.map((preview, index) => (
          <div key={`${preview.file.name}-${index}`} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.previewUrl}
              alt={preview.file.name}
              className="size-20 rounded-md border border-border object-cover"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeFile(index)}
              className="absolute -top-2 -right-2 rounded-full border border-border bg-background p-1 text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${preview.file.name}`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {files.length < MAX_EXPENSE_IMAGES ? (
          <label
            className={cn(
              "flex size-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:bg-muted/50",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <ImagePlus className="size-5" />
            <span className="mt-1 text-[10px] font-medium">Add</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              disabled={disabled}
              className="sr-only"
              onChange={(event) => handleSelect(event.target.files)}
            />
          </label>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Up to {MAX_EXPENSE_IMAGES} images, {formatMaxImageSizeLabel()} each.
        JPEG, PNG, WebP, or GIF.
      </p>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {files.length > 0 ? (
        <AppButton
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => onChange([])}
        >
          Clear images
        </AppButton>
      ) : null}
    </div>
  );
}
