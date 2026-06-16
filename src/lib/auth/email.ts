import { z } from "zod";

const emailSchema = z.string().email("Enter a valid email address");

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function parseEmail(
  raw: unknown,
): { ok: true; email: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "Email is required" };
  }

  const email = normalizeEmail(raw);
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Enter a valid email address",
    };
  }

  return { ok: true, email: result.data };
}

export function displayNameFromEmail(email: string): string {
  return email.split("@")[0] ?? email;
}

export function getAccountInitials(displayName: string, email: string): string {
  const source = displayName.trim() || email;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
