export function getSmtpHost(): string {
  return process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
}

export function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT?.trim();
  if (!raw) {
    return 587;
  }
  const port = Number.parseInt(raw, 10);
  return Number.isFinite(port) ? port : 587;
}

export function getSmtpUser(): string | undefined {
  return process.env.SMTP_USER?.trim() || undefined;
}

export function getSmtpPass(): string | undefined {
  return process.env.SMTP_PASS?.trim() || undefined;
}

export function getEmailFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) {
    return from;
  }

  const user = getSmtpUser();
  if (user) {
    return `Finance Buddy <${user}>`;
  }

  return "Finance Buddy <connect.jawadasghar@gmail.com>";
}

export function isEmailConfigured(): boolean {
  return Boolean(getSmtpUser() && getSmtpPass());
}

export function getContactInboxEmail(): string {
  return (
    process.env.CONTACT_INBOX_EMAIL?.trim() || "connect.jawadasghar@gmail.com"
  );
}

/** New signups must verify email before using the app. */
export function isEmailVerificationRequired(): boolean {
  return true;
}
