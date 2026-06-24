import { Request, Response, NextFunction } from "express";
import { holdings } from "../config/holdings";
import { ApiResponse, Holding } from "../types";

export async function getHoldings(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const response: ApiResponse<Holding[]> = {
      success: true,
      data: holdings,
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
