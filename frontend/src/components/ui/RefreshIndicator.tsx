import React, { useState, useEffect } from "react";
import { RefreshCw, Radio } from "lucide-react";
import { cn } from "../../lib/utils";

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
  refreshIntervalMs?: number;
  label?: string;
  isStale?: boolean;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isRefreshing,
  lastUpdated,
  onRefresh,
  refreshIntervalMs = 15000,
  label = "Prices",
  isStale = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(refreshIntervalMs / 1000);

  useEffect(() => {
    if (!lastUpdated) return;
    
    const intervalSec = refreshIntervalMs / 1000;
    
    // Defer state update to prevent synchronous cascading commits during render
    const deferTimer = setTimeout(() => {
      setSecondsLeft(intervalSec);
    }, 0);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return intervalSec;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(deferTimer);
      clearInterval(timer);
    };
  }, [lastUpdated, refreshIntervalMs]);

  // Formatter for elapsed time
  const [timeAgo, setTimeAgo] = useState<string>("just now");

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const diffMs = Date.now() - lastUpdated;
      const diffSec = Math.round(diffMs / 1000);
      
      if (diffSec < 5) setTimeAgo("just now");
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else {
        const diffMin = Math.floor(diffSec / 60);
        setTimeAgo(`${diffMin}m ago`);
      }
    };

    const deferTimer = setTimeout(updateTimeAgo, 0);
    const interval = setInterval(updateTimeAgo, 5000);
    return () => {
      clearTimeout(deferTimer);
      clearInterval(interval);
    };
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 glass-panel rounded-lg text-[10px] sm:text-xs">
      <div className="flex items-center gap-1.5">
        <Radio 
          size={12} 
          className={cn(
            isStale ? "text-amber-500 animate-pulse" : "text-emerald-500",
            isRefreshing && "text-indigo-400 animate-pulse"
          )} 
        />
        <span className="text-slate-300 font-medium whitespace-nowrap">
          {label}: {isStale ? "Stale" : "Live"}
        </span>
      </div>
      
      <span className="text-slate-500 hidden sm:inline">|</span>

      <span className="text-slate-400 font-mono hidden sm:inline">
        {isRefreshing ? (
          <span className="text-indigo-400 flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin" />
            Updating...
          </span>
        ) : (
          <span>Next in {secondsLeft}s</span>
        )}
      </span>

      <span className="text-slate-500 hidden md:inline">|</span>

      <span className="text-slate-400 text-[10px] hidden md:inline">
        Updated {timeAgo}
      </span>

      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="ml-1 p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
        title="Sync Now"
        aria-label="Sync portfolio data"
      >
        <RefreshCw size={11} className={cn(isRefreshing && "animate-spin")} />
      </button>
    </div>
  );
};
