import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AppCard } from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <BrandLogo href="/" />
      </div>
      <div className="w-full max-w-md">
        <AppCard
          title="Link expired or invalid"
          description="That confirmation link may have expired or already been used."
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in and request a fresh confirmation email from the verify email
              page.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className={cn(
                  buttonVariants(),
                  "h-10 w-full uppercase tracking-[0.08em] sm:w-auto",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/verify-email"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 w-full uppercase tracking-[0.08em] sm:w-auto",
                )}
              >
                Verify email
              </Link>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
