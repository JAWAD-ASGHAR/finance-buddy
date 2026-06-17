import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/app/SignOutButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getAppSession } from "@/lib/auth/session";
import { isEmailVerified } from "@/lib/auth/verification";
import { isEmailVerificationRequired } from "@/lib/email/env";
import { getAuthUser } from "@/lib/supabase/server";

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40 pt-[env(safe-area-inset-top,0px)]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <BrandLogo href="/onboarding" variant="compact" />
        <SignOutButton variant="outline" />
      </header>
      <main className="flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:px-8">
        <div className="container-app">{children}</div>
      </main>
    </div>
  );
}

async function OnboardingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAppSession();
  if (!session) {
    redirect("/login?next=/onboarding");
  }

  if (isEmailVerificationRequired()) {
    const user = await getAuthUser();
    if (user && !isEmailVerified(user)) {
      redirect("/verify-email");
    }
  }

  if (session.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <OnboardingShell>{children}</OnboardingShell>;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<OnboardingShell>{children}</OnboardingShell>}>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </Suspense>
  );
}
