"use server";

import { createClient } from "@/lib/supabase/server";
import { isEmailVerified } from "@/lib/auth/verification";
import { isEmailConfigured } from "@/lib/email/env";
import { sendVerificationReminderEmail } from "@/lib/email/send-verification";
import type { ActionResult } from "@/types/finance";

export async function resendVerificationEmail(): Promise<
  ActionResult<{ message: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return { success: false, error: "You must be signed in to resend verification" };
  }

  if (isEmailVerified(user)) {
    return { success: false, error: "Your email is already confirmed" };
  }

  if (!isEmailConfigured()) {
    return {
      success: false,
      error: "Email delivery is not configured yet. Contact support if this persists.",
    };
  }

  const sent = await sendVerificationReminderEmail({ email: user.email });
  if (!sent.ok) {
    return { success: false, error: sent.error };
  }

  return {
    success: true,
    data: { message: "Confirmation email sent. Check your inbox." },
  };
}

export async function resendVerificationEmailForAddress(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { success: false, error: "Please enter your email address." };
  }

  if (!isEmailConfigured()) {
    return {
      success: false,
      error: "Email delivery is not configured yet. Contact support if this persists.",
    };
  }

  const sent = await sendVerificationReminderEmail({ email: normalized });
  if (!sent.ok) {
    return { success: false, error: sent.error };
  }

  return {
    success: true,
    data: { message: "Confirmation email sent. Check your inbox." },
  };
}
