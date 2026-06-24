import React, { useState } from "react";
import { ChevronDown, ChevronUp, FolderKanban, TrendingUp, TrendingDown } from "lucide-react";
import { SectorSummary } from "../../types";
import { PortfolioTable } from "./PortfolioTable";
import { formatCurrency } from "../../lib/utils";

interface SectorGroupProps {
  summary: SectorSummary;
  defaultExpanded?: boolean;
}

export const SectorGroup: React.FC<SectorGroupProps> = React.memo(({
  summary,
  defaultExpanded = true
}) => {
  const {
    sector,
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPercent,
    stocks
  } = summary;

  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const isProfit = totalGainLoss >= 0;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl mb-6 overflow-hidden transition-all duration-300">
      
      {/* Sector Header / Summary Bar */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(prev => !prev);
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-950/20 hover:bg-slate-950/40 border-b border-white/[0.03] transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded-t-2xl"
      >
        {/* Left Section: Sector Brand & stock count */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <FolderKanban size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{sector} Sector</h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {stocks.length} {stocks.length === 1 ? "Holding" : "Holdings"}
            </span>
          </div>
        </div>

        {/* Right Section: Aggregated Metrics */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {/* Total Invested */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Invested Cost</span>
            <span className="text-slate-200 font-mono font-semibold mt-0.5">
              {formatCurrency(totalInvestment)}
            </span>
          </div>

          {/* Current Value */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Present Value</span>
            <span className="text-slate-200 font-mono font-semibold mt-0.5">
              {formatCurrency(totalPresentValue)}
            </span>
          </div>

          {/* Net Return */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sector Return</span>
            <div className={`font-mono font-bold flex items-center gap-1 mt-0.5 ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
              {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isProfit ? "+" : ""}{totalGainLossPercent.toFixed(2)}%</span>
              <span className="text-xs font-medium text-slate-400">({formatCurrency(totalGainLoss)})</span>
            </div>
          </div>

          {/* Expansion Caret */}
          <div className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Collapsible Table Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100 p-4" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {isExpanded && <PortfolioTable stocks={stocks} />}
      </div>
    </div>
  );
});

SectorGroup.displayName = "SectorGroup";
