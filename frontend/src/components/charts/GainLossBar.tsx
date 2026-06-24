"use client";

import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { SectorSummary } from "../../types";
import { formatCurrency } from "../../lib/utils";
import { useContainerSize } from "../../hooks/useContainerSize";
import { CHART_COLORS } from "../../config/ui.config";

interface GainLossBarProps {
  sectors: SectorSummary[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.value;
    const isProfit = value >= 0;
    return (
      <div className={`p-3 ${CHART_COLORS.tooltip.bg} border ${CHART_COLORS.tooltip.border} backdrop-blur-md rounded-xl shadow-xl text-xs`}>
        <p className="font-bold text-white mb-1">{data.name} Sector</p>
        <p className={`font-mono font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
          Net Return: {isProfit ? "+" : ""}{formatCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
};

export const GainLossBar: React.FC<GainLossBarProps> = ({ sectors }) => {
  const [containerRef, { width, height }] = useContainerSize();

  const data = sectors.map((s) => ({
    name: s.sector,
    value: s.totalGainLoss,
  }));

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[320px]">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">Sector Performance</h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Absolute Net returns (INR)</p>
      </div>

      <div ref={containerRef} className="flex-1 w-full relative mt-4">
        {width === 0 || height === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium animate-pulse">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-medium">
            No return data available
          </div>
        ) : (
          <BarChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: CHART_COLORS.axis, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_COLORS.axis, fontSize: 9, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 100000) {
                  return `₹${(value / 100000).toFixed(1)}L`;
                } else if (Math.abs(value) >= 1000) {
                  return `₹${(value / 1000).toFixed(0)}k`;
                }
                return `₹${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: CHART_COLORS.cursor }} />
            <ReferenceLine y={0} stroke={CHART_COLORS.reference} strokeWidth={1} />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? CHART_COLORS.gain : CHART_COLORS.loss}
                  style={{ filter: `drop-shadow(0px 0px 6px ${entry.value >= 0 ? CHART_COLORS.gainGlow : CHART_COLORS.lossGlow})` }}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
    </div>
  );
};
