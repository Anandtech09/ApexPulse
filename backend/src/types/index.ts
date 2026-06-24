// Generic API wrapper :
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  stale?: boolean; // true when returning last cached value after a live-fetch failure
}

// Core Domain Types -

export interface Holding {
  id: string;
  name: string;
  ticker: string;        // Yahoo Finance format  e.g. "HDFCBANK.NS"
  googleTicker: string;  // Google Finance format e.g. "NSE:HDFCBANK"
  exchange: string;      // "NSE" | "BSE"
  exchangeCode: string;  // Symbol or ISIN shown in the NSE/BSE table column
  sector: string;        // "Financial" | "Technology" | "Consumer" | "Power" | "Pipes" | "Specialty Chemicals" | "Others"
  purchasePrice: number;
  quantity: number;

  /**
   Used by the frontend to resolve brand favicon/logo via the Google S2 favicon API.
   */
  domain: string | null;
}

// Live Data
export interface QuoteData {
  ticker: string;
  cmp: number;             // Current Market Price
  change: number;          // Absolute change from previous close
  changePercent: number;   // % change from previous close
  fetchedAt: number;       // Unix ms timestamp
  marketCap: number | null;
  bookValue: number | null;
  priceToBook: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

/** P/E and earnings from Google Finance — refreshed every hour */
export interface FundamentalsData {
  googleTicker: string;
  peRatio: number | null;
  latestEarnings: number | null;
  fetchedAt: number;
}


export interface EnrichedStock extends Holding {
  // Computed from static data
  investment: number;          // purchasePrice × quantity
  portfolioWeight: number;     // (investment / totalPortfolio) × 100

  // From live price fetch
  cmp: number;
  presentValue: number;        // cmp × quantity
  gainLoss: number;            // presentValue - investment
  gainLossPercent: number;     // (gainLoss / investment) × 100
  priceChange: number;         // day change in absolute ₹
  priceChangePercent: number;  // day change %
  priceStale: boolean;         // true when showing cached price after Yahoo failure

  // From fundamentals fetch
  peRatio: number | null;
  latestEarnings: number | null;
  fundamentalsStale: boolean;  // true when showing cached fundamentals
}

/** Sector-level aggregate row shown above each sector group */
export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stocks: EnrichedStock[];
}

/** Top-level portfolio totals shown in the summary bar */
export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  sectors: SectorSummary[];
  lastPriceUpdate: number | null;
  lastFundamentalsUpdate: number | null;
}
