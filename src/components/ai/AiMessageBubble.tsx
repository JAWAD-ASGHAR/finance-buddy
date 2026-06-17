"use client";

import { CheckCircle2, Loader2, Wrench } from "lucide-react";
import type { UIMessage } from "ai";
import { AiMarkdown, isConfirmationRequiredPayload } from "@/components/ai/AiMarkdown";
import { cn } from "@/lib/utils";

function formatToolLabel(type: string): string {
  const name = type.startsWith("tool-") ? type.slice(5) : type;
  return name.replace(/_/g, " ");
}

function ToolStatusChip({
  label,
  state,
}: {
  label: string;
  state: string;
}) {
  const isDone =
    state === "output-available" ||
    state === "output-error" ||
    state === "approval-responded";
  const isError = state === "output-error";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
        isError
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          : isDone
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            : "border-border bg-background/70 text-muted-foreground",
      )}
    >
      {isDone ? (
        isError ? (
          <Wrench className="size-3 shrink-0" />
        ) : (
          <CheckCircle2 className="size-3 shrink-0" />
        )
      ) : (
        <Loader2 className="size-3 shrink-0 animate-spin" />
      )}
      <span className="capitalize">{label}</span>
    </div>
  );
}

export function AiMessageBubble({
  message,
}: {
  message: UIMessage;
}) {
  const isUser = message.role === "user";
  const parts = message.parts ?? [];

  const hasVisibleContent = parts.some((part) => {
    if (part.type === "text") {
      return part.text.trim().length > 0;
    }
    if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
      return true;
    }
    return false;
  });

  if (!hasVisibleContent) return null;

  return (
    <div
      className={cn(
        "max-w-[95%] break-words rounded-2xl px-3 py-2",
        isUser
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto bg-muted text-foreground",
      )}
    >
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.type === "text") {
            const text = part.text.trim();
            if (!text || isConfirmationRequiredPayload(text)) return null;

            if (isUser) {
              return (
                <p key={`${message.id}-text-${index}`} className="text-sm whitespace-pre-wrap">
                  {text}
                </p>
              );
            }

            return (
              <AiMarkdown
                key={`${message.id}-text-${index}`}
                content={text}
              />
            );
          }

          if (
            part.type.startsWith("tool-") &&
            "state" in part &&
            typeof part.state === "string"
          ) {
            return (
              <ToolStatusChip
                key={`${message.id}-tool-${index}`}
                label={formatToolLabel(part.type)}
                state={part.state}
              />
            );
          }

          if (part.type === "dynamic-tool" && "state" in part) {
            const toolPart = part as {
              type: "dynamic-tool";
              toolName: string;
              state: string;
            };
            return (
              <ToolStatusChip
                key={`${message.id}-dtool-${index}`}
                label={formatToolLabel(toolPart.toolName)}
                state={toolPart.state}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export function getConfirmationFromMessages(messages: UIMessage[]) {
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  if (!lastAssistant) return null;

  for (const part of lastAssistant.parts) {
    if (part.type !== "text") continue;
    try {
      const parsed = JSON.parse(part.text) as {
        status?: string;
        tool?: string;
        description?: string;
      };
      if (parsed.status === "confirmation_required" && parsed.tool) {
        return {
          toolName: parsed.tool,
          payload: {} as Record<string, unknown>,
          description: parsed.description ?? "Confirm this action",
        };
      }
    } catch {
      // not JSON
    }
  }

  return null;
}
