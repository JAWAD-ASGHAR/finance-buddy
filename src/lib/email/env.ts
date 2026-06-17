export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim() || undefined;
}

export function requireResendApiKey(): string {
  const key = getResendApiKey();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return key;
}

export function getEmailFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Finance Buddy <onboarding@resend.dev>"
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey());
}

/** When true, new signups must verify email before using the app. Off by default. */
export function isEmailVerificationRequired(): boolean {
  return process.env.EMAIL_VERIFICATION_REQUIRED === "true";
}
