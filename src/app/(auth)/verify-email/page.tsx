import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/app/SignOutButton";
import { VerifyEmailPanel } from "@/components/app/VerifyEmailPanel";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { isEmailVerified } from "@/lib/auth/verification";
import { getAuthUser } from "@/lib/supabase/server";

export default async function VerifyEmailPage() {
  const user = await getAuthUser();
  if (!user?.email) {
    redirect("/login?next=/verify-email");
  }

  if (isEmailVerified(user)) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <BrandLogo href="/verify-email" variant="compact" />
        <SignOutButton variant="outline" />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="mb-10 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Almost there</p>
        </div>
        <div className="w-full max-w-md">
          <VerifyEmailPanel email={user.email} />
        </div>
      </div>
    </div>
  );
}
