"use client";

import { useEffect, useState } from "react";
import { getSignedImageUrl } from "@/lib/storage/client-upload";
import { cn } from "@/lib/utils";

export function StorageImage({
  storagePath,
  alt,
  className,
  onClick,
}: {
  storagePath: string;
  alt: string;
  className?: string;
  onClick?: (url: string) => void;
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

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(url)}
        className={cn(
          "cursor-zoom-in overflow-hidden rounded-md p-0",
          className,
        )}
        aria-label={`View ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className="size-full rounded-md object-cover"
        />
      </button>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={cn("rounded-md object-cover", className)} />
  );
}
