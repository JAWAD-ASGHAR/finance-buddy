"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FloatingCTABarProps = {
  message?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export function FloatingCTABar({
  message = "Want early access?",
  buttonLabel = "Join the waitlist",
  buttonHref = "/contact",
}: FloatingCTABarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="consultation-prompt fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-5 z-40"
    >
      <div
        id={panelId}
        className={cn(
          "consultation-prompt__panel mb-3 w-[min(calc(100vw-2.5rem),17.5rem)] origin-bottom-left rounded-2xl border border-border/80 bg-white/95 p-4 shadow-[0_12px_40px_rgba(10,10,10,0.1)] backdrop-blur-md transition-all duration-300 ease-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.96] opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium leading-snug text-foreground">
            {message}
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            <X size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
        <Button
          href={buttonHref}
          className="mt-4 w-full rounded-full px-5 py-2.5"
          onClick={() => setOpen(false)}
          cursorLabel="Book"
        >
          {buttonLabel}
        </Button>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          open ? "Close waitlist prompt" : "Open waitlist prompt"
        }
        onClick={() => setOpen((current) => !current)}
        className="consultation-prompt__trigger inline-flex size-11 min-h-11 min-w-11 touch-manipulation cursor-pointer items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
      >
        {open ? (
          <X size={18} strokeWidth={2.25} aria-hidden />
        ) : (
          <Calendar size={18} strokeWidth={2.25} aria-hidden />
        )}
      </button>
    </div>
  );
}
