import { redirect } from "next/navigation";
import { VerifyEmailPanel } from "@/components/app/VerifyEmailPanel";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { isEmailVerified } from "@/lib/auth/verification";
import { getAuthUser } from "@/lib/supabase/server";

export default async function VerifyEmailPage() {
  const user = await getAuthUser();
  if (!user?.email) {
    redirect("/login?next=/verify-email");
  }

  const verified = isEmailVerified(user);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12 sm:py-16">
      <div className="mb-10 flex flex-col items-center gap-4">
        <BrandLogo href="/" />
        <p className="text-sm text-muted-foreground">
          {verified ? "You're verified" : "Almost there"}
        </p>
      </div>
      <div className="w-full max-w-md">
        <VerifyEmailPanel email={user.email} verified={verified} />
      </div>
    </div>
  );
}
