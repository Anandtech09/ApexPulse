import { holdings, SECTORS, ALL_TICKERS, ALL_GOOGLE_TICKERS, TOTAL_COST_BASIS } from "../../config/holdings";

describe("holdings config", () => {
  it("contains 29 holdings", () => {
    expect(holdings).toHaveLength(29);
  });

  it("every holding has a unique id", () => {
    const ids = holdings.map((h) => h.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(holdings.length);
  });

  it("every holding has a valid Yahoo Finance ticker (ends with .NS or .BO)", () => {
    for (const h of holdings) {
      expect(h.ticker).toMatch(/\.(NS|BO)$/);
    }
  });

  it("every holding has a valid Google Finance ticker (format EXCHANGE:SYMBOL)", () => {
    for (const h of holdings) {
      expect(h.googleTicker).toMatch(/^NSE:|^BOM:/);
    }
  });

  it("every holding has a positive purchasePrice", () => {
    for (const h of holdings) {
      expect(h.purchasePrice).toBeGreaterThan(0);
    }
  });

  it("every holding has a positive quantity", () => {
    for (const h of holdings) {
      expect(h.quantity).toBeGreaterThan(0);
    }
  });

  it("all holdings belong to one of the expected sectors", () => {
    const validSectors = ["Financial", "Technology", "Consumer", "Power", "Pipes", "Specialty Chemicals", "Others"];
    for (const h of holdings) {
      expect(validSectors).toContain(h.sector);
    }
  });

  it("SECTORS helper contains the expected sector names", () => {
    expect(SECTORS.sort()).toEqual(
      ["Consumer", "Financial", "Others", "Pipes", "Power", "Specialty Chemicals", "Technology"].sort()
    );
  });

  it("ALL_TICKERS length matches holdings length", () => {
    expect(ALL_TICKERS).toHaveLength(holdings.length);
  });

  it("ALL_GOOGLE_TICKERS length matches holdings length", () => {
    expect(ALL_GOOGLE_TICKERS).toHaveLength(holdings.length);
  });

  it("TOTAL_COST_BASIS is positive and within a reasonable range", () => {
    expect(TOTAL_COST_BASIS).toBeGreaterThan(1_000_000);
    expect(TOTAL_COST_BASIS).toBeLessThan(5_000_000);
  });

  it("stage2 is not a field on Holding (it was removed)", () => {
    for (const h of holdings) {
      expect(Object.prototype.hasOwnProperty.call(h, "stage2")).toBe(false);
    }
  });

  it("every holding has a domain string or null (no empty strings)", () => {
    for (const h of holdings) {
      if (h.domain !== null) {
        expect(typeof h.domain).toBe("string");
        expect(h.domain.length).toBeGreaterThan(0);
        expect(h.domain).toMatch(/\..+/);
      }
    }
  });

  it("advisorNote is not a field on Holding (it was removed)", () => {
    for (const h of holdings) {
      expect(Object.prototype.hasOwnProperty.call(h, "advisorNote")).toBe(false);
    }
  });
});
