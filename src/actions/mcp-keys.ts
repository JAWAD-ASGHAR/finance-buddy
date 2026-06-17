"use server";

import {
  createMcpApiKeyForUser,
  listMcpApiKeysForUser,
  revokeMcpApiKeyForUser,
} from "@/lib/auth/mcp-api-key";
import { displayNameFromEmail } from "@/lib/auth/email";
import { requireAuthUser } from "@/lib/db/queries";
import type { ActionResult } from "@/types/finance";

function displayNameForUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metaDisplayName = user.user_metadata?.display_name;
  if (typeof metaDisplayName === "string" && metaDisplayName) {
    return metaDisplayName;
  }

  return user.email ? displayNameFromEmail(user.email) : null;
}

export async function listMcpApiKeys() {
  const user = await requireAuthUser();
  const keys = await listMcpApiKeysForUser(user.id);
  return { success: true as const, data: keys };
}

export async function createMcpApiKey(input: {
  name: string;
}): Promise<
  ActionResult<{ id: string; secret: string; key_prefix: string }>
> {
  const user = await requireAuthUser();
  return createMcpApiKeyForUser(
    user.id,
    input.name,
    displayNameForUser(user),
  );
}

export async function revokeMcpApiKey(
  keyId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  return revokeMcpApiKeyForUser(user.id, keyId);
}
