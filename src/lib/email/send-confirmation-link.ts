import { verificationEmailHtml } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { isEmailConfigured } from "@/lib/email/env";

export async function sendConfirmationLinkEmail({
  email,
  confirmUrl,
}: {
  email: string;
  confirmUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured" };
  }

  const html = verificationEmailHtml({ confirmUrl });
  const sent = await sendEmail({
    to: email,
    subject: "Confirm your Finance Buddy email",
    html,
    text: `Confirm your email to finish signing up: ${confirmUrl}`,
  });

  if (!sent.ok) {
    return sent;
  }

  return { ok: true };
}
