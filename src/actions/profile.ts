"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  isUsernameTaken,
  updateUserPreferences,
} from "@/lib/auth/user-preferences";
import { parseUsername } from "@/lib/auth/username";
import { requireAuthUser } from "@/lib/db/queries";
import {
  COUNTRY_OPTIONS,
  SUPPORTED_CURRENCIES,
  currencyForCountry,
  isCurrencyCode,
} from "@/lib/finance/currency";
import type { ActionResult, UserPreferences } from "@/types/finance";

const preferencesSchema = z.object({
  username: z.string().trim().min(1, "Choose a username"),
  displayName: z.string().trim().min(1, "Enter your name").max(80),
  countryCode: z
    .string()
    .refine(
      (code) => COUNTRY_OPTIONS.some((country) => country.code === code),
      "Choose a country",
    ),
  currencyCode: z.enum(SUPPORTED_CURRENCIES),
});

export async function getCurrentUserPreferences(): Promise<UserPreferences | null> {
  const user = await requireAuthUser();
  const { getUserPreferences } = await import("@/lib/auth/user-preferences");
  return getUserPreferences(user.id);
}

export async function checkUsernameAvailable(
  rawUsername: string,
): Promise<ActionResult<{ available: boolean }>> {
  const user = await requireAuthUser();
  const parsed = parseUsername(rawUsername);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const taken = await isUsernameTaken(parsed.username, user.id);
  return { success: true, data: { available: !taken } };
}

export async function saveUserPreferences(input: {
  username: string;
  displayName: string;
  countryCode: string;
  currencyCode: string;
  completeOnboarding?: boolean;
}): Promise<ActionResult<UserPreferences>> {
  const user = await requireAuthUser();

  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const usernameParsed = parseUsername(parsed.data.username);
  if (!usernameParsed.ok) {
    return { success: false, error: usernameParsed.error };
  }

  if (!isCurrencyCode(parsed.data.currencyCode)) {
    return { success: false, error: "Unsupported currency" };
  }

  try {
    const prefs = await updateUserPreferences(user.id, {
      username: usernameParsed.username,
      displayName: parsed.data.displayName,
      countryCode: parsed.data.countryCode,
      currencyCode: parsed.data.currencyCode,
      completeOnboarding: input.completeOnboarding ?? false,
    });

    revalidatePath("/", "layout");
    return { success: true, data: prefs };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save preferences";
    return { success: false, error: message };
  }
}

export async function completeOnboarding(input: {
  username: string;
  displayName: string;
  countryCode: string;
  currencyCode: string;
}): Promise<ActionResult<UserPreferences>> {
  return saveUserPreferences({ ...input, completeOnboarding: true });
}

export async function suggestCurrencyForCountry(
  countryCode: string,
): Promise<string | null> {
  return currencyForCountry(countryCode);
}
