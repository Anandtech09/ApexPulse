import { EnrichedStock, SectorSummary } from "../types";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string | Date | number) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatCurrency(value: number, currency = "INR", locale = "en-IN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function calcInvestment(price: number, qty: number): number {
  return price * qty;
}

export function calcPresentValue(cmp: number, qty: number): number {
  return cmp * qty;
}

export function calcGainLoss(presentValue: number, investment: number): number {
  return presentValue - investment;
}

export function calcGainLossPercent(gainLoss: number, investment: number): number {
  if (investment === 0) return 0;
  return (gainLoss / investment) * 100;
}

export function calcPortfolioWeight(investment: number, totalInvestment: number): number {
  if (totalInvestment === 0) return 0;
  return (investment / totalInvestment) * 100;
}

export function groupBySector(stocks: EnrichedStock[]): SectorSummary[] {
  const sectorsMap: Record<string, EnrichedStock[]> = {};
  
  for (const stock of stocks) {
    if (!sectorsMap[stock.sector]) {
      sectorsMap[stock.sector] = [];
    }
    sectorsMap[stock.sector].push(stock);
  }
  
  return Object.entries(sectorsMap).map(([sector, sectorStocks]) => {
    const totalInvestment = sectorStocks.reduce((sum, s) => sum + s.investment, 0);
    const totalPresentValue = sectorStocks.reduce((sum, s) => sum + s.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const totalGainLossPercent = totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;
    
    return {
      sector,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      totalGainLossPercent,
      stocks: sectorStocks,
    };
  });
}
