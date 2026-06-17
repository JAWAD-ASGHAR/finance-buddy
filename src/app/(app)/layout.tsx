import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { getAppSession } from "@/lib/auth/session";
import { refreshExchangeRatesIfStale } from "@/lib/finance/currency";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await refreshExchangeRatesIfStale();

  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <AppShell session={session}>{children}</AppShell>;
}
