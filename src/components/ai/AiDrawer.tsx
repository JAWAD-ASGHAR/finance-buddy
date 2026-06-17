"use client";

import { useEffect } from "react";
import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { DRAWER_WIDTH, useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { AppOverlay } from "@/components/app/AppOverlay";
import { cn } from "@/lib/utils";

export function AiDrawer({ userId }: { userId: string }) {
  const { open, setOpen } = useAiAssistant();

  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    if (!mediaQuery.matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <AppOverlay
        open={open}
        onClose={() => setOpen(false)}
        aria-label="Close assistant"
        className="z-30 sm:hidden"
      />

      <aside
        aria-hidden={!open}
        aria-label="AI assistant"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex h-dvh max-h-dvh flex-col border-l border-border bg-background shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
          "w-full sm:w-[min(100vw,420px)]",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        style={{ maxWidth: DRAWER_WIDTH }}
      >
        <AiChatPanel userId={userId} />
      </aside>
    </>
  );
}
