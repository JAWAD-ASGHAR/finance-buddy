"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateUserPreferences } from "@/lib/auth/user-preferences";
import { requireAuthUser } from "@/lib/db/queries";
import {
  COUNTRY_OPTIONS,
  SUPPORTED_CURRENCIES,
  currencyForCountry,
  isCurrencyCode,
} from "@/lib/finance/currency";
import type { ActionResult, UserPreferences } from "@/types/finance";

const preferencesSchema = z.object({
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

export async function saveUserPreferences(input: {
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

  if (!isCurrencyCode(parsed.data.currencyCode)) {
    return { success: false, error: "Unsupported currency" };
  }

  try {
    const prefs = await updateUserPreferences(user.id, {
      displayName: parsed.data.displayName,
      countryCode: parsed.data.countryCode,
      currencyCode: parsed.data.currencyCode,
      completeOnboarding: input.completeOnboarding ?? false,
    });

    revalidatePath("/", "layout");
    return { success: true, data: prefs };
  } catch {
    return { success: false, error: "Failed to save preferences" };
  }
}

export async function completeOnboarding(input: {
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
