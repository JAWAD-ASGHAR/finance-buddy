import { createAdminClient } from "@/lib/supabase/admin";
import { authCallbackUrl } from "@/lib/email/templates";
import { sendConfirmationLinkEmail } from "@/lib/email/send-confirmation-link";
import { isEmailConfigured } from "@/lib/email/env";

export async function sendVerificationEmail({
  email,
  password,
  nextPath = "/dashboard",
}: {
  email: string;
  password: string;
  nextPath?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo: authCallbackUrl(nextPath),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const confirmUrl = data.properties?.action_link;
  if (!confirmUrl) {
    return { ok: false, error: "Could not create a confirmation link" };
  }

  return sendConfirmationLinkEmail({ email, confirmUrl });
}

export async function sendVerificationReminderEmail({
  email,
  nextPath = "/dashboard",
}: {
  email: string;
  nextPath?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: authCallbackUrl(nextPath),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const confirmUrl = data.properties?.action_link;
  if (!confirmUrl) {
    return { ok: false, error: "Could not create a confirmation link" };
  }

  return sendConfirmationLinkEmail({ email, confirmUrl });
}
