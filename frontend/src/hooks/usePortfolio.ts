import { useState, useEffect, useMemo, useCallback } from "react";
import { getHoldings, getLivePrices, getFundamentals } from "../lib/stockService";
import { Holding, QuoteData, FundamentalsData, EnrichedStock, PortfolioSummary } from "../types";
import { groupBySector } from "../lib/utils";

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [prices, setPrices] = useState<Record<string, QuoteData> | null>(null);
  const [fundamentals, setFundamentals] = useState<Record<string, FundamentalsData> | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState<boolean>(false);
  const [isRefreshingFundamentals, setIsRefreshingFundamentals] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const [isPriceResponseStale, setIsPriceResponseStale] = useState<boolean>(false);
  const [isFundamentalsResponseStale, setIsFundamentalsResponseStale] = useState<boolean>(false);

  const [lastPriceUpdate, setLastPriceUpdate] = useState<number | null>(null);
  const [lastFundamentalsUpdate, setLastFundamentalsUpdate] = useState<number | null>(null);


  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [holdingsRes, pricesRes, fundamentalsRes] = await Promise.all([
        getHoldings(),
        getLivePrices(),
        getFundamentals(),
      ]);

      if (holdingsRes.success && holdingsRes.data) {
        setHoldings(holdingsRes.data);
      } else {
        throw new Error(holdingsRes.message || "Failed to fetch static holdings data");
      }

      if (pricesRes.success && pricesRes.data) {
        setPrices(pricesRes.data);
        setIsPriceResponseStale(!!pricesRes.stale);
        setLastPriceUpdate(Date.now());
      } else {
        console.warn("Initial price load returned unsuccessful status:", pricesRes.message);
      }

      if (fundamentalsRes.success && fundamentalsRes.data) {
        setFundamentals(fundamentalsRes.data);
        setIsFundamentalsResponseStale(!!fundamentalsRes.stale);
        setLastFundamentalsUpdate(Date.now());
      } else {
        console.warn("Initial fundamentals load returned unsuccessful status:", fundamentalsRes.message);
      }
    } catch (err) {
      setError((err as Error).message || "An unexpected error occurred while loading dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPrices = useCallback(async () => {
    try {
      setIsRefreshingPrices(true);
      const res = await getLivePrices();
      if (res.success && res.data) {
        setPrices(res.data);
        setIsPriceResponseStale(!!res.stale);
        setLastPriceUpdate(Date.now());
      }
    } catch (err) {
      console.error("Failed to poll live stock prices:", err);
    } finally {
      setIsRefreshingPrices(false);
    }
  }, []);

  const refreshFundamentals = useCallback(async () => {
    try {
      setIsRefreshingFundamentals(true);
      const res = await getFundamentals();
      if (res.success && res.data) {
        setFundamentals(res.data);
        setIsFundamentalsResponseStale(!!res.stale);
        setLastFundamentalsUpdate(Date.now());
      }
    } catch (err) {
      console.error("Failed to poll Google Finance fundamentals:", err);
    } finally {
      setIsRefreshingFundamentals(false);
    }
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInitialData]);

  useEffect(() => {
    // 15 seconds polling for Yahoo Finance live prices
    const priceInterval = setInterval(() => {
      refreshPrices();
    }, 15000);

    // 1 hour polling for Google Finance P/E and Earnings
    const fundInterval = setInterval(() => {
      refreshFundamentals();
    }, 3600000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(fundInterval);
    };
  }, [refreshPrices, refreshFundamentals]);

  // Computation
  const enrichedStocks = useMemo((): EnrichedStock[] => {
    if (!holdings) return [];

    // Calculate total static investment first for weights
    const stocksWithInvestment = holdings.map((h) => {
      const investment = h.purchasePrice * h.quantity;
      return { h, investment };
    });

    const totalInvestment = stocksWithInvestment.reduce((sum, s) => sum + s.investment, 0);

    return stocksWithInvestment.map(({ h, investment }) => {
      const portfolioWeight = totalInvestment === 0 ? 0 : (investment / totalInvestment) * 100;

      const priceInfo = prices?.[h.ticker];
      const cmp = priceInfo?.cmp ?? h.purchasePrice;
      const presentValue = cmp * h.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercent = investment === 0 ? 0 : (gainLoss / investment) * 100;

      const priceChange = priceInfo?.change ?? 0;
      const priceChangePercent = priceInfo?.changePercent ?? 0;
      const priceStale = isPriceResponseStale || !priceInfo;

      const marketCap = priceInfo?.marketCap ?? null;
      const bookValue = priceInfo?.bookValue ?? null;
      const priceToBook = priceInfo?.priceToBook ?? null;
      const dayHigh = priceInfo?.dayHigh ?? null;
      const dayLow = priceInfo?.dayLow ?? null;
      const fiftyTwoWeekHigh = priceInfo?.fiftyTwoWeekHigh ?? null;
      const fiftyTwoWeekLow = priceInfo?.fiftyTwoWeekLow ?? null;

      const fundInfo = fundamentals?.[h.googleTicker];
      const peRatio = fundInfo?.peRatio ?? null;
      const latestEarnings = fundInfo?.latestEarnings ?? null;
      const fundamentalsStale = isFundamentalsResponseStale || !fundInfo;

      return {
        ...h,
        investment,
        portfolioWeight,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercent,
        priceChange,
        priceChangePercent,
        priceStale,
        peRatio,
        latestEarnings,
        fundamentalsStale,
        marketCap,
        bookValue,
        priceToBook,
        dayHigh,
        dayLow,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
      };
    });
  }, [holdings, prices, fundamentals, isPriceResponseStale, isFundamentalsResponseStale]);

  const summary = useMemo((): PortfolioSummary | null => {
    if (enrichedStocks.length === 0) return null;

    const totalInvestment = enrichedStocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = enrichedStocks.reduce((sum, s) => sum + s.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent = totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;

    const sectors = groupBySector(enrichedStocks);

    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercent,
      sectors,
      lastPriceUpdate,
      lastFundamentalsUpdate,
    };
  }, [enrichedStocks, lastPriceUpdate, lastFundamentalsUpdate]);

  return {
    stocks: enrichedStocks,
    summary,
    isLoading,
    isRefreshingPrices,
    isRefreshingFundamentals,
    error,
    refetch: fetchInitialData,
    refetchPrices: refreshPrices,
    refetchFundamentals: refreshFundamentals,
  };
}
