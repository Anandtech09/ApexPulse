import React, { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { EnrichedStock } from "../../types";
import { StockRow } from "./StockRow";

interface PortfolioTableProps {
  stocks: EnrichedStock[];
}

interface SortConfig {
  key: keyof EnrichedStock | null;
  direction: "asc" | "desc";
}

export const PortfolioTable: React.FC<PortfolioTableProps> = React.memo(({ stocks }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleSort = useCallback((key: keyof EnrichedStock) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else {
          return { key: null, direction: "asc" };
        }
      }
      return { key, direction: "asc" };
    });
  }, []);

  // Sort logic
  const sortedStocks = useMemo(() => {
    if (!sortConfig.key) return stocks;

    return [...stocks].sort((a, b) => {
      const valA = a[sortConfig.key!];
      const valB = b[sortConfig.key!];

      // Safe fallback for null values (send to bottom)
      const isNullA = valA === null || valA === undefined;
      const isNullB = valB === null || valB === undefined;
      if (isNullA && isNullB) return 0;
      if (isNullA) return 1;
      if (isNullB) return -1;

      if (typeof valA === "string") {
        return sortConfig.direction === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortConfig.direction === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });
  }, [stocks, sortConfig]);

  // Sort direction helper icon
  const getSortIcon = (key: keyof EnrichedStock) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={12} className="text-slate-600 group-hover:text-slate-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={12} className="text-indigo-400" />
    ) : (
      <ArrowDown size={12} className="text-indigo-400" />
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20 backdrop-blur-md shadow-inner">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Stock holdings statistics and fundamentals table</caption>
        <thead>
          <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {/* Headers */}
            <th 
              onClick={() => handleSort("name")}
              className="table-th-sortable px-4 py-3 align-middle group rounded-tl-xl"
            >
              <div className="flex items-center gap-1">
                Particulars {getSortIcon("name")}
              </div>
            </th>
            
            <th 
              onClick={() => handleSort("exchange")}
              className="table-th-sortable px-4 py-3 align-middle text-center group"
            >
              <div className="flex items-center justify-center gap-1">
                Exch {getSortIcon("exchange")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("purchasePrice")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Cost {getSortIcon("purchasePrice")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("quantity")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Qty {getSortIcon("quantity")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("investment")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Invested {getSortIcon("investment")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("portfolioWeight")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Weight {getSortIcon("portfolioWeight")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("cmp")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                CMP (Live) {getSortIcon("cmp")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("presentValue")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Value {getSortIcon("presentValue")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("gainLoss")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                Gain/Loss {getSortIcon("gainLoss")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("peRatio")}
              className="table-th-sortable px-4 py-3 align-middle text-right group"
            >
              <div className="flex items-center justify-end gap-1">
                P/E {getSortIcon("peRatio")}
              </div>
            </th>

            <th 
              onClick={() => handleSort("latestEarnings")}
              className="table-th-sortable px-4 py-3 align-middle text-right group rounded-tr-xl"
            >
              <div className="flex items-center justify-end gap-1">
                EPS {getSortIcon("latestEarnings")}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedStocks.map((stock) => (
            <StockRow
              key={stock.id}
              stock={stock}
              isExpanded={!!expandedRows[stock.id]}
              onToggleExpand={() => handleToggleExpand(stock.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Set display name for React.memo compatibility
PortfolioTable.displayName = "PortfolioTable";
