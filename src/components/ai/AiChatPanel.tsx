"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  saveChatSessions,
  setActiveSessionId,
  upsertChatSession,
  type StoredAiChatSession,
} from "@/lib/ai/chat-history";

function AiChatEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">How can I help?</p>
      <ul className="mt-2 list-inside list-disc space-y-1">
        <li>&quot;What&apos;s left in my Food budget?&quot;</li>
        <li>&quot;Log $12.50 lunch at the campus cafe&quot;</li>
        <li>&quot;Split a $60 dinner with Alex&quot;</li>
        <li>&quot;Generate my monthly report&quot;</li>
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
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
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
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">{children}</div>
      <div className="border-t border-border p-4 sm:px-6">
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

export function AiChatPanel() {
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

  return <AiChatPanelInner />;
}

function AiChatPanelInner() {
  const { setOpen } = useAiAssistant();
  const [input, setInput] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [dismissedConfirmationAt, setDismissedConfirmationAt] = useState<
    number | null
  >(null);
  const [sessions, setSessions] = useState<StoredAiChatSession[]>(() =>
    loadChatSessions(),
  );
  const [activeSessionId, setActiveSessionIdState] = useState<string>(() =>
    getOrCreateActiveSession().id,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialSession = useMemo(
    () =>
      loadChatSessions().find((session) => session.id === activeSessionId) ??
      getOrCreateActiveSession(),
    [activeSessionId],
  );

  const refreshSessions = useCallback(() => {
    setSessions(loadChatSessions());
  }, []);

  const handleChatFinish = useCallback(
    ({ messages: finishedMessages }: { messages: UIMessage[] }) => {
      upsertChatSession(activeSessionId, finishedMessages);
      refreshSessions();
    },
    [activeSessionId, refreshSessions],
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

  const pendingConfirmation = useMemo(() => {
    if (dismissedConfirmationAt === messages.length) return null;
    return getConfirmationFromMessages(messages);
  }, [dismissedConfirmationAt, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  const isLoading = status === "streaming" || status === "submitted";

  const switchSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) return;

      upsertChatSession(activeSessionId, messages);
      setActiveSessionId(sessionId);
      setActiveSessionIdState(sessionId);
      refreshSessions();
      setInput("");
    },
    [activeSessionId, messages, refreshSessions],
  );

  const startNewChat = useCallback(() => {
    upsertChatSession(activeSessionId, messages);
    const created = createChatSession();
    saveChatSessions([created, ...loadChatSessions()]);
    setActiveSessionId(created.id);
    setActiveSessionIdState(created.id);
    refreshSessions();
    setInput("");
  }, [activeSessionId, messages, refreshSessions]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

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
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6">
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

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? <AiChatEmptyState /> : null}

        {messages.map((message) => (
          <AiMessageBubble key={message.id} message={message} />
        ))}

        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            Thinking…
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600">{error.message}</p>
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
          <div className="mt-2 flex gap-2">
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
        className="border-t border-border p-4 sm:px-6"
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
