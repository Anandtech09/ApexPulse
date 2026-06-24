import axios from "axios";
import * as cheerio from "cheerio";
import { FundamentalsData } from "../types";
import { config } from "../config";
import YahooFinance from "yahoo-finance2";
import { holdings } from "../config/holdings";

const yahooFinance = new YahooFinance();

// ── In-memory cache ────────────────────────────────────────────────
interface CacheEntry {
  data: Record<string, FundamentalsData>;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

function isCacheFresh(): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < config.cache.fundamentalsTtl;
}

// ── HTML scraping helpers ──────────────────────────────────────────

/**
 * Fetches P/E ratio and latest earnings for a single stock from
 * Google Finance. Returns null for either field if scraping fails.
 *
 * googleTicker format: "NSE:HDFCBANK"
 *
 * Scraper settings are read from config (env vars):
 *   GOOGLE_FINANCE_BASE_URL, GOOGLE_FINANCE_USER_AGENT,
 *   GOOGLE_FINANCE_ACCEPT_LANGUAGE, GOOGLE_FINANCE_TIMEOUT
 */
async function fetchOneFundamentals(
  googleTicker: string
): Promise<FundamentalsData> {
  const [exchange, symbol] = googleTicker.split(":");
  const url = `${config.googleFinance.baseUrl}/${symbol}:${exchange}`;

  const result: FundamentalsData = {
    googleTicker,
    peRatio: null,
    latestEarnings: null,
    fetchedAt: Date.now(),
  };

  try {
    const { data: html } = await axios.get<string>(url, {
      headers: {
        "User-Agent": config.googleFinance.userAgent,
        "Accept-Language": config.googleFinance.acceptLanguage,
        Accept: "text/html",
      },
      timeout: config.googleFinance.timeout,
    });

    const $ = cheerio.load(html);

    // Google Finance renders key stats in labeled cells.
    // We look for labels "P/E ratio" and "EPS / earnings per share".
    $("[data-attrid]").each((_i, el) => {
      const label = $(el).find(".P6K39c").text().trim().toLowerCase();
      const value = $(el).find(".YMlKec").text().trim().replace(/,/g, "");

      if (label.includes("p/e ratio")) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) result.peRatio = parsed;
      }

      if (label.includes("eps") || label.includes("earnings per share")) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) result.latestEarnings = parsed;
      }
    });

    // Fallback: scan stat-table rows
    if (result.peRatio === null) {
      $("tr").each((_i, row) => {
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const label = $(cells[0]).text().toLowerCase();
          const val = $(cells[1]).text().replace(/,/g, "").trim();
          if (label.includes("p/e")) {
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) result.peRatio = parsed;
          }
        }
      });
    }
  } catch (err) {
    console.warn(
      `[googleFinance] Failed to scrape ${googleTicker}:`,
      (err as Error).message
    );
  }

  // ── Yahoo Finance Fallback ─────────────────────────────────────────
  if (result.peRatio === null || result.latestEarnings === null) {
    const holding = holdings.find((h) => h.googleTicker === googleTicker);
    const yahooTicker = holding?.ticker;
    if (yahooTicker) {
      try {
        const quote = await yahooFinance.quote(yahooTicker);
        if (result.peRatio === null && quote && typeof quote.trailingPE === "number") {
          result.peRatio = quote.trailingPE;
        }
        if (result.latestEarnings === null && quote && typeof quote.epsTrailingTwelveMonths === "number") {
          result.latestEarnings = quote.epsTrailingTwelveMonths;
        }
      } catch (yahooErr) {
        console.warn(
          `[googleFinance] Yahoo fallback failed for ${yahooTicker}:`,
          (yahooErr as Error).message
        );
      }
    }
  }

  return result;
}

// ── Concurrency limiter ────────────────────────────────────────────

/**
 * Runs an array of async tasks in batches of `limit` at a time.
 * Prevents hitting Google with 25 simultaneous requests.
 */
async function runInBatches<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];

  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit).map((fn) => fn());
    const batchResults = await Promise.allSettled(batch);
    results.push(...batchResults);
  }

  return results;
}

// ── Main exported function ─────────────────────────────────────────

/**
 * Fetches fundamentals for all provided Google Finance tickers.
 * Runs in configurable batches (GOOGLE_FINANCE_CONCURRENCY).
 * Results are cached for CACHE_TTL_FUNDAMENTALS ms (default 1hr).
 */
export async function fetchAllFundamentals(
  googleTickers: string[]
): Promise<{ data: Record<string, FundamentalsData>; stale: boolean }> {
  if (isCacheFresh() && cache) {
    return { data: cache.data, stale: false };
  }

  const tasks = googleTickers.map(
    (ticker) => () => fetchOneFundamentals(ticker)
  );

  const settled = await runInBatches(tasks, config.googleFinance.concurrency);

  const data: Record<string, FundamentalsData> = {};
  for (const result of settled) {
    if (result.status === "fulfilled") {
      data[result.value.googleTicker] = result.value;
    }
  }

  cache = { data, fetchedAt: Date.now() };
  return { data, stale: false };
}

/** Clears the fundamentals cache — used in tests to reset state between runs */
export function clearFundamentalsCache(): void {
  cache = null;
}
