import { Router } from "express";
import { db, tradesTable, aiSignalsTable, portfoliosTable } from "@workspace/db";
import { eq, desc, count, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { SYMBOLS, getLivePrice, generateTechnicals, computeSignal, computeScores, generateTradeSignal } from "../lib/marketData.js";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const [portfolio] = await db.select().from(portfoliosTable).where(eq(portfoliosTable.userId, userId)).limit(1);

  const allTrades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
  const closedTrades = allTrades.filter(t => t.status === "CLOSED");
  const winningTrades = closedTrades.filter(t => Number(t.pnl ?? 0) > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  const [signalCount] = await db.select({ count: count() }).from(aiSignalsTable);
  const openPositions = allTrades.filter(t => t.status === "OPEN" && !t.isPaper).length;

  const totalValue = portfolio ? Number(portfolio.totalValue) : 50000;
  const dayPnl = portfolio ? Number(portfolio.dayPnl) : randomPnl(totalValue);
  const dayPnlPercent = portfolio ? Number(portfolio.dayPnlPercent) : (dayPnl / totalValue) * 100;
  const totalPnl = portfolio ? Number(portfolio.totalPnl) : 0;
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  res.json({
    totalPortfolioValue: totalValue,
    dailyPnl: dayPnl,
    dailyPnlPercent: dayPnlPercent,
    totalPnl,
    totalPnlPercent,
    activeSignals: signalCount?.count ?? 20,
    winRate: Math.round(winRate * 10) / 10,
    paperBalance: Number(req.user?.paperBalance ?? 100000),
    openPositions,
    totalTrades: allTrades.length,
  });
});

function randomPnl(base: number): number {
  return Math.round((Math.random() * 2 - 0.8) * base * 0.03 * 100) / 100;
}

router.get("/dashboard/portfolio-chart", requireAuth, async (req: AuthRequest, res) => {
  const period = (req.query.period as string) || "1M";
  const days = period === "1D" ? 1 : period === "1W" ? 7 : period === "1M" ? 30 : period === "3M" ? 90 : 365;
  const points: { date: string; value: number; change: number }[] = [];
  let value = 47000 + Math.random() * 6000;

  const now = new Date();
  const intervals = Math.min(days, period === "1D" ? 24 : days);
  for (let i = intervals; i >= 0; i--) {
    const d = new Date(now);
    if (period === "1D") d.setHours(d.getHours() - i);
    else d.setDate(d.getDate() - i);

    const change = (Math.random() * 2 - 0.7) * (period === "1D" ? 80 : 400);
    value = Math.max(30000, value + change);
    points.push({
      date: d.toISOString(),
      value: Math.round(value * 100) / 100,
      change: Math.round(change * 100) / 100,
    });
  }
  res.json(points);
});

router.get("/dashboard/market-heatmap", requireAuth, async (_req, res) => {
  const sectors = ["Technology", "Healthcare", "Financials", "Energy", "Consumer", "Utilities", "Real Estate", "Materials"];
  const items = SYMBOLS.slice(0, 16).map(sym => {
    const { changePercent } = getLivePrice(sym);
    return {
      sector: sym.sector,
      symbol: sym.symbol,
      name: sym.name,
      change: Math.round(changePercent * 100) / 100,
      value: Math.abs(changePercent),
    };
  });
  // Add sector-level items
  sectors.forEach(sector => {
    const sectorItems = items.filter(i => i.sector === sector);
    if (sectorItems.length === 0) {
      items.push({ sector, symbol: sector.toUpperCase().slice(0, 4), name: sector, change: Math.round((Math.random() * 4 - 2) * 100) / 100, value: Math.random() * 3 });
    }
  });
  res.json(items);
});

router.get("/dashboard/top-movers", requireAuth, async (_req, res) => {
  const movers = SYMBOLS.map(sym => {
    const { price, change, changePercent } = getLivePrice(sym);
    return { symbol: sym.symbol, name: sym.name, price, change, changePercent, volume: Math.round(Math.random() * 50_000_000), market: sym.market };
  });
  const sorted = movers.sort((a, b) => b.changePercent - a.changePercent);
  res.json({
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  });
});

export default router;
