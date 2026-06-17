import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { profiles } from "@/db/schema";
import {
  DEFAULT_CURRENCY,
  type CurrencyCode,
  isCurrencyCode,
} from "@/lib/finance/currency";
import type { UserPreferences } from "@/types/finance";

function mapPreferences(row: {
  displayName: string | null;
  currencyCode: string;
  countryCode: string | null;
  onboardingCompletedAt: Date | null;
}): UserPreferences {
  return {
    displayName: row.displayName,
    currencyCode: isCurrencyCode(row.currencyCode)
      ? row.currencyCode
      : DEFAULT_CURRENCY,
    countryCode: row.countryCode,
    onboardingCompleted: row.onboardingCompletedAt !== null,
  };
}

export async function getUserPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  const db = getDb();
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: {
      displayName: true,
      currencyCode: true,
      countryCode: true,
      onboardingCompletedAt: true,
    },
  });

  if (!row) return null;
  return mapPreferences(row);
}

export async function getUserCurrency(userId: string): Promise<CurrencyCode> {
  const prefs = await getUserPreferences(userId);
  return prefs?.currencyCode ?? DEFAULT_CURRENCY;
}

export async function updateUserPreferences(
  userId: string,
  input: {
    displayName?: string;
    currencyCode?: CurrencyCode;
    countryCode?: string | null;
    completeOnboarding?: boolean;
  },
): Promise<UserPreferences> {
  const db = getDb();
  const updates: Partial<typeof profiles.$inferInsert> = {};

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
      displayName: profiles.displayName,
      currencyCode: profiles.currencyCode,
      countryCode: profiles.countryCode,
      onboardingCompletedAt: profiles.onboardingCompletedAt,
    });

  if (!row) {
    throw new Error("Profile not found");
  }

  return mapPreferences(row);
}
