import type { User } from "@supabase/supabase-js";

export function isEmailVerified(user: Pick<User, "email_confirmed_at">): boolean {
  return Boolean(user.email_confirmed_at);
}

export function isEmailNotConfirmedError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed") ||
    lower.includes("email address is not confirmed") ||
    lower.includes("email not verified")
  );
}
