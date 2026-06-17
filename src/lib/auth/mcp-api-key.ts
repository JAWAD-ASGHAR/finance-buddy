import { createHash, randomBytes } from "crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/index";
import { mcpApiKeys } from "@/db/schema";
import { ensureUserProfile } from "@/lib/auth/profile";

export function hashMcpApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateMcpApiKeySecret(): { rawKey: string; prefix: string } {
  const suffix = randomBytes(24).toString("base64url");
  const rawKey = `fb_live_${suffix}`;
  const prefix = rawKey.slice(0, 16);
  return { rawKey, prefix };
}

export async function resolveUserIdFromMcpApiKey(
  authorizationHeader: string | null,
): Promise<string | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const rawKey = authorizationHeader.slice("Bearer ".length).trim();
  if (!rawKey.startsWith("fb_live_")) {
    return null;
  }

  const keyHash = hashMcpApiKey(rawKey);
  const db = getDb();

  const row = await db.query.mcpApiKeys.findFirst({
    where: and(eq(mcpApiKeys.keyHash, keyHash), isNull(mcpApiKeys.revokedAt)),
    columns: { userId: true, id: true },
  });

  if (!row) {
    return null;
  }

  await db
    .update(mcpApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(mcpApiKeys.id, row.id));

  return row.userId;
}

export async function listMcpApiKeysForUser(userId: string) {
  const db = getDb();
  const rows = await db.query.mcpApiKeys.findMany({
    where: and(eq(mcpApiKeys.userId, userId), isNull(mcpApiKeys.revokedAt)),
    orderBy: desc(mcpApiKeys.createdAt),
    columns: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    key_prefix: row.keyPrefix,
    created_at: row.createdAt.toISOString(),
    last_used_at: row.lastUsedAt?.toISOString() ?? null,
  }));
}

export async function createMcpApiKeyForUser(
  userId: string,
  name: string,
  displayName?: string | null,
) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false as const, error: "Enter a key name" };
  }

  await ensureUserProfile(userId, displayName);

  const { rawKey, prefix } = generateMcpApiKeySecret();
  const db = getDb();

  const [row] = await db
    .insert(mcpApiKeys)
    .values({
      userId,
      name: trimmed,
      keyPrefix: prefix,
      keyHash: hashMcpApiKey(rawKey),
    })
    .returning({ id: mcpApiKeys.id });

  if (!row) {
    return { success: false as const, error: "Failed to create API key" };
  }

  return {
    success: true as const,
    data: {
      id: row.id,
      secret: rawKey,
      key_prefix: prefix,
    },
  };
}

export async function revokeMcpApiKeyForUser(userId: string, keyId: string) {
  const db = getDb();

  const [row] = await db
    .update(mcpApiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(mcpApiKeys.id, keyId),
        eq(mcpApiKeys.userId, userId),
        isNull(mcpApiKeys.revokedAt),
      ),
    )
    .returning({ id: mcpApiKeys.id });

  if (!row) {
    return { success: false as const, error: "API key not found" };
  }

  return { success: true as const, data: undefined };
}
