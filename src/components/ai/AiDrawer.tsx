"use client";

import { AiChatPanel } from "@/components/ai/AiChatPanel";
import { DRAWER_WIDTH, useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { cn } from "@/lib/utils";

export function AiDrawer() {
  const { open } = useAiAssistant();

  return (
    <aside
      aria-hidden={!open}
      aria-label="AI assistant"
      className={cn(
        "fixed inset-y-0 right-0 z-40 border-l border-border bg-background shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
        "w-full sm:w-[min(100vw,420px)]",
        open ? "translate-x-0" : "translate-x-full pointer-events-none",
      )}
      style={{ maxWidth: DRAWER_WIDTH }}
    >
      <AiChatPanel />
    </aside>
  );
}
