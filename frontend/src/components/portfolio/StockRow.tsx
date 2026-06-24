import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react";
import { EnrichedStock } from "../../types";
import { formatCurrency, formatPercentage } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { getFaviconUrl } from "../../config/ui.config";

interface StockRowProps {
  stock: EnrichedStock;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const StockRow: React.FC<StockRowProps> = React.memo(({
  stock,
  isExpanded,
  onToggleExpand,
}) => {
  const {
    name,
    ticker,
    exchange,
    purchasePrice,
    quantity,
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
    domain,
    marketCap,
    bookValue,
    priceToBook,
    dayHigh,
    dayLow,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
  } = stock;

  // Track price changes to flash cell background
  const prevCmpRef = useRef<number>(cmp);
  const [flashClass, setFlashClass] = useState<string>("");

  useEffect(() => {
    if (prevCmpRef.current !== cmp) {
      if (cmp > prevCmpRef.current) {
        setFlashClass("animate-flash-green");
      } else if (cmp < prevCmpRef.current) {
        setFlashClass("animate-flash-red");
      }
      prevCmpRef.current = cmp;

      const timer = setTimeout(() => {
        setFlashClass("");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cmp]);

  const isProfit = gainLoss >= 0;
  const isDayGain = priceChange >= 0;

  // Logo URL is resolved server-side: backend supplies the `domain` field per
  // holding, so the frontend never needs a local domain-to-stock mapping.
  const logoUrl = domain ? getFaviconUrl(domain) : null;

  // stage2Variant removed since stage-2 trend is no longer in Holdings static data

  return (
    <>
      {/* Primary Row */}
      <tr
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`Stock ${name}, click to toggle detailed statistics`}
        className={`group border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors duration-150 focus:outline-none focus:bg-white/[0.02] ${isExpanded ? "bg-white/[0.01]" : ""}`}
      >
        {/* Toggle & Particulars */}
        <td className="px-4 py-3.5 align-middle">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
            {logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={logoUrl}
                alt=""
                className="w-5 h-5 rounded-md object-contain bg-white/5 p-0.5 border border-white/10 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100 text-sm whitespace-nowrap">{name}</span>
              <span className="text-slate-500 font-mono text-[10px] uppercase">{ticker}</span>
            </div>
          </div>
        </td>

        {/* Exchange Badge */}
        <td className="px-4 py-3.5 align-middle text-center">
          <Badge variant={exchange === "NSE" ? "secondary" : "default"}>
            {exchange}
          </Badge>
        </td>

        {/* Purchase Price */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-300">
          {formatCurrency(purchasePrice)}
        </td>

        {/* Quantity */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-300">
          {quantity}
        </td>

        {/* Investment Cost */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-200 font-medium">
          {formatCurrency(investment)}
        </td>

        {/* Portfolio Weight */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-400">
          {formatPercentage(portfolioWeight)}
        </td>

        {/* Live CMP with Micro-animation flash */}
        <td className={`px-4 py-3.5 align-middle text-right font-mono text-sm font-semibold transition-all duration-200 ${flashClass}`}>
          <div className="flex flex-col items-end">
            <span className={priceStale ? "text-amber-400/90" : "text-indigo-300"}>
              {formatCurrency(cmp)}
            </span>
            {priceChange !== 0 && (
              <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isDayGain ? "text-emerald-500" : "text-rose-500"}`}>
                {isDayGain ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                {isDayGain ? "+" : ""}{priceChangePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </td>

        {/* Present Value */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm font-medium text-slate-200">
          {formatCurrency(presentValue)}
        </td>

        {/* Gain / Loss */}
        <td className={`px-4 py-3.5 align-middle text-right font-mono text-sm font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
          <div className="flex flex-col items-end">
            <span>{isProfit ? "+" : ""}{formatCurrency(gainLoss)}</span>
            <span className="text-[10px] font-medium">
              {isProfit ? "+" : ""}{gainLossPercent.toFixed(2)}%
            </span>
          </div>
        </td>

        {/* P/E Ratio — fetched live from Yahoo Finance fallback */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-300">
          {peRatio !== null ? peRatio.toFixed(2) : <span className="text-slate-600">—</span>}
        </td>

        {/* Latest Earnings (EPS) — fetched live from Yahoo Finance fallback */}
        <td className="px-4 py-3.5 align-middle text-right font-mono text-sm text-slate-300">
          {latestEarnings !== null ? formatCurrency(latestEarnings) : <span className="text-slate-600">—</span>}
        </td>
      </tr>

      {/* Expanded details row */}
      {isExpanded && (
        <tr className="bg-slate-950/30 border-b border-white/5">
          <td colSpan={11} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4 rounded-xl border border-white/5 bg-slate-950/50">

              {/* Box 1: Dynamic Valuations */}
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-1">
                  Valuation Stats (Live)
                </span>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-slate-500">Market Cap:</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {marketCap !== null ? `₹${marketCap.toFixed(2)} Cr` : "—"}
                  </span>
                  <span className="text-slate-500">P/E Ratio:</span>
                  <span className="text-slate-300 font-mono font-medium text-right text-indigo-300">
                    {peRatio !== null ? peRatio.toFixed(2) : "—"}
                  </span>
                  <span className="text-slate-500">Price to Book (P/B):</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {priceToBook !== null ? priceToBook.toFixed(2) : "—"}
                  </span>
                </div>
              </div>

              {/* Box 2: Share Values */}
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-1">
                  Share Core Metrics
                </span>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-slate-500">Book Value / Share:</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {bookValue !== null ? formatCurrency(bookValue) : "—"}
                  </span>
                  <span className="text-slate-500">Latest EPS:</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {latestEarnings !== null ? formatCurrency(latestEarnings) : "—"}
                  </span>
                </div>
              </div>

              {/* Box 3: Day's Trading Range */}
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-1">
                  Day Trading Range
                </span>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-slate-500">Day High:</span>
                  <span className="text-slate-300 font-mono font-medium text-right text-emerald-400">
                    {dayHigh !== null ? formatCurrency(dayHigh) : "—"}
                  </span>
                  <span className="text-slate-500">Day Low:</span>
                  <span className="text-slate-300 font-mono font-medium text-right text-rose-400">
                    {dayLow !== null ? formatCurrency(dayLow) : "—"}
                  </span>
                </div>
              </div>

              {/* Box 4: 52-Week Range */}
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-1">
                  52-Week Range
                </span>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-slate-500">52-Week High:</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {fiftyTwoWeekHigh !== null ? formatCurrency(fiftyTwoWeekHigh) : "—"}
                  </span>
                  <span className="text-slate-500">52-Week Low:</span>
                  <span className="text-slate-300 font-mono font-medium text-right">
                    {fiftyTwoWeekLow !== null ? formatCurrency(fiftyTwoWeekLow) : "—"}
                  </span>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
});

StockRow.displayName = "StockRow";
