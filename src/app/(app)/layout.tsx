import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell, AppShellFallback } from "@/components/app/AppShell";
import { getAppSession } from "@/lib/auth/session";
import { refreshExchangeRatesIfStale } from "@/lib/finance/currency";

export const dynamic = "force-dynamic";

async function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, session] = await Promise.all([
    refreshExchangeRatesIfStale(),
    getAppSession(),
  ]);

  if (!session) {
    redirect("/login");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <AppShell session={session}>{children}</AppShell>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellFallback>{children}</AppShellFallback>}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </Suspense>
  );
}
