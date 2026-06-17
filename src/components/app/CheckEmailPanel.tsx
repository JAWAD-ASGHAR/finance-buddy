"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { resendVerificationEmailForAddress } from "@/actions/email";
import { AppButton, AppCard } from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  "Open the email from Finance Buddy in your inbox.",
  "Click the confirmation link in that message.",
  "Sign in and complete the short onboarding to set up your profile.",
];

export function CheckEmailPanel({ email }: { email: string }) {
  const [pending, setPending] = useState(false);

  async function handleResend() {
    setPending(true);

    const result = await resendVerificationEmailForAddress(email);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.data.message);
    }

    setPending(false);
  }

  return (
    <AppCard
      className="shadow-sm [--card-spacing:--spacing(6)]"
      title="Check your email"
      description="We sent a confirmation link to finish creating your account."
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-accent-green/25 bg-accent-green-light/40 px-4 py-3 text-sm text-foreground">
          Confirmation sent to{" "}
          <span className="font-medium">{email}</span>
        </div>

        <ol className="space-y-3 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <p className="text-sm text-muted-foreground">
          Didn&apos;t get it? Check spam, or resend the confirmation email below.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <AppButton
            type="button"
            onClick={handleResend}
            loading={pending}
            className="h-11 w-full"
          >
            Resend confirmation email
          </AppButton>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full uppercase tracking-[0.08em]",
            )}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AppCard>
  );
}
