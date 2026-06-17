"use client";

import Link from "next/link";
import { useState } from "react";
import { resendVerificationEmail } from "@/actions/email";
import {
  AppButton,
  AppCard,
  AppError,
} from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VerifyEmailPanel({
  email,
  verified,
  verificationRequired,
}: {
  email: string;
  verified: boolean;
  verificationRequired: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleResend() {
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await resendVerificationEmail();
    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(result.data.message);
    }

    setPending(false);
  }

  if (verified) {
    return (
      <AppCard
        title="Email confirmed"
        description="Your email address is verified. You're all set."
      >
        <Link
          href="/dashboard"
          className={cn(buttonVariants(), "h-10 w-full uppercase tracking-[0.08em]")}
        >
          Go to dashboard
        </Link>
      </AppCard>
    );
  }

  return (
    <AppCard
      title="Confirm your email"
      description={
        verificationRequired
          ? "We sent a confirmation link to finish setting up your account."
          : "You can keep using Finance Buddy while you confirm your email."
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Check <span className="font-medium text-foreground">{email}</span> for a
          message from Finance Buddy and click the confirmation link.
        </p>
        {error ? <AppError message={error} /> : null}
        {success ? (
          <p className="text-sm text-accent-green">{success}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          <AppButton
            type="button"
            onClick={handleResend}
            loading={pending}
            className="w-full"
          >
            Resend confirmation email
          </AppButton>
          {!verificationRequired ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full uppercase tracking-[0.08em]",
              )}
            >
              Continue to dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </AppCard>
  );
}
