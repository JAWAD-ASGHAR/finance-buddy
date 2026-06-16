"use server";

import {
  createMcpApiKeyForUser,
  listMcpApiKeysForUser,
  revokeMcpApiKeyForUser,
} from "@/lib/auth/mcp-api-key";
import { requireAuthUser } from "@/lib/db/queries";
import type { ActionResult } from "@/types/finance";

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
  return createMcpApiKeyForUser(user.id, input.name);
}

export async function revokeMcpApiKey(
  keyId: string,
): Promise<ActionResult<void>> {
  const user = await requireAuthUser();
  return revokeMcpApiKeyForUser(user.id, keyId);
}
