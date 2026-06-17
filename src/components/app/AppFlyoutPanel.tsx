"use client";

import { useAnimatedOpen } from "@/hooks/useAnimatedOpen";
import { cn } from "@/lib/utils";

export function AppFlyoutPanel({
  open,
  children,
  className,
  align = "right",
  durationMs = 250,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  align?: "right" | "left";
  durationMs?: number;
}) {
  const { mounted, visible } = useAnimatedOpen(open, durationMs);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-border bg-background shadow-lg transition-all ease-out motion-reduce:transition-none",
        align === "right" ? "right-0" : "left-0",
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        className,
      )}
      style={{ transitionDuration: `${durationMs}ms` }}
    >
      {children}
    </div>
  );
}
