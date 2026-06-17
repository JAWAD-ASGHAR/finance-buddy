"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { clearProfileAvatar, saveProfileAvatarPath } from "@/actions/images";
import { StorageImage } from "@/components/app/StorageImage";
import { AppButton } from "@/components/app/ui";
import {
  formatMaxImageSizeLabel,
  validateImageFile,
} from "@/lib/storage/images";
import { uploadProfileAvatar } from "@/lib/storage/client-upload";
import { cn } from "@/lib/utils";

export function ProfileAvatarPicker({
  userId,
  initialAvatarPath,
}: {
  userId: string;
  initialAvatarPath: string | null;
}) {
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelect(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.ok) {
      toast.error(validation.error);
      return;
    }

    setPending(true);

    try {
      const storagePath = await uploadProfileAvatar(userId, file);
      const result = await saveProfileAvatarPath(storagePath);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setAvatarPath(result.data.avatarPath);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload profile photo",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleRemove() {
    setPending(true);

    const result = await clearProfileAvatar();
    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    setAvatarPath(null);
    toast.success("Profile photo removed");
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className={cn(
          "relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/40",
        )}
      >
        {avatarPath ? (
          <StorageImage
            storagePath={avatarPath}
            alt="Profile photo"
            className="size-full"
          />
        ) : (
          <Camera className="size-8 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, or GIF up to {formatMaxImageSizeLabel()}.
        </p>
        <div className="flex flex-wrap gap-2">
          <AppButton
            type="button"
            loading={pending}
            onClick={() => inputRef.current?.click()}
          >
            {avatarPath ? "Change photo" : "Upload photo"}
          </AppButton>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={pending}
            onChange={(event) => void handleSelect(event.target.files)}
          />
          {avatarPath ? (
            <AppButton
              type="button"
              variant="secondary"
              loading={pending}
              onClick={() => void handleRemove()}
            >
              <Trash2 className="size-4" />
              Remove
            </AppButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
