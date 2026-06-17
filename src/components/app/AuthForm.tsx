"use client";

import { signIn, signUp } from "@/actions/auth";
import Link from "next/link";
import { useState } from "react";
import {
  AppButton,
  AppCard,
  AppError,
  AppInput,
} from "@/components/app/ui";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result =
        mode === "login"
          ? await signIn(formData)
          : await signUp(formData);
      if (!result.success) {
        setError(result.error);
      }
    } catch {
      // redirect throws — expected on success
    } finally {
      setPending(false);
    }
  }

  return (
    <AppCard
      title={mode === "login" ? "Welcome back" : "Create your account"}
      description="Private budgeting for student life. Your data stays yours."
    >
      <form action={handleSubmit} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <AppInput
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <AppInput
          label="Password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          placeholder="At least 6 characters"
        />
        {error ? <AppError message={error} /> : null}
        <AppButton type="submit" loading={pending} className="w-full">
          {mode === "login" ? "Sign in" : "Create account"}
        </AppButton>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
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
