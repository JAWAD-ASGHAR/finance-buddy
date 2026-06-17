"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AiMessageBubble,
  getConfirmationFromMessages,
} from "@/components/ai/AiMessageBubble";
import { useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { AiChatHistoryMenu } from "@/components/ai/AiChatHistoryMenu";
import { AiChatInput } from "@/components/ai/AiChatInput";
import { Button } from "@/components/ui/button";
import {
  buildConversationContext,
  createChatSession,
  getOrCreateActiveSession,
  loadChatSessions,
  MESSAGES_PAGE_SIZE,
  saveChatSessions,
  setActiveSessionId,
  upsertChatSession,
  type StoredAiChatSession,
} from "@/lib/ai/chat-history";

const SCROLL_LOAD_THRESHOLD_PX = 80;
const STICK_TO_BOTTOM_THRESHOLD_PX = 48;

function AiChatEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">How can I help?</p>
      <p className="mt-1 text-xs">
        I can only help with Finance Buddy — budgets, expenses, friends, and
        shared bills.
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>&quot;What&apos;s left in my Food budget?&quot;</li>
        <li>&quot;Log $12.50 lunch at the campus cafe&quot;</li>
        <li>&quot;Split a $60 dinner with Alex&quot;</li>
        <li>&quot;Show my spending report for this month&quot;</li>
      </ul>
    </div>
  );
}

function AiChatPanelShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-semibold">Finance Buddy AI</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">{children}</div>
      <div className="shrink-0 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex items-end gap-2">
          <AiChatInput
            value=""
            onChange={() => {}}
            onSubmit={() => {}}
            disabled
            placeholder="Ask me to log an expense, check balances…"
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled
            aria-label="Send message"
            className="size-8 shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AiChatPanel({ userId }: { userId: string }) {
  const { setOpen } = useAiAssistant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AiChatPanelShell onClose={() => setOpen(false)}>
        <AiChatEmptyState />
      </AiChatPanelShell>
    );
  }

  return <AiChatPanelInner userId={userId} />;
}

function scrollToBottom(
  element: HTMLDivElement | null,
  behavior: ScrollBehavior = "auto",
) {
  element?.scrollTo({
    top: element.scrollHeight,
    behavior,
  });
}

function AiChatPanelInner({ userId }: { userId: string }) {
  const { setOpen } = useAiAssistant();
  const [input, setInput] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [dismissedConfirmationAt, setDismissedConfirmationAt] = useState<
    number | null
  >(null);
  const [sessions, setSessions] = useState<StoredAiChatSession[]>(() =>
    loadChatSessions(userId),
  );
  const [activeSessionId, setActiveSessionIdState] = useState<string>(() =>
    getOrCreateActiveSession(userId).id,
  );
  const [visibleMessageCount, setVisibleMessageCount] =
    useState(MESSAGES_PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const loadingOlderMessagesRef = useRef(false);

  const initialSession = useMemo(
    () =>
      loadChatSessions(userId).find(
        (session) => session.id === activeSessionId,
      ) ?? getOrCreateActiveSession(userId),
    [activeSessionId, userId],
  );

  const refreshSessions = useCallback(() => {
    setSessions(loadChatSessions(userId));
  }, [userId]);

  const handleChatFinish = useCallback(
    ({ messages: finishedMessages }: { messages: UIMessage[] }) => {
      upsertChatSession(userId, activeSessionId, finishedMessages);
      refreshSessions();
    },
    [activeSessionId, refreshSessions, userId],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            conversationContext: buildConversationContext(messages),
          },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: activeSessionId,
    messages: initialSession.messages,
    transport,
    onFinish: handleChatFinish,
  });

  const visibleMessages = useMemo(() => {
    if (messages.length <= visibleMessageCount) {
      return messages;
    }

    return messages.slice(messages.length - visibleMessageCount);
  }, [messages, visibleMessageCount]);

  const hasOlderMessages = messages.length > visibleMessages.length;

  const pendingConfirmation = useMemo(() => {
    if (dismissedConfirmationAt === messages.length) return null;
    return getConfirmationFromMessages(messages);
  }, [dismissedConfirmationAt, messages]);

  const resetMessageWindow = useCallback(() => {
    setVisibleMessageCount(MESSAGES_PAGE_SIZE);
    stickToBottomRef.current = true;
  }, []);

  useEffect(() => {
    setSessions(loadChatSessions(userId));
    setActiveSessionIdState(getOrCreateActiveSession(userId).id);
    resetMessageWindow();
  }, [userId, resetMessageWindow]);

  useEffect(() => {
    resetMessageWindow();
    requestAnimationFrame(() => {
      scrollToBottom(scrollRef.current, "auto");
    });
  }, [activeSessionId, resetMessageWindow]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;

    scrollToBottom(scrollRef.current, "auto");
  }, [messages, status, visibleMessages.length]);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom(scrollRef.current, "auto");
    });
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const loadOlderMessages = useCallback(() => {
    if (!hasOlderMessages || loadingOlderMessagesRef.current) return;

    const element = scrollRef.current;
    if (!element) return;

    loadingOlderMessagesRef.current = true;
    const previousScrollHeight = element.scrollHeight;
    const previousScrollTop = element.scrollTop;

    setVisibleMessageCount((current) =>
      Math.min(messages.length, current + MESSAGES_PAGE_SIZE),
    );

    requestAnimationFrame(() => {
      const nextElement = scrollRef.current;
      if (nextElement) {
        nextElement.scrollTop =
          nextElement.scrollHeight - previousScrollHeight + previousScrollTop;
      }
      loadingOlderMessagesRef.current = false;
    });
  }, [hasOlderMessages, messages.length]);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    stickToBottomRef.current =
      distanceFromBottom <= STICK_TO_BOTTOM_THRESHOLD_PX;

    if (element.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
      loadOlderMessages();
    }
  }, [loadOlderMessages]);

  const isLoading = status === "streaming" || status === "submitted";

  const switchSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return;

      upsertChatSession(userId, activeSessionId, messages);
      setActiveSessionId(userId, sessionId);
      setActiveSessionIdState(sessionId);
      refreshSessions();
      setInput("");
    },
    [activeSessionId, messages, refreshSessions, userId],
  );

  const startNewChat = useCallback(() => {
    upsertChatSession(userId, activeSessionId, messages);
    const created = createChatSession();
    saveChatSessions(userId, [created, ...loadChatSessions(userId)]);
    setActiveSessionId(userId, created.id);
    setActiveSessionIdState(created.id);
    refreshSessions();
    setInput("");
  }, [activeSessionId, messages, refreshSessions, userId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    stickToBottomRef.current = true;
    setInput("");
    await sendMessage({ text });
  }

  async function handleConfirmDestructive() {
    if (!pendingConfirmation) return;
    setConfirmLoading(true);

    try {
      const response = await fetch("/api/ai/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: pendingConfirmation.toolName,
          payload: pendingConfirmation.payload,
        }),
      });

      const data = (await response.json()) as {
        confirmationToken?: string;
        error?: string;
      };

      if (!response.ok || !data.confirmationToken) {
        throw new Error(data.error ?? "Failed to confirm action");
      }

      stickToBottomRef.current = true;
      await sendMessage({
        text: `I confirm. Use confirmationToken "${data.confirmationToken}" for ${pendingConfirmation.toolName}.`,
      });
    } catch (confirmError) {
      console.error(confirmError);
    } finally {
      setConfirmLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-semibold">Finance Buddy AI</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <AiChatHistoryMenu
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={switchSession}
            onNewChat={startNewChat}
            onOpen={refreshSessions}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="Close assistant"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {hasOlderMessages ? (
          <p className="py-1 text-center text-xs text-muted-foreground">
            Scroll up for earlier messages
          </p>
        ) : null}

        {messages.length === 0 ? <AiChatEmptyState /> : null}

        {visibleMessages.map((message) => (
          <AiMessageBubble key={message.id} message={message} />
        ))}

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Thinking…
          </div>
        ) : null}
      </div>

      {pendingConfirmation ? (
        <div className="border-t border-border bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
          <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
            Confirm destructive action
          </p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
            {pendingConfirmation.description}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={confirmLoading}
              onClick={handleConfirmDestructive}
            >
              Confirm
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={confirmLoading}
              onClick={() => setDismissedConfirmationAt(messages.length)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
      >
        <div className="flex items-end gap-2">
          <AiChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            placeholder="Ask me to log an expense, check balances…"
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            aria-busy={isLoading || undefined}
            aria-label="Send message"
            className="size-8 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
