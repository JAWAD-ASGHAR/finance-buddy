"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  checkUsernameAvailable,
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
import { normalizeUsername } from "@/lib/auth/username";
import type { UserPreferences } from "@/types/finance";

export function UserPreferencesForm({
  initial,
  mode,
}: {
  initial: UserPreferences & { displayName: string; username?: string | null };
  mode: "onboarding" | "settings";
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username ?? "");
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [countryCode, setCountryCode] = useState(initial.countryCode ?? "GB");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(
    initial.currencyCode,
  );
  const [pending, setPending] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  useEffect(() => {
    const suggested = currencyForCountry(countryCode);
    if (suggested) {
      setCurrencyCode(suggested);
    }
  }, [countryCode]);

  useEffect(() => {
    const normalized = normalizeUsername(username);
    if (normalized.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    if (normalized === initial.username) {
      setUsernameStatus("available");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const result = await checkUsernameAvailable(normalized);
      if (!result.success) {
        setUsernameStatus("invalid");
        return;
      }
      setUsernameStatus(result.data.available ? "available" : "taken");
    }, 350);

    return () => clearTimeout(timer);
  }, [username, initial.username]);

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

    const payload = {
      username: normalizeUsername(username),
      displayName,
      countryCode,
      currencyCode,
    };
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

    toast.success("Profile saved");
    router.refresh();
    setPending(false);
  }

  const usernameHint =
    usernameStatus === "checking"
      ? "Checking availability…"
      : usernameStatus === "available"
        ? "Username is available"
        : usernameStatus === "taken"
          ? "That username is taken"
          : usernameStatus === "invalid"
            ? "Use 3–30 lowercase letters, numbers, or underscores"
            : "Friends can find you with this username";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <AppInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="alex_chen"
          autoComplete="username"
          required
        />
        <p
          className={`text-xs ${
            usernameStatus === "taken" || usernameStatus === "invalid"
              ? "text-destructive"
              : usernameStatus === "available"
                ? "text-accent-green"
                : "text-muted-foreground"
          }`}
        >
          {usernameHint}
        </p>
      </div>

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
          Your username is unique and lets friends find you to split bills. Your
          budget and expenses use your chosen currency.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Changing currency updates how amounts are displayed. Existing budget
          numbers stay as entered — shared expenses use live exchange rates when
          converting between currencies.
        </p>
      )}

      <AppButton
        type="submit"
        loading={pending}
        disabled={
          usernameStatus === "taken" ||
          usernameStatus === "invalid" ||
          usernameStatus === "checking"
        }
      >
        {mode === "onboarding" ? "Continue to dashboard" : "Save profile"}
      </AppButton>
    </form>
  );
}

export function UserPreferencesPanel({
  initial,
}: {
  initial: UserPreferences & { displayName: string; username?: string | null };
}) {
  return (
    <AppCard
      title="Profile & currency"
      description="Your username, name, location, and preferred currency."
    >
      <UserPreferencesForm initial={initial} mode="settings" />
    </AppCard>
  );
}
