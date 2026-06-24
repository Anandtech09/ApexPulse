import { api } from "./api";
import { Holding, QuoteData, FundamentalsData, ApiResponse } from "../types";

export async function getHoldings(): Promise<ApiResponse<Holding[]>> {
  return api.get<ApiResponse<Holding[]>>("/portfolio");
}

export async function getLivePrices(): Promise<ApiResponse<Record<string, QuoteData>>> {
  return api.get<ApiResponse<Record<string, QuoteData>>>("/stocks/prices");
}

export async function getFundamentals(): Promise<ApiResponse<Record<string, FundamentalsData>>> {
  return api.get<ApiResponse<Record<string, FundamentalsData>>>("/stocks/fundamentals");
}
