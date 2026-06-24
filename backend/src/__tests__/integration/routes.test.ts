import request from "supertest";
import express from "express";
import router from "../../routes";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  return app;
}

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(buildApp()).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("GET /api/portfolio", () => {
  it("returns 200 with success=true and a non-empty data array", async () => {
    const res = await request(buildApp()).get("/api/portfolio");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("each holding in the response has required fields", async () => {
    const res = await request(buildApp()).get("/api/portfolio");
    const required = [
      "id", "name", "ticker", "googleTicker", "exchange",
      "sector", "purchasePrice", "quantity", "domain",
    ];

    for (const holding of res.body.data) {
      for (const field of required) {
        expect(holding).toHaveProperty(field);
      }
      expect(holding).not.toHaveProperty("advisorNote");
    }
  });

  it("returns exactly 29 holdings", async () => {
    const res = await request(buildApp()).get("/api/portfolio");
    expect(res.body.data).toHaveLength(29);
  });

  it("all returned tickers end with .NS or .BO", async () => {
    const res = await request(buildApp()).get("/api/portfolio");
    for (const holding of res.body.data) {
      expect(holding.ticker).toMatch(/\.(NS|BO)$/);
    }
  });
});
