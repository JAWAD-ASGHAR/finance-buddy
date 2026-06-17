"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function ContactFormSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="inline-flex items-center justify-center gap-2.5 rounded-full bg-dark px-7 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-dark-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : null}
      {pending ? "Sending..." : "Request early access"}
      {!pending ? <ArrowRight size={15} strokeWidth={2.25} aria-hidden /> : null}
    </button>
  );
}
