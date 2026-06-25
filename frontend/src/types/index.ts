// Generic API wrapper

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  stale?: boolean;
}

/**
 * Static portfolio holding — mirrors backend Holding type.
 * Received from GET /api/portfolio on page load.
 */
export interface Holding {
  id: string;
  name: string;
  ticker: string;
  googleTicker: string;
  exchange: string;
  exchangeCode: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  domain: string | null;
}

// Live Data

export interface QuoteData {
  ticker: string;
  cmp: number;
  change: number;
  changePercent: number;
  fetchedAt: number;
  // Live stats for expanded drawer
  marketCap: number | null;
  bookValue: number | null;
  priceToBook: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

export interface FundamentalsData {
  googleTicker: string;
  peRatio: number | null;
  latestEarnings: number | null;
  fetchedAt: number;
}

export interface EnrichedStock extends Holding {
  investment: number;
  portfolioWeight: number;
  cmp: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  priceChange: number;
  priceChangePercent: number;
  priceStale: boolean;
  peRatio: number | null;
  latestEarnings: number | null;
  fundamentalsStale: boolean;

  // Live Stats from QuoteData
  marketCap: number | null;
  bookValue: number | null;
  priceToBook: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  stocks: EnrichedStock[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  sectors: SectorSummary[];
  lastPriceUpdate: number | null;
  lastFundamentalsUpdate: number | null;
}
