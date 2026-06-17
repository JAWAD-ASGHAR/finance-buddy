import type { CurrencyCode } from "@/lib/finance/currency";

export type AppSession = {
  userId: string;
  email: string;
  displayName: string;
  currencyCode: CurrencyCode;
  countryCode: string | null;
  onboardingCompleted: boolean;
};
