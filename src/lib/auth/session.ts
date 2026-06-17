import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";
import { displayNameFromEmail } from "@/lib/auth/email";
import { ensureUserProfile } from "@/lib/auth/profile";
import { getUserPreferences } from "@/lib/auth/user-preferences";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";
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
    columns: {
      username: true,
      displayName: true,
      currencyCode: true,
      countryCode: true,
      onboardingCompletedAt: true,
    },
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

  const prefs = (await getUserPreferences(user.id)) ?? {
    username: profile?.username ?? null,
    displayName,
    currencyCode: DEFAULT_CURRENCY,
    countryCode: null,
    onboardingCompleted: false,
  };

  return {
    userId: user.id,
    email: user.email,
    username: prefs.username,
    displayName: prefs.displayName ?? displayName,
    currencyCode: prefs.currencyCode,
    countryCode: prefs.countryCode,
    onboardingCompleted: prefs.onboardingCompleted,
  };
}
