import { getSmtpTransporter } from "@/lib/email/client";
import { getEmailFromAddress, isEmailConfigured } from "@/lib/email/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email is not configured" };
  }

  const transporter = getSmtpTransporter();
  if (!transporter) {
    return { ok: false, error: "Email is not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: getEmailFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });

    if (!info.messageId) {
      return { ok: false, error: "Email provider did not return a message id" };
    }

    return { ok: true, id: info.messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    return { ok: false, error: message };
  }
}
