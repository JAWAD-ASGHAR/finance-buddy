"use client";

import { signOut } from "@/actions/auth";
import type { AppSession } from "@/types/app-session";
import { getAccountInitials } from "@/lib/auth/email";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AppAccountMenu({ session }: { session: AppSession }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = getAccountInitials(session.displayName, session.email);

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

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2 transition-colors hover:bg-muted",
          open && "bg-muted",
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-accent-green-light text-xs font-semibold text-accent-green">
          {initials}
        </span>
        <span className="hidden max-w-[10rem] truncate text-left sm:block">
          <span className="block text-xs font-medium text-foreground">
            {session.displayName}
          </span>
          <span className="block truncate text-[0.625rem] text-muted-foreground">
            {session.email}
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        >
          <div className="border-b border-border px-3 py-3 sm:hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {session.displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session.email}
            </p>
          </div>

          <div className="p-1">
            <form
              action={async () => {
                setSigningOut(true);
                try {
                  await signOut();
                } catch {
                  // redirect throws — expected on success
                } finally {
                  setSigningOut(false);
                }
              }}
            >
              <button
                type="submit"
                role="menuitem"
                disabled={signingOut}
                aria-busy={signingOut || undefined}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
