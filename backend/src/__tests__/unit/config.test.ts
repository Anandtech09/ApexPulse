import { config } from "../../config";

describe("config module", () => {
  it("port is a valid number", () => {
    expect(typeof config.port).toBe("number");
    expect(config.port).toBeGreaterThan(0);
  });

  it("nodeEnv is 'test' when running tests", () => {
    expect(config.nodeEnv).toBe("test");
  });

  it("cache TTLs are positive numbers", () => {
    expect(config.cache.priceTtl).toBeGreaterThan(0);
    expect(config.cache.fundamentalsTtl).toBeGreaterThan(0);
  });

  it("fundamentals TTL is longer than price TTL", () => {
    expect(config.cache.fundamentalsTtl).toBeGreaterThan(config.cache.priceTtl);
  });

  it("yahooFinance.timeout is a positive number", () => {
    expect(config.yahooFinance.timeout).toBeGreaterThan(0);
  });

  it("yahooFinance.lang and region are non-empty strings", () => {
    expect(config.yahooFinance.lang.length).toBeGreaterThan(0);
    expect(config.yahooFinance.region.length).toBeGreaterThan(0);
  });

  it("googleFinance.timeout is a positive number", () => {
    expect(config.googleFinance.timeout).toBeGreaterThan(0);
  });

  it("googleFinance.baseUrl starts with https://", () => {
    expect(config.googleFinance.baseUrl).toBeDefined();
    expect(config.googleFinance.baseUrl!).toMatch(/^https:\/\//);
  });

  it("googleFinance.concurrency is at least 1", () => {
    expect(config.googleFinance.concurrency).toBeGreaterThanOrEqual(1);
  });

  it("googleFinance.userAgent is a non-empty string", () => {
    expect(config.googleFinance.userAgent).toBeDefined();
    expect(config.googleFinance.userAgent!.length).toBeGreaterThan(0);
  });
});
