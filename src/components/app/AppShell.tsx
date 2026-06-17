"use client";

import { useState } from "react";
import {
  AppSidebar,
  AppSidebarMobileTrigger,
} from "@/components/app/AppSidebar";
import { AppAccountMenu } from "@/components/app/AppAccountMenu";
import { NotificationBell } from "@/components/app/NotificationBell";
import { CurrencyProvider } from "@/components/app/CurrencyProvider";
import { AiAssistantProvider, useAiAssistant } from "@/components/ai/AiAssistantProvider";
import { AiDrawer } from "@/components/ai/AiDrawer";
import { AiHeaderButton } from "@/components/ai/AiHeaderButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { AppSession } from "@/types/app-session";
import { cn } from "@/lib/utils";

function AppShellInner({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AppSession;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { open: aiOpen } = useAiAssistant();

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top,0px)] transition-[margin] duration-300 ease-out motion-reduce:transition-none lg:ml-60",
          aiOpen && "max-sm:overflow-hidden sm:mr-[min(420px,100vw)]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4 sm:px-6">
          <AppSidebarMobileTrigger
            open={mobileNavOpen}
            onToggle={() => setMobileNavOpen((current) => !current)}
          />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <AiHeaderButton />
            <ThemeToggle />
            <AppAccountMenu session={session} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:px-8">
          <div className="container-app">{children}</div>
        </main>
      </div>

      <AiDrawer userId={session.userId} />
    </div>
  );
}

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AppSession;
}) {
  return (
    <CurrencyProvider currency={session.currencyCode}>
      <AiAssistantProvider>
        <AppShellInner session={session}>{children}</AppShellInner>
      </AiAssistantProvider>
    </CurrencyProvider>
  );
}

function AppShellHeaderFallback({
  mobileNavOpen,
  onMobileNavOpenChange,
}: {
  mobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4 sm:px-6">
      <AppSidebarMobileTrigger
        open={mobileNavOpen}
        onToggle={() => onMobileNavOpenChange(!mobileNavOpen)}
      />
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="size-9 animate-pulse rounded-md bg-border" aria-hidden />
        <div className="size-9 animate-pulse rounded-md bg-border" aria-hidden />
        <div className="size-9 animate-pulse rounded-md bg-border" aria-hidden />
        <div className="h-9 w-9 animate-pulse rounded-full bg-border" aria-hidden />
      </div>
    </header>
  );
}

export function AppShellFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top,0px)] lg:ml-60">
        <AppShellHeaderFallback
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpenChange={setMobileNavOpen}
        />

        <main className="flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:px-8">
          <div className="container-app">{children}</div>
        </main>
      </div>
    </div>
  );
}
