import { z } from "zod";

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;

const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `Username must be at least ${USERNAME_MIN} characters`)
  .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters`)
  .regex(
    /^[a-z0-9][a-z0-9_]*$/,
    "Use lowercase letters, numbers, and underscores only",
  );

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

export function parseUsername(
  raw: unknown,
): { ok: true; username: string } | { ok: false; error: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "Username is required" };
  }

  const username = normalizeUsername(raw);
  const result = usernameSchema.safeParse(username);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid username",
    };
  }

  return { ok: true, username: result.data };
}

export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  const sanitized = local.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (sanitized.length >= USERNAME_MIN) {
    return sanitized.slice(0, USERNAME_MAX);
  }
  return `user_${sanitized || "x"}`.slice(0, USERNAME_MAX);
}
