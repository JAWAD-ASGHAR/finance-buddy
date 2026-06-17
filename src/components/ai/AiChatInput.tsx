"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 32;
const MAX_HEIGHT = 120;

type AiChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function AiChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
  className,
}: AiChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = "auto";
    const nextHeight = Math.min(
      Math.max(element.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT,
    );
    element.style.height = `${nextHeight}px`;
    element.style.overflowY =
      element.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      className={cn(
        "field-sizing-fixed min-h-8 max-h-[7.5rem] resize-none py-1.5 leading-normal",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          onSubmit(event);
        }
      }}
    />
  );
}
