import {
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/finance/currency-codes";

/** USD value of one unit of each currency — updated from API when available. */
export const FALLBACK_USD_PER_UNIT: Record<CurrencyCode, number> = {
  GBP: 1.27,
  USD: 1,
  EUR: 1.08,
  CAD: 0.74,
  AUD: 0.65,
  PKR: 0.0036,
  INR: 0.012,
};

const CACHE_TTL_MS = 60 * 60 * 1000;

type RateCache = {
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
  live: boolean;
};

let cache: RateCache | null = null;
let inflight: Promise<void> | null = null;

function getApiUrl(): string {
  const custom = process.env.EXCHANGE_RATE_API_URL?.trim();
  if (custom) {
    return custom;
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim();
  if (apiKey) {
    return `https://v6.exchangerate-api.com/v6/${encodeURIComponent(apiKey)}/latest/USD`;
  }

  return "https://open.er-api.com/v6/latest/USD";
}

function ratesFromConversionTable(
  conversionRates: Record<string, number>,
): Record<CurrencyCode, number> {
  const rates = { ...FALLBACK_USD_PER_UNIT };

  for (const code of SUPPORTED_CURRENCIES) {
    if (code === "USD") {
      rates.USD = 1;
      continue;
    }

    const unitsPerUsd = conversionRates[code];
    if (typeof unitsPerUsd === "number" && unitsPerUsd > 0) {
      rates[code] = 1 / unitsPerUsd;
    }
  }

  return rates;
}

async function fetchLiveRates(): Promise<RateCache> {
  const response = await fetch(getApiUrl(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Exchange rate API returned ${response.status}`);
  }

  const data = (await response.json()) as {
    result?: string;
    conversion_rates?: Record<string, number>;
    rates?: Record<string, number>;
  };

  const conversionRates = data.conversion_rates ?? data.rates;

  if (data.result !== "success" || !conversionRates) {
    throw new Error("Exchange rate API returned an invalid payload");
  }

  return {
    rates: ratesFromConversionTable(conversionRates),
    fetchedAt: Date.now(),
    live: true,
  };
}

export function getUsdPerUnit(currency: CurrencyCode): number {
  return cache?.rates[currency] ?? FALLBACK_USD_PER_UNIT[currency];
}

export function getExchangeRateMeta(): {
  live: boolean;
  fetchedAt: Date | null;
} {
  return {
    live: cache?.live ?? false,
    fetchedAt: cache ? new Date(cache.fetchedAt) : null,
  };
}

/** Refresh cached USD conversion rates (no-op if cache is still fresh). */
export async function refreshExchangeRatesIfStale(): Promise<void> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return;
  }

  if (inflight) {
    await inflight;
    return;
  }

  inflight = (async () => {
    try {
      cache = await fetchLiveRates();
    } catch {
      if (!cache) {
        cache = {
          rates: { ...FALLBACK_USD_PER_UNIT },
          fetchedAt: Date.now(),
          live: false,
        };
      }
    }
  })().finally(() => {
    inflight = null;
  });

  await inflight;
}
