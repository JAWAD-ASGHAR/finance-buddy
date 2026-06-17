import { getEmailFromAddress, isEmailConfigured } from "@/lib/email/env";
import { getResendClient } from "@/lib/email/client";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured" };
  }

  const resend = getResendClient();
  if (!resend) {
    return { ok: false, error: "Email is not configured" };
  }

  const { data, error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "Email provider did not return a message id" };
  }

  return { ok: true, id: data.id };
}
