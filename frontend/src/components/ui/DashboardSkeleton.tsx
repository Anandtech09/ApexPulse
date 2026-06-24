import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-6 w-48 bg-slate-800 rounded-lg mb-2"></div>
        <div className="h-4 w-72 bg-slate-900 rounded-lg"></div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl h-32 flex flex-col justify-between">
            <div>
              <div className="h-3 w-16 bg-slate-800 rounded-md mb-2"></div>
              <div className="h-7 w-32 bg-slate-700 rounded-md"></div>
            </div>
            <div className="h-3 w-28 bg-slate-800 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Charts grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {[1, 2].map((i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl h-[320px] flex flex-col justify-between">
            <div className="h-5 w-32 bg-slate-800 rounded-md mb-4"></div>
            <div className="flex-1 w-full bg-slate-900/50 rounded-xl flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-slate-700 animate-spin"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Sector Allocation skeleton */}
      <div className="mb-6">
        <div className="h-6 w-36 bg-slate-800 rounded-lg mb-2"></div>
        <div className="h-4 w-96 bg-slate-900 rounded-lg"></div>
      </div>

      {/* Collapsible sector tables skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950/20 border-b border-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-xl"></div>
                <div>
                  <div className="h-4 w-24 bg-slate-700 rounded-md mb-1.5"></div>
                  <div className="h-3 w-12 bg-slate-800 rounded-md"></div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-8 w-20 bg-slate-850 rounded-md"></div>
                <div className="h-8 w-20 bg-slate-850 rounded-md"></div>
                <div className="h-8 w-24 bg-slate-800 rounded-md"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-slate-900/40 rounded-xl"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
