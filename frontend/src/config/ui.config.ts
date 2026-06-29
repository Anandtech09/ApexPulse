/**
 * ui.config.ts — Single source of truth for all UI constants.
 *
 * Move any new hardcoded colour, label, or display constant here instead of
 * scattering them across components.
 */

// Used by PortfolioDonut and GainLossBar charts. Each key is the `sector`
export const SECTOR_COLORS: Record<string, string> = {
  Financial:           "#6366f1", // Indigo
  Technology:          "#8b5cf6", // Purple
  Consumer:            "#3b82f6", // Blue
  Power:               "#10b981", // Emerald
  Pipes:               "#f59e0b", // Amber
  "Specialty Chemicals": "#f97316", // Orange
  Others:              "#ec4899", // Pink
};

export const SECTOR_COLOR_DEFAULT = "#94a3b8"; // Slate — fallback for unknown sectors

// Gain / Loss chart colours
export const CHART_COLORS = {
  gain:       "#10b981", // Emerald-500
  loss:       "#ef4444", // Red-500
  gainGlow:   "rgba(16,185,129,0.2)",
  lossGlow:   "rgba(239,68,68,0.2)",
  grid:       "rgba(255,255,255,0.03)",
  axis:       "#94a3b8", // Slate-400
  reference:  "rgba(255,255,255,0.15)",
  cursor:     "rgba(255,255,255,0.02)",
  cellStroke: "rgba(6,11,19,0.5)",
  tooltip: {
    bg:     "bg-slate-950/90",
    border: "border-white/10",
  },
};

// Exchange filter options
export const EXCHANGE_FILTER_OPTIONS = [
  { value: "All", label: "All Exchanges" },
  { value: "NSE", label: "NSE Only" },
  { value: "BSE", label: "BSE Only" },
] as const;

// Logo / Favicon service

export const FAVICON_BASE_URL = process.env.NEXT_PUBLIC_FAVICON_BASE_URL;
export const FAVICON_SIZE = 32; // px — the `sz` query param

/** Build the favicon URL for a given domain string (e.g. "hdfcbank.com"). */
export function getFaviconUrl(domain: string): string {
  if (!FAVICON_BASE_URL) return "";
  return `${FAVICON_BASE_URL}?sz=${FAVICON_SIZE}&domain=${domain}`;
}

// Maps the `stage2` string value from the backend to the Badge variant prop.
export const STAGE2_BADGE_VARIANT: Record<string, "success" | "danger" | "default"> = {
  Yes: "success",
  No:  "danger",
};
export const STAGE2_BADGE_DEFAULT_VARIANT = "default" as const;

export const REFRESH_INTERVALS = {
  prices:       15_000,  // 15 seconds
  fundamentals: 3_600_000, // 1 hour
} as const;
