export const SUPPORTED_CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "CAD",
  "AUD",
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "GBP";

/** Approximate USD value of one unit of each currency (for display conversion). */
const USD_PER_UNIT: Record<CurrencyCode, number> = {
  GBP: 1.27,
  USD: 1,
  EUR: 1.08,
  CAD: 0.74,
  AUD: 0.65,
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  GBP: "British pound (£)",
  USD: "US dollar ($)",
  EUR: "Euro (€)",
  CAD: "Canadian dollar (C$)",
  AUD: "Australian dollar (A$)",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
};

export const COUNTRY_OPTIONS = [
  { code: "GB", label: "United Kingdom", currency: "GBP" as CurrencyCode },
  { code: "US", label: "United States", currency: "USD" as CurrencyCode },
  { code: "CA", label: "Canada", currency: "CAD" as CurrencyCode },
  { code: "AU", label: "Australia", currency: "AUD" as CurrencyCode },
  { code: "DE", label: "Germany", currency: "EUR" as CurrencyCode },
  { code: "FR", label: "France", currency: "EUR" as CurrencyCode },
  { code: "ES", label: "Spain", currency: "EUR" as CurrencyCode },
  { code: "IT", label: "Italy", currency: "EUR" as CurrencyCode },
  { code: "NL", label: "Netherlands", currency: "EUR" as CurrencyCode },
  { code: "IE", label: "Ireland", currency: "EUR" as CurrencyCode },
] as const;

export function amountInputLabel(currency: CurrencyCode): string {
  return `Amount (${CURRENCY_SYMBOLS[currency]})`;
}

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  GBP: "en-GB",
  USD: "en-US",
  EUR: "de-DE",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function currencyForCountry(countryCode: string): CurrencyCode | null {
  const match = COUNTRY_OPTIONS.find((c) => c.code === countryCode);
  return match?.currency ?? null;
}

export function convertCents(
  cents: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return cents;
  const usd = (cents / 100) * USD_PER_UNIT[from];
  return Math.round((usd / USD_PER_UNIT[to]) * 100);
}

export function formatMoneyWithCurrency(
  cents: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function compactCurrencyFormatter(currency: CurrencyCode) {
  const locale = LOCALE_BY_CURRENCY[currency];
  return (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
}

export function stripCurrencySymbols(value: string): string {
  return value.replace(/[£$€,\s]/g, "").replace(/^C(?=\d)/, "").replace(/^A(?=\d)/, "");
}
