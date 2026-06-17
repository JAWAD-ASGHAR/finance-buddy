"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  completeOnboarding,
  saveUserPreferences,
  suggestCurrencyForCountry,
} from "@/actions/profile";
import {
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
} from "@/components/app/ui";
import {
  COUNTRY_OPTIONS,
  CURRENCY_LABELS,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
  currencyForCountry,
} from "@/lib/finance/currency";
import type { UserPreferences } from "@/types/finance";

export function UserPreferencesForm({
  initial,
  mode,
}: {
  initial: UserPreferences & { displayName: string };
  mode: "onboarding" | "settings";
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? "GB");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(
    initial.currencyCode,
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const suggested = currencyForCountry(countryCode);
    if (suggested) {
      setCurrencyCode(suggested);
    }
  }, [countryCode]);

  async function handleCountryChange(code: string) {
    setCountryCode(code);
    const suggested = await suggestCurrencyForCountry(code);
    if (suggested && SUPPORTED_CURRENCIES.includes(suggested as CurrencyCode)) {
      setCurrencyCode(suggested as CurrencyCode);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const payload = { displayName, countryCode, currencyCode };
    const result =
      mode === "onboarding"
        ? await completeOnboarding(payload)
        : await saveUserPreferences(payload);

    if (!result.success) {
      toast.error(result.error);
      setPending(false);
      return;
    }

    if (mode === "onboarding") {
      router.push("/dashboard");
      return;
    }

    toast.success("Preferences saved");

    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AppInput
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="How friends see you"
        required
      />

      <AppSelect
        label="Country / region"
        value={countryCode}
        onChange={(e) => void handleCountryChange(e.target.value)}
      >
        {COUNTRY_OPTIONS.map((country) => (
          <option key={country.code} value={country.code}>
            {country.label}
          </option>
        ))}
      </AppSelect>

      <AppSelect
        label="Preferred currency"
        value={currencyCode}
        onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {CURRENCY_LABELS[code]}
          </option>
        ))}
      </AppSelect>

      {mode === "onboarding" ? (
        <p className="text-sm text-muted-foreground">
          Your budget and expenses use this currency. Shared bills with friends
          are converted to your currency automatically when amounts differ.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Changing currency updates how amounts are displayed. Existing budget
          numbers stay as entered — only shared expenses are converted using
          approximate exchange rates.
        </p>
      )}

      <AppButton type="submit" loading={pending}>
        {mode === "onboarding" ? "Continue to dashboard" : "Save preferences"}
      </AppButton>
    </form>
  );
}

export function UserPreferencesPanel({
  initial,
}: {
  initial: UserPreferences & { displayName: string };
}) {
  return (
    <AppCard
      title="Profile & currency"
      description="Your name, location, and preferred currency for budgets and shared expenses."
    >
      <UserPreferencesForm initial={initial} mode="settings" />
    </AppCard>
  );
}
