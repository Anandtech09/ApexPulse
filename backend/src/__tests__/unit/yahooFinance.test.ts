const mockQuote = jest.fn();

jest.mock("yahoo-finance2", () => {
  return jest.fn().mockImplementation(() => ({
    quote: mockQuote,
  }));
});

import { clearPriceCache } from "../../utils/yahooFinance";
import YahooFinance from "yahoo-finance2";

const mockQuoteResponse = [
  {
    symbol: "HDFCBANK.NS",
    regularMarketPrice: 1750,
    regularMarketChange: 10,
    regularMarketChangePercent: 0.57,
  },
  {
    symbol: "BAJFINANCE.NS",
    regularMarketPrice: 8500,
    regularMarketChange: -50,
    regularMarketChangePercent: -0.58,
  },
];

describe("fetchPrices", () => {
  beforeEach(() => {
    clearPriceCache();
    jest.clearAllMocks();
  });

  it("returns price data for all tickers on success", async () => {
    const { fetchPrices } = await import("../../utils/yahooFinance");
    mockQuote.mockResolvedValueOnce(mockQuoteResponse);

    const result = await fetchPrices(["HDFCBANK.NS", "BAJFINANCE.NS"]);

    expect(result.stale).toBe(false);
    expect(result.data["HDFCBANK.NS"].cmp).toBe(1750);
    expect(result.data["BAJFINANCE.NS"].cmp).toBe(8500);
    expect(result.data["HDFCBANK.NS"].change).toBe(10);
    expect(result.data["BAJFINANCE.NS"].changePercent).toBe(-0.58);
  });

  it("returns cached data without calling Yahoo again within TTL", async () => {
    const { fetchPrices } = await import("../../utils/yahooFinance");
    mockQuote.mockResolvedValueOnce(mockQuoteResponse);

    await fetchPrices(["HDFCBANK.NS"]);
    await fetchPrices(["HDFCBANK.NS"]);

    expect(mockQuote).toHaveBeenCalledTimes(1);
  });

  it("returns stale=true and last cache when Yahoo throws", async () => {
    const { fetchPrices } = await import("../../utils/yahooFinance");

    mockQuote.mockResolvedValueOnce(mockQuoteResponse);
    await fetchPrices(["HDFCBANK.NS"]);

    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 120_000);

    // Second call fails
    mockQuote.mockRejectedValueOnce(new Error("Rate limited"));

    const result = await fetchPrices(["HDFCBANK.NS"]);

    expect(result.stale).toBe(true);
    expect(result.data["HDFCBANK.NS"].cmp).toBe(1750);

    jest.spyOn(Date, "now").mockRestore();
  });

  it("throws when Yahoo fails and there is no cache", async () => {
    const { fetchPrices } = await import("../../utils/yahooFinance");
    mockQuote.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchPrices(["HDFCBANK.NS"])).rejects.toThrow("Network error");
  });

  it("includes fetchedAt timestamp in each quote", async () => {
    const { fetchPrices } = await import("../../utils/yahooFinance");
    mockQuote.mockResolvedValueOnce(mockQuoteResponse);

    const before = Date.now();
    const result = await fetchPrices(["HDFCBANK.NS"]);
    const after = Date.now();

    const fetchedAt = result.data["HDFCBANK.NS"].fetchedAt;
    expect(fetchedAt).toBeGreaterThanOrEqual(before);
    expect(fetchedAt).toBeLessThanOrEqual(after);
  });
});
