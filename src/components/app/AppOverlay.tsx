"use client";

import { cn } from "@/lib/utils";

export function AppOverlay({
  open,
  onClose,
  className,
  "aria-label": ariaLabel = "Close panel",
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-hidden={!open}
      tabIndex={open ? 0 : -1}
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        className,
      )}
    />
  );
}
