"use client";

import { createContext, useContext, useMemo } from "react";
import {
  amountInputLabel,
  type CurrencyCode,
  CURRENCY_SYMBOLS,
} from "@/lib/finance/currency";
import { formatMoney } from "@/types/finance";

type CurrencyContextValue = {
  currency: CurrencyCode;
  symbol: string;
  formatMoney: (cents: number) => string;
  amountLabel: string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  children,
}: {
  currency: CurrencyCode;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({
      currency,
      symbol: CURRENCY_SYMBOLS[currency],
      formatMoney: (cents: number) => formatMoney(cents, currency),
      amountLabel: amountInputLabel(currency),
    }),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
