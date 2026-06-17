import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";

export async function ensureUserProfile(
  userId: string,
  displayName?: string | null,
) {
  const db = getDb();
  await db
    .insert(profiles)
    .values({
      id: userId,
      displayName: displayName ?? null,
    })
    .onConflictDoNothing({ target: profiles.id });
}
