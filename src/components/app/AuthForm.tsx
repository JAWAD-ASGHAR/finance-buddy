"use client";

import { signIn, signUp } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import { toast } from "sonner";
import { FormSubmitButton } from "@/components/app/FormSubmitButton";
import { PendingFieldset } from "@/components/app/PendingFieldset";
import { AppCard, AppInput } from "@/components/app/ui";

async function loginAction(_prev: null, formData: FormData): Promise<null> {
  const result = await signIn(formData);
  if (!result.success) {
    toast.error(result.error);
  }
  return null;
}

async function signupAction(_prev: null, formData: FormData): Promise<null> {
  const result = await signUp(formData);
  if (!result.success) {
    toast.error(result.error);
  }
  return null;
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const [, formAction] = useActionState(
    mode === "login" ? loginAction : signupAction,
    null,
  );

  return (
    <AppCard
      className="shadow-sm [--card-spacing:--spacing(6)]"
      title={mode === "login" ? "Welcome back" : "Create your account"}
      description="Private budgeting for student life. Your data stays yours."
    >
      <form action={formAction} className="flex flex-col">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <PendingFieldset>
          <div className="flex flex-col gap-6">
            <AppInput
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
            />
            <AppInput
              label="Password"
              name="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              placeholder="At least 6 characters"
              className="h-10"
            />
          </div>
        </PendingFieldset>
        <FormSubmitButton className="mt-10 h-11 w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </FormSubmitButton>
      </form>
      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href="/signup" className="font-medium text-accent-green">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent-green">
              Sign in
            </Link>
          </>
        )}
      </p>
    </AppCard>
  );
}
