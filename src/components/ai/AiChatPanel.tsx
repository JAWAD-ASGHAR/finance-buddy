"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PendingConfirmation = {
  toolName: string;
  payload: Record<string, unknown>;
  description: string;
};

function extractTextParts(message: {
  parts?: Array<{ type: string; text?: string }>;
}): string {
  if (!message.parts) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function AiChatPanel() {
  const { setOpen } = useAiAssistant();
  const [input, setInput] = useState("");
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");

    if (!lastAssistant) return;

    const text = extractTextParts(lastAssistant);
    if (!text.includes("confirmation_required")) return;

    try {
      const parsed = JSON.parse(text) as {
        status?: string;
        tool?: string;
        description?: string;
      };
      if (parsed.status === "confirmation_required" && parsed.tool) {
        setPendingConfirmation({
          toolName: parsed.tool,
          payload: {},
          description: parsed.description ?? "Confirm this action",
        });
      }
    } catch {
      // not JSON — ignore
    }
  }, [messages]);

  const isLoading = status === "streaming" || status === "submitted";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setPendingConfirmation(null);
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

      setPendingConfirmation(null);
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
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Finance Buddy AI</p>
          <p className="text-xs text-muted-foreground">
            Budgets, expenses, friends & more
          </p>
        </div>
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

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How can I help?</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Add an expense from plain language</li>
              <li>Check your remaining budget</li>
              <li>Split a bill with a friend</li>
              <li>Generate your monthly report</li>
            </ul>
          </div>
        ) : null}

        {messages.map((message) => {
          const text = extractTextParts(message);
          if (!text) return null;

          return (
            <div
              key={message.id}
              className={cn(
                "max-w-[95%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground",
              )}
            >
              {text}
            </div>
          );
        })}

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
              onClick={() => setPendingConfirmation(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-4"
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me to log an expense, check balances…"
            rows={2}
            className="min-h-[3rem] resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit(event);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="shrink-0 self-end"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
