import {
  DEFAULT_CURRENCY,
  LOCALE_BY_CURRENCY,
  type CurrencyCode,
} from "@/lib/finance/currency-codes";
import { getUsdPerUnit } from "@/lib/finance/exchange-rates";

export {
  amountInputLabel,
  COUNTRY_OPTIONS,
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  currencyForCountry,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  LOCALE_BY_CURRENCY,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/finance/currency-codes";

export {
  getExchangeRateMeta,
  refreshExchangeRatesIfStale,
} from "@/lib/finance/exchange-rates";

export function convertCents(
  cents: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return cents;
  const usd = (cents / 100) * getUsdPerUnit(from);
  return Math.round((usd / getUsdPerUnit(to)) * 100);
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
  return value
    .replace(/[£$€₹,\s]/g, "")
    .replace(/^Rs\.?/i, "")
    .replace(/^C(?=\d)/, "")
    .replace(/^A(?=\d)/, "");
}
