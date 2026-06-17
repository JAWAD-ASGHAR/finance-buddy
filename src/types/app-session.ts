import type { CurrencyCode } from "@/lib/finance/currency";

export type AppSession = {
  email: string;
  displayName: string;
  currencyCode: CurrencyCode;
  countryCode: string | null;
  onboardingCompleted: boolean;
};
