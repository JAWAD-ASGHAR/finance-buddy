"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { cn } from "@/lib/utils";

export function AiHeaderButton() {
  const { open, toggle } = useAiAssistant();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggle}
      aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={open}
      className={cn(open && "border-primary/40 bg-primary/5 text-primary")}
    >
      <Sparkles className="size-4" />
    </Button>
  );
}
