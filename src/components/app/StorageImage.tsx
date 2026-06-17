"use client";

import { useEffect, useState } from "react";
import { getSignedImageUrl } from "@/lib/storage/client-upload";
import { cn } from "@/lib/utils";

export function StorageImage({
  storagePath,
  alt,
  className,
}: {
  storagePath: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void getSignedImageUrl(storagePath)
      .then((signedUrl) => {
        if (active) {
          setUrl(signedUrl);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [storagePath]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground",
          className,
        )}
      >
        Image unavailable
      </div>
    );
  }

  if (!url) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-md bg-muted",
          className,
        )}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={cn("rounded-md object-cover", className)} />
  );
}
