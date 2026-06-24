import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV,
  clientUrl: process.env.CLIENT_URL,

  // Cache TTLs
  cache: {
    priceTtl: parseInt(process.env.CACHE_TTL_PRICES || "60000", 10),
    fundamentalsTtl: parseInt(process.env.CACHE_TTL_FUNDAMENTALS || "3600000", 10),
  },

  refreshIntervals: {
    prices: 15_000,
    fundamentals: 3_600_000,
  },

  // Yahoo Finance
  yahooFinance: {
    timeout: parseInt(process.env.YAHOO_FINANCE_TIMEOUT || "10000", 10),
    lang: process.env.YAHOO_FINANCE_LANG || "en-US",
    region: process.env.YAHOO_FINANCE_REGION || "IN",
  },

  // Google Finance scraper
  googleFinance: {
    timeout: parseInt(process.env.GOOGLE_FINANCE_TIMEOUT || "10000", 10),
    userAgent: process.env.GOOGLE_FINANCE_USER_AGENT,
    acceptLanguage: process.env.GOOGLE_FINANCE_ACCEPT_LANGUAGE,
    baseUrl: process.env.GOOGLE_FINANCE_BASE_URL,
    concurrency: parseInt(process.env.GOOGLE_FINANCE_CONCURRENCY || "5", 10),
  },
} as const;

export type Config = typeof config;
