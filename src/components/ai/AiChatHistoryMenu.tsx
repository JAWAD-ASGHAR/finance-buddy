"use client";

import { formatDistanceToNow } from "date-fns";
import { History, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoredAiChatSession } from "@/lib/ai/chat-history";
import { AppFlyoutPanel } from "@/components/app/AppFlyoutPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SESSIONS_PAGE_SIZE = 15;
const SCROLL_LOAD_THRESHOLD_PX = 48;

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
  const [visibleSessionCount, setVisibleSessionCount] =
    useState(SESSIONS_PAGE_SIZE);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

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
      setVisibleSessionCount(SESSIONS_PAGE_SIZE);
      requestAnimationFrame(() => {
        const list = listRef.current;
        if (list) {
          list.scrollTop = list.scrollHeight;
        }
      });
    }
  }, [open, onOpen]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );

  const visibleSessions = useMemo(() => {
    if (sortedSessions.length <= visibleSessionCount) {
      return sortedSessions;
    }

    return sortedSessions.slice(
      sortedSessions.length - visibleSessionCount,
    );
  }, [sortedSessions, visibleSessionCount]);

  const hasOlderSessions = sortedSessions.length > visibleSessions.length;

  const loadOlderSessions = useCallback(() => {
    if (!hasOlderSessions || loadingMoreRef.current) return;

    const list = listRef.current;
    if (!list) return;

    loadingMoreRef.current = true;
    const previousScrollHeight = list.scrollHeight;
    const previousScrollTop = list.scrollTop;

    setVisibleSessionCount((current) =>
      Math.min(sortedSessions.length, current + SESSIONS_PAGE_SIZE),
    );

    requestAnimationFrame(() => {
      const nextList = listRef.current;
      if (nextList) {
        nextList.scrollTop =
          nextList.scrollHeight - previousScrollHeight + previousScrollTop;
      }
      loadingMoreRef.current = false;
    });
  }, [hasOlderSessions, sortedSessions.length]);

  const handleListScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    if (list.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
      loadOlderSessions();
    }
  }, [loadOlderSessions]);

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

      <AppFlyoutPanel
        open={open}
        className="w-[min(18rem,calc(100vw-2rem))] sm:w-72"
      >
        <div role="menu" aria-label="Chat history">
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

          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="max-h-80 overflow-y-auto p-1"
          >
            {sortedSessions.length === 0 ? (
              <p className="px-2.5 py-3 text-xs text-muted-foreground">
                No previous chats yet.
              </p>
            ) : (
              <>
                {hasOlderSessions ? (
                  <p className="px-2.5 py-2 text-center text-[0.6875rem] text-muted-foreground">
                    Scroll up for older chats
                  </p>
                ) : null}

                {visibleSessions.map((session) => {
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
                })}
              </>
            )}
          </div>
        </div>
      </AppFlyoutPanel>
    </div>
  );
}
