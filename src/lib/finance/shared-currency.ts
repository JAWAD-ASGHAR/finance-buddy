import type {
  Settlement,
  SharedExpenseDetail,
  SharedExpenseSplit,
} from "@/types/shared";
import {
  convertCents,
  type CurrencyCode,
  isCurrencyCode,
} from "@/lib/finance/currency";

function toCurrency(value: string): CurrencyCode {
  return isCurrencyCode(value) ? value : "GBP";
}

function convertSplit(
  split: SharedExpenseSplit,
  from: CurrencyCode,
  to: CurrencyCode,
): SharedExpenseSplit {
  if (from === to) return split;
  return {
    ...split,
    share_cents: convertCents(split.share_cents, from, to),
    paid_cents: convertCents(split.paid_cents, from, to),
  };
}

export function convertSharedExpenseDetailForViewer(
  detail: SharedExpenseDetail,
  viewerCurrency: CurrencyCode,
): SharedExpenseDetail {
  const from = detail.currency_code;
  if (from === viewerCurrency) return detail;

  return {
    ...detail,
    total_cents: convertCents(detail.total_cents, from, viewerCurrency),
    currency_code: viewerCurrency,
    splits: detail.splits.map((split) => convertSplit(split, from, viewerCurrency)),
  };
}

export function convertSharedExpenseDetailsForViewer(
  details: SharedExpenseDetail[],
  viewerCurrency: CurrencyCode,
): SharedExpenseDetail[] {
  return details.map((detail) =>
    convertSharedExpenseDetailForViewer(detail, viewerCurrency),
  );
}

export function convertSettlementForViewer(
  settlement: Settlement,
  viewerCurrency: CurrencyCode,
): Settlement {
  const from = settlement.currency_code;
  if (from === viewerCurrency) return settlement;

  return {
    ...settlement,
    amount_cents: convertCents(settlement.amount_cents, from, viewerCurrency),
    currency_code: viewerCurrency,
  };
}

export function convertSettlementsForViewer(
  settlements: Settlement[],
  viewerCurrency: CurrencyCode,
): Settlement[] {
  return settlements.map((settlement) =>
    convertSettlementForViewer(settlement, viewerCurrency),
  );
}

export function convertRawSharedExpenseRow(
  row: {
    totalCents: number;
    currencyCode: string;
  },
  viewerCurrency: CurrencyCode,
): { total_cents: number; currency_code: CurrencyCode } {
  const from = toCurrency(row.currencyCode);
  return {
    total_cents: convertCents(row.totalCents, from, viewerCurrency),
    currency_code: viewerCurrency,
  };
}
