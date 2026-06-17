"use client";

import { StorageImage } from "@/components/app/StorageImage";
import { cn } from "@/lib/utils";

function getFirstNameInitial(
  displayName: string | null,
  username?: string | null,
) {
  const firstName = displayName?.trim().split(/\s+/)[0];
  const source = firstName || username?.trim();
  if (!source) {
    return "?";
  }

  return source.charAt(0).toUpperCase();
}

export function UserAvatar({
  displayName,
  username,
  avatarPath,
  className,
}: {
  displayName: string | null;
  username?: string | null;
  avatarPath?: string | null;
  className?: string;
}) {
  const initial = getFirstNameInitial(displayName, username);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-border bg-muted/60",
        className,
      )}
    >
      {avatarPath ? (
        <StorageImage
          storagePath={avatarPath}
          alt={displayName ?? username ?? "User"}
          className="size-full"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
          {initial}
        </span>
      )}
    </div>
  );
}
