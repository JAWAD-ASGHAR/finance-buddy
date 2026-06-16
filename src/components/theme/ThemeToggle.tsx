"use client";

import { Moon, Sun } from "lucide-react";
import { useInvertedTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  light?: boolean;
  className?: string;
};

export function ThemeToggle({ light = false, className }: ThemeToggleProps) {
  const { inverted, toggle } = useInvertedTheme();

  return (
    <button
      type="button"
      onClick={(event) => toggle(event)}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green",
        light
          ? "border-white/25 text-white hover:border-white/40 hover:bg-white/10"
          : "border-border text-foreground hover:border-foreground/20 hover:bg-muted",
        className,
      )}
      aria-label={inverted ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={inverted}
    >
      {inverted ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
    </button>
  );
}
