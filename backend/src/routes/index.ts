import { Router } from "express";
import { getHoldings } from "../controllers/portfolioController";
import { getLivePrices, getFundamentals } from "../controllers/stockController";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/portfolio", getHoldings);
router.get("/stocks/prices", getLivePrices);
router.get("/stocks/fundamentals", getFundamentals);

export default router;
