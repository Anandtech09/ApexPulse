import axios from "axios";
import { clearFundamentalsCache } from "../../utils/googleFinance";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Minimal HTML that mimics a Google Finance quote page with P/E and EPS data
const mockHtml = `
<html><body>
  <div data-attrid="pe_ratio">
    <div class="P6K39c">P/E ratio</div>
    <div class="YMlKec">18.5</div>
  </div>
  <div data-attrid="eps">
    <div class="P6K39c">EPS</div>
    <div class="YMlKec">91.02</div>
  </div>
</body></html>
`;

const emptyHtml = `<html><body><p>No data</p></body></html>`;

describe("fetchAllFundamentals", () => {
  beforeEach(() => {
    clearFundamentalsCache();
    jest.clearAllMocks();
  });

  it("returns peRatio and latestEarnings when page has data", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");
    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    const result = await fetchAllFundamentals(["NSE:HDFCBANK"]);

    expect(result.stale).toBe(false);
    expect(result.data["NSE:HDFCBANK"]).toBeDefined();
    expect(result.data["NSE:HDFCBANK"].peRatio).toBe(18.5);
    expect(result.data["NSE:HDFCBANK"].latestEarnings).toBe(91.02);
  });

  it("returns null for peRatio and earnings when page has no matching data", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");
    mockedAxios.get.mockResolvedValue({ data: emptyHtml });

    const result = await fetchAllFundamentals(["NSE:HDFCBANK"]);

    expect(result.data["NSE:HDFCBANK"].peRatio).toBeNull();
    expect(result.data["NSE:HDFCBANK"].latestEarnings).toBeNull();
  });

  it("returns null fields when scraping throws — does not block other tickers", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");

    mockedAxios.get
      .mockRejectedValueOnce(new Error("403 Forbidden"))
      .mockResolvedValueOnce({ data: mockHtml });         

    const result = await fetchAllFundamentals(["NSE:HDFCBANK", "NSE:LTIM"]);

    expect(result.data["NSE:HDFCBANK"].peRatio).toBeNull();
    expect(result.data["NSE:LTIM"].peRatio).toBe(18.5);
  });

  it("returns cached data without calling axios again within TTL", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");
    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    await fetchAllFundamentals(["NSE:HDFCBANK"]);
    await fetchAllFundamentals(["NSE:HDFCBANK"]);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("builds the correct Google Finance URL from the googleTicker", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");
    mockedAxios.get.mockResolvedValue({ data: emptyHtml });

    await fetchAllFundamentals(["NSE:HDFCBANK"]);

    const calledUrl = mockedAxios.get.mock.calls[0][0] as string;
    expect(calledUrl).toContain("HDFCBANK:NSE");
  });

  it("includes fetchedAt timestamp on every result", async () => {
    const { fetchAllFundamentals } = await import("../../utils/googleFinance");
    mockedAxios.get.mockResolvedValue({ data: mockHtml });

    const before = Date.now();
    const result = await fetchAllFundamentals(["NSE:HDFCBANK"]);
    const after = Date.now();

    expect(result.data["NSE:HDFCBANK"].fetchedAt).toBeGreaterThanOrEqual(before);
    expect(result.data["NSE:HDFCBANK"].fetchedAt).toBeLessThanOrEqual(after);
  });
});
