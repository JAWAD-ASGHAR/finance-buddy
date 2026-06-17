import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/app/SignOutButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getAppSession } from "@/lib/auth/session";
import { isEmailVerified } from "@/lib/auth/verification";
import { isEmailVerificationRequired } from "@/lib/email/env";
import { getAuthUser } from "@/lib/supabase/server";

export default async function OnboardingLayout({
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

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <BrandLogo href="/onboarding" variant="compact" />
        <SignOutButton variant="outline" />
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
