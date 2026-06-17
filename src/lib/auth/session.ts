import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";
import { displayNameFromEmail } from "@/lib/auth/email";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getAuthUser } from "@/lib/supabase/server";
import type { AppSession } from "@/types/app-session";

export type { AppSession };

export async function getAppSession(): Promise<AppSession | null> {
  const user = await getAuthUser();
  if (!user?.email) {
    return null;
  }

  const db = getDb();
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { displayName: true },
  });

  const metaDisplayName = user.user_metadata?.display_name;
  const displayName =
    profile?.displayName ??
    (typeof metaDisplayName === "string" && metaDisplayName
      ? metaDisplayName
      : displayNameFromEmail(user.email));

  if (!profile) {
    await ensureUserProfile(user.id, displayName);
  }

  return {
    email: user.email,
    displayName,
  };
}
