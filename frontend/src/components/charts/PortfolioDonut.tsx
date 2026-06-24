"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { SectorSummary } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { useContainerSize } from "../../hooks/useContainerSize";
import { SECTOR_COLORS, SECTOR_COLOR_DEFAULT } from "../../config/ui.config";

interface PortfolioDonutProps {
  sectors: SectorSummary[];
}

const CustomTooltip = ({ active, payload, totalValuation }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.value;
    const percentage = totalValuation === 0 ? 0 : (value / totalValuation) * 100;
    return (
      <div className="p-3 bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-xl shadow-xl text-xs">
        <p className="font-bold text-white mb-1">{data.name} Sector</p>
        <div className="flex flex-col gap-0.5 font-mono text-slate-300">
          <span>Valuation: {formatCurrency(value)}</span>
          <span className="text-indigo-400 font-semibold">Allocation: {percentage.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const PortfolioDonut: React.FC<PortfolioDonutProps> = ({ sectors }) => {
  const [containerRef, { width, height }] = useContainerSize();

  const data = sectors.map((s) => ({
    name: s.sector,
    value: s.totalPresentValue,
    color: SECTOR_COLORS[s.sector] ?? SECTOR_COLOR_DEFAULT,
  }));

  const totalValuation = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[320px]">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">Sector Allocation</h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Distribution by present value</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full relative mt-4">
        {width === 0 || height === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium animate-pulse">
            Loading chart...
          </div>
        ) : totalValuation === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium">
            No valuation data available
          </div>
        ) : (
          <PieChart width={width} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="rgba(6, 11, 19, 0.5)" 
                  strokeWidth={2}
                  style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip totalValuation={totalValuation} />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconSize={8}
              iconType="circle"
              formatter={(value) => <span className="text-[10px] text-slate-300 font-medium px-1 uppercase tracking-wider">{value}</span>}
            />
          </PieChart>
        )}
      </div>
    </div>
  );
};
