import { Router } from "express";
import { db, portfoliosTable, tradesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { SYMBOLS, getLivePrice } from "../lib/marketData.js";

const router = Router();

router.get("/portfolio", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  let [portfolio] = await db.select().from(portfoliosTable).where(eq(portfoliosTable.userId, userId)).limit(1);

  if (!portfolio) {
    [portfolio] = await db.insert(portfoliosTable).values({
      userId, totalValue: "50000", cashBalance: "50000",
      investedAmount: "0", totalPnl: "0", totalPnlPercent: "0", dayPnl: "0", dayPnlPercent: "0",
    }).returning();
  }
  res.json({
    id: portfolio.id, userId: portfolio.userId,
    totalValue: Number(portfolio.totalValue),
    cashBalance: Number(portfolio.cashBalance),
    investedAmount: Number(portfolio.investedAmount),
    totalPnl: Number(portfolio.totalPnl),
    totalPnlPercent: Number(portfolio.totalPnlPercent),
    dayPnl: Number(portfolio.dayPnl),
    dayPnlPercent: Number(portfolio.dayPnlPercent),
  });
});

router.get("/portfolio/positions", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const openTrades = await db.select().from(tradesTable)
    .where(and(eq(tradesTable.userId, userId), eq(tradesTable.status, "OPEN")));

  const positions = openTrades.map(t => {
    const sym = SYMBOLS.find(s => s.symbol === t.symbol);
    const { price: currentPrice } = sym ? getLivePrice(sym) : { price: Number(t.price) };
    const pnl = (currentPrice - Number(t.price)) * Number(t.quantity);
    const pnlPercent = ((currentPrice - Number(t.price)) / Number(t.price)) * 100;
    return {
      id: t.id, symbol: t.symbol, name: t.name, market: t.market,
      quantity: Number(t.quantity), avgPrice: Number(t.price),
      currentPrice, totalValue: currentPrice * Number(t.quantity),
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round(pnlPercent * 100) / 100,
      openedAt: t.createdAt.toISOString(),
      isPaper: t.isPaper,
    };
  });
  res.json(positions);
});

router.get("/portfolio/summary", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const [portfolio] = await db.select().from(portfoliosTable).where(eq(portfoliosTable.userId, userId)).limit(1);
  const allTrades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
  const closed = allTrades.filter(t => t.status === "CLOSED");
  const wins = closed.filter(t => Number(t.pnl ?? 0) > 0);
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const pnls = closed.map(t => Number(t.pnl ?? 0));
  const best = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worst = pnls.length > 0 ? Math.min(...pnls) : 0;
  const totalValue = portfolio ? Number(portfolio.totalValue) : 50000;
  const totalPnl = portfolio ? Number(portfolio.totalPnl) : 0;
  const dayPnl = portfolio ? Number(portfolio.dayPnl) : 0;
  res.json({
    totalValue,
    dayPnl, dayPnlPercent: totalValue > 0 ? (dayPnl / totalValue) * 100 : 0,
    totalPnl, totalPnlPercent: portfolio ? Number(portfolio.totalPnlPercent) : 0,
    winRate: Math.round(winRate * 10) / 10,
    totalTrades: allTrades.length,
    bestTrade: best, worstTrade: worst,
  });
});

export default router;
