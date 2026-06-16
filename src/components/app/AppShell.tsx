"use client";

import { useState } from "react";
import {
  AppSidebar,
  AppSidebarMobileTrigger,
} from "@/components/app/AppSidebar";
import { AppAccountMenu } from "@/components/app/AppAccountMenu";
import type { AppSession } from "@/types/app-session";

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AppSession;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-6 lg:justify-end">
          <AppSidebarMobileTrigger
            open={mobileNavOpen}
            onToggle={() => setMobileNavOpen((current) => !current)}
          />
          <AppAccountMenu session={session} />
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
