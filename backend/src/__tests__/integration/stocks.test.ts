import request from "supertest";
import express from "express";
import router from "../../routes";

jest.mock("../../utils/yahooFinance", () => ({
  fetchPrices: jest.fn(),
  clearPriceCache: jest.fn(),
}));

jest.mock("../../utils/googleFinance", () => ({
  fetchAllFundamentals: jest.fn(),
  clearFundamentalsCache: jest.fn(),
}));

import { fetchPrices } from "../../utils/yahooFinance";
import { fetchAllFundamentals } from "../../utils/googleFinance";

const mockedFetchPrices = fetchPrices as jest.MockedFunction<typeof fetchPrices>;
const mockedFetchFundamentals = fetchAllFundamentals as jest.MockedFunction<typeof fetchAllFundamentals>;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  return app;
}

// Sample mock responses
const mockPricesData = {
  "HDFCBANK.NS": {
    ticker: "HDFCBANK.NS",
    cmp: 1750,
    change: 10,
    changePercent: 0.57,
    fetchedAt: Date.now(),
    marketCap: 1300000,
    bookValue: 693,
    priceToBook: 2.5,
    dayHigh: 1760,
    dayLow: 1740,
    fiftyTwoWeekHigh: 1800,
    fiftyTwoWeekLow: 1400,
  },
  "BAJFINANCE.NS": {
    ticker: "BAJFINANCE.NS",
    cmp: 8420,
    change: -50,
    changePercent: -0.58,
    fetchedAt: Date.now(),
    marketCap: 520000,
    bookValue: 1253,
    priceToBook: 6.7,
    dayHigh: 8500,
    dayLow: 8380,
    fiftyTwoWeekHigh: 9000,
    fiftyTwoWeekLow: 6000,
  },
};

const mockFundamentalsData = {
  "NSE:HDFCBANK": { googleTicker: "NSE:HDFCBANK", peRatio: 18.69, latestEarnings: 91.02, fetchedAt: Date.now() },
};

// Tests

describe("GET /api/stocks/prices", () => {
  it("returns 200 with success=true and price data", async () => {
    mockedFetchPrices.mockResolvedValueOnce({ data: mockPricesData, stale: false });

    const res = await request(buildApp()).get("/api/stocks/prices");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stale).toBe(false);
    expect(res.body.data["HDFCBANK.NS"].cmp).toBe(1750);
  });

  it("returns stale=true when Yahoo Finance returns stale data", async () => {
    mockedFetchPrices.mockResolvedValueOnce({ data: mockPricesData, stale: true });

    const res = await request(buildApp()).get("/api/stocks/prices");

    expect(res.body.stale).toBe(true);
    expect(res.body.success).toBe(true);
  });

  it("returns 500 when Yahoo Finance throws and has no cache", async () => {
    mockedFetchPrices.mockRejectedValueOnce(new Error("Yahoo is down"));

    const app = buildApp();
    app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ success: false, message: _err.message });
    });

    const res = await request(app).get("/api/stocks/prices");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/stocks/fundamentals", () => {
  it("returns 200 with success=true and fundamentals data", async () => {
    mockedFetchFundamentals.mockResolvedValueOnce({ data: mockFundamentalsData, stale: false });

    const res = await request(buildApp()).get("/api/stocks/fundamentals");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data["NSE:HDFCBANK"].peRatio).toBe(18.69);
    expect(res.body.data["NSE:HDFCBANK"].latestEarnings).toBe(91.02);
  });

  it("returns stale=true when fundamentals are from cache", async () => {
    mockedFetchFundamentals.mockResolvedValueOnce({ data: mockFundamentalsData, stale: true });

    const res = await request(buildApp()).get("/api/stocks/fundamentals");

    expect(res.body.stale).toBe(true);
  });

  it("returns empty data object when no fundamentals could be scraped", async () => {
    mockedFetchFundamentals.mockResolvedValueOnce({ data: {}, stale: false });

    const res = await request(buildApp()).get("/api/stocks/fundamentals");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({});
  });
});
