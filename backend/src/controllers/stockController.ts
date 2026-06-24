import { Request, Response, NextFunction } from "express";
import { ALL_TICKERS, ALL_GOOGLE_TICKERS } from "../config/holdings";
import { fetchPrices } from "../utils/yahooFinance";
import { fetchAllFundamentals } from "../utils/googleFinance";
import { ApiResponse, QuoteData, FundamentalsData } from "../types";

export async function getLivePrices(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { data, stale } = await fetchPrices(ALL_TICKERS);

    const response: ApiResponse<Record<string, QuoteData>> = {
      success: true,
      data,
      stale,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function getFundamentals(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { data, stale } = await fetchAllFundamentals(ALL_GOOGLE_TICKERS);

    const response: ApiResponse<Record<string, FundamentalsData>> = {
      success: true,
      data,
      stale,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
