import { redirect } from "next/navigation";
import { CheckEmailPanel } from "@/components/app/CheckEmailPanel";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { parseEmail } from "@/lib/auth/email";
import { getAuthUser } from "@/lib/supabase/server";
import { isEmailVerified } from "@/lib/auth/verification";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: rawEmail } = await searchParams;
  const user = await getAuthUser();

  if (user) {
    if (isEmailVerified(user)) {
      redirect("/dashboard");
    }
    redirect("/verify-email");
  }

  const emailResult = parseEmail(rawEmail ?? "");
  if (!emailResult.ok) {
    redirect("/signup");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] sm:py-16">
      <div className="mb-10 flex flex-col items-center gap-4">
        <BrandLogo href="/" />
        <p className="text-sm text-muted-foreground">Almost there</p>
      </div>
      <div className="w-full max-w-md">
        <CheckEmailPanel email={emailResult.email} />
      </div>
    </div>
  );
}
