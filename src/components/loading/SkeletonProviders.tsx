"use client";

import { CurrencyProvider } from "@/components/app/CurrencyProvider";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";

export function SkeletonProviders({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider currency={DEFAULT_CURRENCY}>{children}</CurrencyProvider>
  );
}

export function SkeletonFixtureShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
