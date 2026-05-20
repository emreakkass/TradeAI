import { Router } from "express";
import { db, watchlistTable, aiSignalsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { AddToWatchlistBody } from "@workspace/api-zod";
import { SYMBOLS, getLivePrice } from "../lib/marketData.js";

const router = Router();

router.get("/watchlist", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const items = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, userId));

  const enriched = items.map(item => {
    const sym = SYMBOLS.find(s => s.symbol === item.symbol);
    const { price, change, changePercent } = sym ? getLivePrice(sym) : { price: 100, change: 0, changePercent: 0 };
    return {
      id: item.id, symbol: item.symbol, name: item.name, market: item.market,
      price, change, changePercent,
      aiScore: Math.round(50 + Math.random() * 45),
      signal: ["STRONG_BUY", "BUY", "HOLD", "SELL", "RISKY"][Math.floor(Math.random() * 5)],
      addedAt: item.addedAt.toISOString(),
      alertPrice: item.alertPrice ? Number(item.alertPrice) : null,
    };
  });
  res.json(enriched);
});

router.post("/watchlist", requireAuth, async (req: AuthRequest, res) => {
  const parsed = AddToWatchlistBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const { symbol, market, alertPrice } = parsed.data;
  const userId = req.userId!;

  const existing = await db.select().from(watchlistTable)
    .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, symbol.toUpperCase())))
    .limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Already in watchlist" }); return; }

  const sym = SYMBOLS.find(s => s.symbol === symbol.toUpperCase());
  const name = sym?.name || symbol.toUpperCase();

  const [item] = await db.insert(watchlistTable).values({
    userId,
    symbol: symbol.toUpperCase(),
    name,
    market,
    alertPrice: alertPrice != null ? alertPrice.toString() : null,
  }).returning();

  const liveData = sym ? getLivePrice(sym) : { price: 100, change: 0, changePercent: 0 };
  res.status(201).json({
    id: item.id, symbol: item.symbol, name: item.name, market: item.market,
    ...liveData,
    aiScore: Math.round(50 + Math.random() * 45),
    signal: "HOLD",
    addedAt: item.addedAt.toISOString(),
    alertPrice: item.alertPrice ? Number(item.alertPrice) : null,
  });
});

router.delete("/watchlist/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const userId = req.userId!;
  await db.delete(watchlistTable).where(and(eq(watchlistTable.id, id), eq(watchlistTable.userId, userId)));
  res.json({ message: "Removed from watchlist" });
});

export default router;
