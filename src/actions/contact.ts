"use server";

import { sendContactMessage } from "@/lib/email/send-contact-message";
import type { ActionResult } from "@/types/finance";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactForm(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const university = readField(formData, "university");
  const year = readField(formData, "year");
  const feature = readField(formData, "feature");
  const message = readField(formData, "message");

  if (!name) {
    return { success: false, error: "Please enter your name." };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const sent = await sendContactMessage({
    name,
    email,
    university,
    year,
    feature,
    message,
  });

  if (!sent.ok) {
    return { success: false, error: sent.error };
  }

  return {
    success: true,
    data: {
      message: "Thanks — your message was sent. We'll get back to you soon.",
    },
  };
}
