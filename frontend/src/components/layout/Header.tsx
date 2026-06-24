import React from "react";
import { Activity } from "lucide-react";
import { RefreshIndicator } from "../ui/RefreshIndicator";
import { REFRESH_INTERVALS } from "../../config/ui.config";

interface HeaderProps {
  isRefreshingPrices: boolean;
  isRefreshingFundamentals: boolean;
  lastPriceUpdate: number | null;
  lastFundamentalsUpdate: number | null;
  refetchPrices: () => void;
  refetchFundamentals: () => void;
  priceStale: boolean;
  fundamentalsStale: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isRefreshingPrices,
  isRefreshingFundamentals,
  lastPriceUpdate,
  lastFundamentalsUpdate,
  refetchPrices,
  refetchFundamentals,
  priceStale,
  fundamentalsStale,
}) => {
  return (
    <header className="w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[4rem] py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl shadow-lg shadow-indigo-500/5">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">ApexPulse</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Portfolio Dashboard</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshIndicator
            label="Live Prices"
            isRefreshing={isRefreshingPrices}
            lastUpdated={lastPriceUpdate}
            onRefresh={refetchPrices}
            refreshIntervalMs={REFRESH_INTERVALS.prices}
            isStale={priceStale}
          />
          <RefreshIndicator
            label="Fundamentals"
            isRefreshing={isRefreshingFundamentals}
            lastUpdated={lastFundamentalsUpdate}
            onRefresh={refetchFundamentals}
            refreshIntervalMs={REFRESH_INTERVALS.fundamentals}
            isStale={fundamentalsStale}
          />
        </div>
      </div>
    </header>
  );
};
