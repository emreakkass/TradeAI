import { Router } from "express";
import { db, tradesTable, portfoliosTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { CreateTradeBody, UpdateTradeBody } from "@workspace/api-zod";
import { SYMBOLS, getLivePrice } from "../lib/marketData.js";

const router = Router();

function fmt(t: any) {
  return {
    id: t.id, symbol: t.symbol, name: t.name, market: t.market,
    type: t.type, quantity: Number(t.quantity), price: Number(t.price),
    totalValue: Number(t.totalValue),
    stopLoss: t.stopLoss ? Number(t.stopLoss) : null,
    takeProfit: t.takeProfit ? Number(t.takeProfit) : null,
    status: t.status, isPaper: t.isPaper,
    pnl: t.pnl != null ? Number(t.pnl) : null,
    pnlPercent: t.pnlPercent != null ? Number(t.pnlPercent) : null,
    closedAt: t.closedAt ? t.closedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    aiSignalId: t.aiSignalId ?? null,
  };
}

router.get("/trades", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { status, limit } = req.query;
  let trades = await db.select().from(tradesTable)
    .where(eq(tradesTable.userId, userId))
    .orderBy(desc(tradesTable.createdAt));
  if (status && status !== "ALL") {
    if (status === "PAPER") trades = trades.filter(t => t.isPaper);
    else trades = trades.filter(t => t.status === status);
  }
  if (limit) trades = trades.slice(0, Number(limit));
  res.json(trades.map(fmt));
});

router.post("/trades", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateTradeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const userId = req.userId!;
  const { symbol, market, type, quantity, price, stopLoss, takeProfit, isPaper, aiSignalId } = parsed.data;

  const sym = SYMBOLS.find(s => s.symbol === symbol.toUpperCase());
  const name = sym?.name || symbol.toUpperCase();
  const totalValue = quantity * price;

  const [trade] = await db.insert(tradesTable).values({
    userId, symbol: symbol.toUpperCase(), name, market, type, isPaper,
    quantity: quantity.toString(), price: price.toString(),
    totalValue: totalValue.toString(),
    stopLoss: stopLoss != null ? stopLoss.toString() : null,
    takeProfit: takeProfit != null ? takeProfit.toString() : null,
    status: "OPEN", aiSignalId: aiSignalId ?? null,
  }).returning();

  // Update paper balance if paper trade
  if (isPaper && type === "BUY") {
    const user = req.user!;
    const newBalance = Math.max(0, Number(user.paperBalance) - totalValue);
    await db.update(usersTable).set({ paperBalance: newBalance.toString() }).where(eq(usersTable.id, userId));
  }

  res.status(201).json(fmt(trade));
});

router.get("/trades/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const userId = req.userId!;
  const [trade] = await db.select().from(tradesTable)
    .where(and(eq(tradesTable.id, id), eq(tradesTable.userId, userId))).limit(1);
  if (!trade) { res.status(404).json({ error: "Trade not found" }); return; }
  res.json(fmt(trade));
});

router.patch("/trades/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const userId = req.userId!;
  const parsed = UpdateTradeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }

  const [trade] = await db.select().from(tradesTable)
    .where(and(eq(tradesTable.id, id), eq(tradesTable.userId, userId))).limit(1);
  if (!trade) { res.status(404).json({ error: "Trade not found" }); return; }

  const updates: any = {};
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.stopLoss != null) updates.stopLoss = parsed.data.stopLoss.toString();
  if (parsed.data.takeProfit != null) updates.takeProfit = parsed.data.takeProfit.toString();
  if (parsed.data.status === "CLOSED" && parsed.data.closePrice) {
    const closePrice = parsed.data.closePrice;
    const pnl = (closePrice - Number(trade.price)) * Number(trade.quantity) * (trade.type === "BUY" ? 1 : -1);
    const pnlPct = (pnl / Number(trade.totalValue)) * 100;
    updates.pnl = pnl.toString();
    updates.pnlPercent = pnlPct.toString();
    updates.closedAt = new Date();
  }

  const [updated] = await db.update(tradesTable).set(updates).where(eq(tradesTable.id, id)).returning();
  res.json(fmt(updated));
});

export default router;
