import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";
import {
  DEFAULT_CURRENCY,
  type CurrencyCode,
  isCurrencyCode,
} from "@/lib/finance/currency";
import { normalizeUsername, parseUsername } from "@/lib/auth/username";
import type { UserPreferences } from "@/types/finance";

function mapPreferences(row: {
  username: string | null;
  displayName: string | null;
  currencyCode: string;
  countryCode: string | null;
  onboardingCompletedAt: Date | null;
  avatarPath: string | null;
}): UserPreferences {
  return {
    username: row.username,
    displayName: row.displayName,
    currencyCode: isCurrencyCode(row.currencyCode)
      ? row.currencyCode
      : DEFAULT_CURRENCY,
    countryCode: row.countryCode,
    onboardingCompleted: row.onboardingCompletedAt !== null,
    avatarPath: row.avatarPath,
  };
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const db = getDb();
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: {
      username: true,
      displayName: true,
      currencyCode: true,
      countryCode: true,
      onboardingCompletedAt: true,
      avatarPath: true,
    },
  });

  if (!row) return null;
  return mapPreferences(row);
}

export async function getUserCurrency(userId: string): Promise<CurrencyCode> {
  const prefs = await getUserPreferences(userId);
  return prefs?.currencyCode ?? DEFAULT_CURRENCY;
}

export async function isUsernameTaken(
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  const db = getDb();
  const normalized = normalizeUsername(username);
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.username, normalized),
    columns: { id: true },
  });

  if (!row) return false;
  if (excludeUserId && row.id === excludeUserId) return false;
  return true;
}

export async function updateUserPreferences(
  userId: string,
  input: {
    username?: string;
    displayName?: string;
    currencyCode?: CurrencyCode;
    countryCode?: string | null;
    completeOnboarding?: boolean;
  },
): Promise<UserPreferences> {
  const db = getDb();
  const updates: Partial<typeof profiles.$inferInsert> = {};

  if (input.username !== undefined) {
    const parsed = parseUsername(input.username);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }

    if (await isUsernameTaken(parsed.username, userId)) {
      throw new Error("That username is already taken");
    }

    updates.username = parsed.username;
  }

  if (input.displayName !== undefined) {
    updates.displayName = input.displayName.trim() || null;
  }
  if (input.currencyCode !== undefined) {
    updates.currencyCode = input.currencyCode;
  }
  if (input.countryCode !== undefined) {
    updates.countryCode = input.countryCode;
  }
  if (input.completeOnboarding) {
    updates.onboardingCompletedAt = new Date();
  }

  const [row] = await db
    .update(profiles)
    .set(updates)
    .where(eq(profiles.id, userId))
    .returning({
      username: profiles.username,
      displayName: profiles.displayName,
      currencyCode: profiles.currencyCode,
      countryCode: profiles.countryCode,
      onboardingCompletedAt: profiles.onboardingCompletedAt,
      avatarPath: profiles.avatarPath,
    });

  if (!row) {
    throw new Error("Profile not found");
  }

  return mapPreferences(row);
}
