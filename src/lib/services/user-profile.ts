import { z } from "zod";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/auth/user-preferences";
import {
  COUNTRY_OPTIONS,
  isCurrencyCode,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/finance/currency";
import type { ActionResult, UserPreferences } from "@/types/finance";

const updatePreferencesSchema = z
  .object({
    username: z.string().trim().min(3).max(30).optional(),
    displayName: z.string().trim().min(1).max(80).optional(),
    countryCode: z.string().optional(),
    currencyCode: z.string().optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.displayName !== undefined ||
      data.countryCode !== undefined ||
      data.currencyCode !== undefined,
    { message: "Provide at least one field to update" },
  );

export async function updateUserPreferencesForUser(
  userId: string,
  input: {
    username?: string;
    displayName?: string;
    countryCode?: string;
    currencyCode?: string;
  },
): Promise<ActionResult<UserPreferences>> {
  const parsed = updatePreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid preferences",
    };
  }

  if (
    parsed.data.countryCode !== undefined &&
    !COUNTRY_OPTIONS.some((country) => country.code === parsed.data.countryCode)
  ) {
    return { success: false, error: "Unsupported country code" };
  }

  let currencyCode: CurrencyCode | undefined;
  if (parsed.data.currencyCode !== undefined) {
    if (!isCurrencyCode(parsed.data.currencyCode)) {
      return {
        success: false,
        error: `Unsupported currency. Supported: ${SUPPORTED_CURRENCIES.join(", ")}`,
      };
    }
    currencyCode = parsed.data.currencyCode;
  }

  try {
    const prefs = await updateUserPreferences(userId, {
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      countryCode: parsed.data.countryCode,
      currencyCode,
    });
    return { success: true, data: prefs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function getUserProfileForUser(
  userId: string,
): Promise<UserPreferences | null> {
  return getUserPreferences(userId);
}
