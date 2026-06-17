export const SUPPORTED_CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "CAD",
  "AUD",
  "PKR",
  "INR",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "GBP";

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  GBP: "British pound (£)",
  USD: "US dollar ($)",
  EUR: "Euro (€)",
  CAD: "Canadian dollar (C$)",
  AUD: "Australian dollar (A$)",
  PKR: "Pakistani rupee (Rs)",
  INR: "Indian rupee (₹)",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
  PKR: "Rs",
  INR: "₹",
};

export const COUNTRY_OPTIONS = [
  { code: "GB", label: "United Kingdom", currency: "GBP" as CurrencyCode },
  { code: "US", label: "United States", currency: "USD" as CurrencyCode },
  { code: "CA", label: "Canada", currency: "CAD" as CurrencyCode },
  { code: "AU", label: "Australia", currency: "AUD" as CurrencyCode },
  { code: "PK", label: "Pakistan", currency: "PKR" as CurrencyCode },
  { code: "IN", label: "India", currency: "INR" as CurrencyCode },
  { code: "DE", label: "Germany", currency: "EUR" as CurrencyCode },
  { code: "FR", label: "France", currency: "EUR" as CurrencyCode },
  { code: "ES", label: "Spain", currency: "EUR" as CurrencyCode },
  { code: "IT", label: "Italy", currency: "EUR" as CurrencyCode },
  { code: "NL", label: "Netherlands", currency: "EUR" as CurrencyCode },
  { code: "IE", label: "Ireland", currency: "EUR" as CurrencyCode },
] as const;

export const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  GBP: "en-GB",
  USD: "en-US",
  EUR: "de-DE",
  CAD: "en-CA",
  AUD: "en-AU",
  PKR: "en-PK",
  INR: "en-IN",
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function currencyForCountry(countryCode: string): CurrencyCode | null {
  const match = COUNTRY_OPTIONS.find((c) => c.code === countryCode);
  return match?.currency ?? null;
}

export function amountInputLabel(currency: CurrencyCode): string {
  return `Amount (${CURRENCY_SYMBOLS[currency]})`;
}
