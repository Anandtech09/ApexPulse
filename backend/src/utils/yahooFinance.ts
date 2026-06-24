import YahooFinance from "yahoo-finance2";
import { QuoteData } from "../types";
import { config } from "../config";

const yahooFinance = new YahooFinance();

// In-memory cache
interface CacheEntry {
  data: Record<string, QuoteData>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

function isCacheFresh(): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < config.cache.priceTtl;
}

// Main fetch function

/**
 * Fetches live current market prices for all given tickers in one
 * batched request to yahoo-finance2.
 *
 * Timeout and locale are read from config (env vars):
 *   YAHOO_FINANCE_TIMEOUT, YAHOO_FINANCE_LANG, YAHOO_FINANCE_REGION
 *
 * Results are cached for CACHE_TTL_PRICES ms (default 60s).
 * On failure, returns the last cached data with stale=true.
 */
export async function fetchPrices(
  tickers: string[]
): Promise<{ data: Record<string, QuoteData>; stale: boolean }> {
  if (isCacheFresh() && cache) {
    return { data: cache.data, stale: false };
  }

  try {
    const raw = await yahooFinance.quote(
      tickers,
      {},
      {
        fetchOptions: {
          headers: {
            "User-Agent":
              config.googleFinance.userAgent,
          },
        },
      }
    ) as unknown as Array<{
      symbol: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
      marketCap?: number;
      bookValue?: number;
      priceToBook?: number;
      regularMarketDayHigh?: number;
      regularMarketDayLow?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
    }>;

    const result: Record<string, QuoteData> = {};
    const now = Date.now();
    const quoteArray = Array.isArray(raw) ? raw : [raw];

    for (const q of quoteArray) {
      if (!q.symbol) continue;
      result[q.symbol] = {
        ticker: q.symbol,
        cmp: q.regularMarketPrice ?? 0,
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        fetchedAt: now,
        marketCap: q.marketCap ? q.marketCap / 10000000 : null,
        bookValue: q.bookValue ?? null,
        priceToBook: q.priceToBook ?? null,
        dayHigh: q.regularMarketDayHigh ?? null,
        dayLow: q.regularMarketDayLow ?? null,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
      };
    }

    cache = { data: result, fetchedAt: now };
    return { data: result, stale: false };

  } catch (err) {
    if (cache) {
      console.warn("[yahooFinance] Live fetch failed, returning stale cache:", err);
      return { data: cache.data, stale: true };
    }
    throw err;
  }
}

/** Clears the price cache — used in tests to reset state between runs */
export function clearPriceCache(): void {
  cache = null;
}
