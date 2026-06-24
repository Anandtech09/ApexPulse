"use client";

import React, { useState, useMemo } from "react";
import { Header } from "../components/layout/Header";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { DashboardSkeleton } from "../components/ui/DashboardSkeleton";
import { SectorGroup } from "../components/portfolio/SectorGroup";
import { usePortfolio } from "../hooks/usePortfolio";
import { formatCurrency, groupBySector } from "../lib/utils";
import { TrendingUp, TrendingDown, Landmark, Coins, Briefcase, Search } from "lucide-react";
import { PortfolioDonut } from "../components/charts/PortfolioDonut";
import { GainLossBar } from "../components/charts/GainLossBar";
import { EXCHANGE_FILTER_OPTIONS } from "../config/ui.config";

export default function Home() {
  const {
    stocks,
    summary,
    isLoading,
    isRefreshingPrices,
    isRefreshingFundamentals,
    error,
    refetch,
    refetchPrices,
    refetchFundamentals,
  } = usePortfolio();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");

  // Determine if prices or fundamentals are generally stale
  const hasStalePrices = stocks.some((s) => s.priceStale);
  const hasStaleFundamentals = stocks.some((s) => s.fundamentalsStale);

  // Dynamically compute sectors list from available stocks
  const availableSectors = useMemo(() => {
    const sectorsSet = new Set(stocks.map((s) => s.sector));
    return ["All", ...Array.from(sectorsSet)].sort();
  }, [stocks]);

  // Filter Logic
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.exchangeCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesExchange =
        exchangeFilter === "All" ||
        stock.exchange === exchangeFilter;

      const matchesSector =
        sectorFilter === "All" ||
        stock.sector === sectorFilter;

      return matchesSearch && matchesExchange && matchesSector;
    });
  }, [stocks, searchTerm, exchangeFilter, sectorFilter]);

  // Regroup filtered stocks by sector
  const filteredSectors = useMemo(() => {
    return groupBySector(filteredStocks);
  }, [filteredStocks]);

  // Recalculate Totals based on filtered stocks
  const filteredTotals = useMemo(() => {
    if (filteredStocks.length === 0) return null;
    const totalInvestment = filteredStocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = filteredStocks.reduce((sum, s) => sum + s.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent = totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;
    
    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercent,
      isOverallProfit: totalGainLoss >= 0
    };
  }, [filteredStocks]);

  const totals = filteredTotals || {
    totalInvestment: 0,
    totalPresentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    isOverallProfit: true,
  };

  const isOverallProfit = totals.isOverallProfit;

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          isRefreshingPrices={isRefreshingPrices}
          isRefreshingFundamentals={isRefreshingFundamentals}
          lastPriceUpdate={null}
          lastFundamentalsUpdate={null}
          refetchPrices={refetchPrices}
          refetchFundamentals={refetchFundamentals}
          priceStale={false}
          fundamentalsStale={false}
        />
        <div className="flex-1 overflow-y-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <Header
        isRefreshingPrices={isRefreshingPrices}
        isRefreshingFundamentals={isRefreshingFundamentals}
        lastPriceUpdate={summary?.lastPriceUpdate ?? null}
        lastFundamentalsUpdate={summary?.lastFundamentalsUpdate ?? null}
        refetchPrices={refetchPrices}
        refetchFundamentals={refetchFundamentals}
        priceStale={hasStalePrices}
        fundamentalsStale={hasStaleFundamentals}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Alert for Errors (when we already have cached summary data) */}
        {error && (
          <ErrorBanner message={error} onRetry={refetch} />
        )}

        {/* Informative Warning Banners for Stale Cache States */}
        {(hasStalePrices || hasStaleFundamentals) && !error && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>
              {hasStalePrices && hasStaleFundamentals
                ? "Connecting issues. Displaying cached prices (60s TTL) and fundamentals (1h TTL) fallback data."
                : hasStalePrices
                ? "Live price feed delayed. Displaying cached prices from memory."
                : "Fundamentals scraper delayed. Displaying cached earnings metrics."}
            </span>
          </div>
        )}

        {summary && (
          <>
            {/* ─── PORTFOLIO OVERVIEW SECTION ─── */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">Performance Summary</h2>
              <p className="text-slate-400 text-xs mt-0.5">Aggregate valuation metrics across all active positions.</p>
            </div>

            {/* Overview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Card 1: Total Cost Basis */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-l-2 border-l-indigo-500/50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Invested</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1">
                    {formatCurrency(totals.totalInvestment)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Original cost basis of positions</span>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Briefcase size={22} />
                </div>
              </div>

              {/* Card 2: Current Valuation */}
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-l-2 border-l-sky-500/50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Present Value</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1">
                    {formatCurrency(totals.totalPresentValue)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Value adjusted at live stock prices</span>
                </div>
                <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                  <Landmark size={22} />
                </div>
              </div>

              {/* Card 3: Total Return */}
              <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-l-2 ${
                isOverallProfit ? "border-l-emerald-500/50" : "border-l-rose-500/50"
              }`}>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Net Return</span>
                  <span className={`text-2xl font-bold font-mono mt-1 ${isOverallProfit ? "text-emerald-400" : "text-rose-400"}`}>
                    {isOverallProfit ? "+" : ""}{formatCurrency(totals.totalGainLoss)}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 mt-2 ${isOverallProfit ? "text-emerald-500" : "text-rose-500"}`}>
                    {isOverallProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {isOverallProfit ? "+" : ""}{totals.totalGainLossPercent.toFixed(2)}%
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isOverallProfit 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  <Coins size={22} />
                </div>
              </div>

            </div>

            {/* Filters Row */}
            <div className="mb-8 p-4 glass-panel rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full relative">
                <input
                  type="text"
                  placeholder="Search by stock name, ticker, or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
              <div className="flex w-full md:w-auto gap-4">
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-sans"
                >
                  <option value="All">All Sectors</option>
                  {availableSectors.filter(s => s !== "All").map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
                <select
                  value={exchangeFilter}
                  onChange={(e) => setExchangeFilter(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-sans"
                >
                  {EXCHANGE_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Analytics Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="min-w-0">
                <PortfolioDonut sectors={filteredSectors} />
              </div>
              <div className="min-w-0">
                <GainLossBar sectors={filteredSectors} />
              </div>
            </div>

            {/* ─── SECTOR WISE COLLAPSIBLE HOLDINGS ─── */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Sectors Allocation</h2>
              <p className="text-slate-400 text-xs mt-0.5">Positions grouped by market sector. Click on sector cards to collapse/expand position tables.</p>
            </div>

            {filteredSectors.length === 0 ? (
              <div className="text-center py-12 glass-panel rounded-2xl">
                <span className="text-slate-400 text-sm font-medium">No assets found matching the active filters.</span>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSectors.map((sectorSummary) => (
                  <SectorGroup 
                    key={sectorSummary.sector} 
                    summary={sectorSummary} 
                    defaultExpanded={true} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
