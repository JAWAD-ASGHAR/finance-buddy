"use client";

import { formatDistanceToNow } from "date-fns";
import { History, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StoredAiChatSession } from "@/lib/ai/chat-history";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AiChatHistoryMenuProps = {
  sessions: StoredAiChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onOpen?: () => void;
};

export function AiChatHistoryMenu({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onOpen,
}: AiChatHistoryMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      onOpen?.();
    }
  }, [open, onOpen]);

  const sortedSessions = [...sessions].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Chat history"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(open && "bg-muted")}
      >
        <History className="size-4" />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Chat history"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onNewChat();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Plus className="size-4 shrink-0" />
              New chat
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {sortedSessions.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">
                No previous chats yet.
              </p>
            ) : (
              sortedSessions.map((session) => {
                const isActive = session.id === activeSessionId;

                return (
                  <button
                    key={session.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelectSession(session.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted",
                      isActive && "bg-muted",
                    )}
                  >
                    <span className="truncate text-sm font-medium text-foreground">
                      {session.title}
                    </span>
                    <span className="text-[0.6875rem] text-muted-foreground">
                      {formatDistanceToNow(session.updatedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
