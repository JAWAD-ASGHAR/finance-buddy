import { getContactInboxEmail, isEmailConfigured } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/send";
import { contactFormEmailHtml } from "@/lib/email/templates";

export type ContactMessageInput = {
  name: string;
  email: string;
  university: string;
  year: string;
  feature: string;
  message: string;
};

export async function sendContactMessage(
  input: ContactMessageInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEmailConfigured()) {
    return {
      ok: false,
      error:
        "Email delivery is not configured yet. Please email us directly instead.",
    };
  }

  const html = contactFormEmailHtml(input);
  const text = [
    `New contact form submission from ${input.name}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    input.university ? `University: ${input.university}` : null,
    input.year ? `Year: ${input.year}` : null,
    input.feature ? `Interest: ${input.feature}` : null,
    input.message ? `\nMessage:\n${input.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const sent = await sendEmail({
    to: getContactInboxEmail(),
    subject: `Finance Buddy contact: ${input.name}`,
    html,
    text,
    replyTo: input.email,
  });

  if (!sent.ok) {
    return sent;
  }

  return { ok: true };
}
