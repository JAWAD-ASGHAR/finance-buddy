"use client";

import { signOut } from "@/actions/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
  variant = "ghost",
}: {
  className?: string;
  variant?: "ghost" | "outline";
}) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async () => {
        setPending(true);
        try {
          await signOut();
        } catch {
          // redirect throws — expected on success
        } finally {
          setPending(false);
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending || undefined}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          variant === "outline"
            ? "border border-border bg-background text-foreground hover:bg-muted"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Sign out
      </button>
    </form>
  );
}
