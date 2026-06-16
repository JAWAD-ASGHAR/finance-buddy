import { createHmac, timingSafeEqual } from "crypto";
import { getConfirmationSecret } from "@/lib/ai/env";

export const DESTRUCTIVE_TOOLS = new Set([
  "delete_expense",
  "delete_shared_expense",
  "delete_all_user_data",
]);

const TOKEN_TTL_MS = 5 * 60 * 1000;

function hashPayload(payload: unknown): string {
  return createHmac("sha256", getConfirmationSecret())
    .update(JSON.stringify(payload))
    .digest("hex");
}

function sign(userId: string, toolName: string, payloadHash: string, expiresAt: number) {
  return createHmac("sha256", getConfirmationSecret())
    .update(`${userId}:${toolName}:${payloadHash}:${expiresAt}`)
    .digest("hex");
}

export function createConfirmationToken(
  userId: string,
  toolName: string,
  payload: unknown,
): string {
  const payloadHash = hashPayload(payload);
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const signature = sign(userId, toolName, payloadHash, expiresAt);
  return Buffer.from(
    JSON.stringify({ toolName, payloadHash, expiresAt, signature }),
  ).toString("base64url");
}

export function validateConfirmationToken(
  userId: string,
  toolName: string,
  payload: unknown,
  token: string | undefined,
): { ok: true } | { ok: false; error: string } {
  if (!token) {
    return {
      ok: false,
      error:
        "This action requires user confirmation. Ask the user to confirm, then call request_destructive_confirmation to obtain a token.",
    };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    ) as {
      toolName: string;
      payloadHash: string;
      expiresAt: number;
      signature: string;
    };

    if (parsed.toolName !== toolName) {
      return { ok: false, error: "Confirmation token does not match this action" };
    }

    if (Date.now() > parsed.expiresAt) {
      return { ok: false, error: "Confirmation token expired — request a new one" };
    }

    const payloadHash = hashPayload(payload);
    if (payloadHash !== parsed.payloadHash) {
      return { ok: false, error: "Confirmation token does not match these parameters" };
    }

    const expected = sign(userId, toolName, payloadHash, parsed.expiresAt);
    const a = Buffer.from(expected);
    const b = Buffer.from(parsed.signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "Invalid confirmation token" };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid confirmation token format" };
  }
}

export function confirmationRequiredMessage(
  toolName: string,
  description: string,
): string {
  return JSON.stringify({
    status: "confirmation_required",
    tool: toolName,
    description,
    message:
      "The user must confirm this action in the chat UI before you retry with a confirmationToken.",
  });
}
