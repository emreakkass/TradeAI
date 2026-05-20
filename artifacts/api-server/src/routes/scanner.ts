import { Router } from "express";
import { db, aiSignalsTable } from "@workspace/db";
import { eq, gte, desc, and, inArray } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import {
  SYMBOLS, getLivePrice, generateTechnicals, computeSignal, computeScores, generateTradeSignal
} from "../lib/marketData.js";
import { AnalyzeSymbolBody } from "@workspace/api-zod";

const router = Router();

async function ensureSignals() {
  const existing = await db.select().from(aiSignalsTable).limit(1);
  if (existing.length > 0) return;

  for (const sym of SYMBOLS) {
    const { price, change, changePercent } = getLivePrice(sym);
    const tech = generateTechnicals(price, sym.market);
    const signal = computeSignal(tech.rsi, tech.macd, price, tech.ema20);
    const scores = computeScores(tech.rsi, tech.macd, signal, changePercent);
    const tradeSignal = generateTradeSignal(signal, price);
    const analysis = `${sym.name} showing ${signal.replace("_", " ")} signal. RSI at ${tech.rsi.toFixed(1)}, ${tech.macd > 0 ? "MACD bullish" : "MACD bearish"}. Key support at ${tech.support.toFixed(2)}, resistance at ${tech.resistance.toFixed(2)}.`;

    await db.insert(aiSignalsTable).values({
      symbol: sym.symbol,
      name: sym.name,
      market: sym.market,
      price: price.toString(),
      change: change.toString(),
      changePercent: changePercent.toString(),
      signal,
      aiScore: scores.aiScore,
      technicalScore: scores.technicalScore,
      sentimentScore: scores.sentimentScore,
      newsScore: scores.newsScore,
      riskScore: scores.riskScore,
      momentumScore: scores.momentumScore,
      volume: tech.volume.toString(),
      marketCap: sym.market !== "FOREX" ? (price * Math.random() * 1e9).toFixed(0) : null,
      analysis,
      entryPrice: tradeSignal.entry.toString(),
      stopLoss: tradeSignal.stopLoss.toString(),
      takeProfit: tradeSignal.takeProfit.toString(),
      riskReward: tradeSignal.riskReward,
      rsi: tech.rsi.toString(),
      macd: tech.macd.toString(),
      ema20: tech.ema20.toString(),
      ema50: tech.ema50.toString(),
      sma200: tech.sma200.toString(),
      bollingerUpper: tech.bollingerUpper.toString(),
      bollingerLower: tech.bollingerLower.toString(),
      support: tech.support.toString(),
      resistance: tech.resistance.toString(),
    });
  }
}

router.get("/scanner/signals", requireAuth, async (req: AuthRequest, res) => {
  await ensureSignals();
  const { market, signal, minScore, limit } = req.query;
  let signals = await db.select().from(aiSignalsTable).orderBy(desc(aiSignalsTable.aiScore));

  if (market && market !== "ALL") signals = signals.filter(s => s.market === market);
  if (signal && signal !== "ALL") signals = signals.filter(s => s.signal === signal);
  if (minScore) signals = signals.filter(s => s.aiScore >= Number(minScore));
  if (limit) signals = signals.slice(0, Number(limit));

  res.json(signals.map(formatSignal));
});

router.get("/scanner/signals/:symbolId", requireAuth, async (req, res) => {
  const id = parseInt(req.params.symbolId);
  const [sig] = await db.select().from(aiSignalsTable).where(eq(aiSignalsTable.id, id)).limit(1);
  if (!sig) { res.status(404).json({ error: "Signal not found" }); return; }
  res.json(formatSignalDetail(sig));
});

router.post("/scanner/analyze", requireAuth, async (req, res) => {
  const parsed = AnalyzeSymbolBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const { symbol, market } = parsed.data;

  const sym = SYMBOLS.find(s => s.symbol === symbol.toUpperCase()) || {
    symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), market: market as any, basePrice: 100, sector: "Other"
  };
  const { price, change, changePercent } = getLivePrice(sym as any);
  const tech = generateTechnicals(price, market);
  const signal = computeSignal(tech.rsi, tech.macd, price, tech.ema20);
  const scores = computeScores(tech.rsi, tech.macd, signal, changePercent);
  const tradeSignal = generateTradeSignal(signal, price);
  const analysis = `AI analysis for ${sym.symbol}: ${signal.replace("_", " ")} signal detected. RSI=${tech.rsi.toFixed(1)}, MACD=${tech.macd > 0 ? "bullish" : "bearish"}, price ${price > tech.ema20 ? "above" : "below"} EMA20. Entry at ${price.toFixed(2)}, Stop Loss ${tradeSignal.stopLoss.toFixed(2)}, Target ${tradeSignal.takeProfit.toFixed(2)}. Risk/Reward: ${tradeSignal.riskReward}.`;

  const [existing] = await db.select().from(aiSignalsTable).where(eq(aiSignalsTable.symbol, sym.symbol)).limit(1);

  const data = {
    symbol: sym.symbol, name: sym.name, market: sym.market as any,
    price: price.toString(), change: change.toString(), changePercent: changePercent.toString(),
    signal, aiScore: scores.aiScore, technicalScore: scores.technicalScore,
    sentimentScore: scores.sentimentScore, newsScore: scores.newsScore,
    riskScore: scores.riskScore, momentumScore: scores.momentumScore,
    volume: tech.volume.toString(), analysis,
    entryPrice: tradeSignal.entry.toString(), stopLoss: tradeSignal.stopLoss.toString(),
    takeProfit: tradeSignal.takeProfit.toString(), riskReward: tradeSignal.riskReward,
    rsi: tech.rsi.toString(), macd: tech.macd.toString(), ema20: tech.ema20.toString(),
    ema50: tech.ema50.toString(), sma200: tech.sma200.toString(),
    bollingerUpper: tech.bollingerUpper.toString(), bollingerLower: tech.bollingerLower.toString(),
    support: tech.support.toString(), resistance: tech.resistance.toString(),
    updatedAt: new Date(),
  };

  let sig;
  if (existing) {
    [sig] = await db.update(aiSignalsTable).set(data).where(eq(aiSignalsTable.id, existing.id)).returning();
  } else {
    [sig] = await db.insert(aiSignalsTable).values(data).returning();
  }
  res.json(formatSignalDetail(sig));
});

function formatSignal(s: any) {
  return {
    id: s.id, symbol: s.symbol, name: s.name, market: s.market,
    price: Number(s.price), change: Number(s.change), changePercent: Number(s.changePercent),
    signal: s.signal, aiScore: s.aiScore, technicalScore: s.technicalScore,
    sentimentScore: s.sentimentScore, newsScore: s.newsScore, riskScore: s.riskScore,
    momentumScore: s.momentumScore, volume: Number(s.volume),
    marketCap: s.marketCap ? Number(s.marketCap) : null,
    updatedAt: s.updatedAt.toISOString(),
  };
}

function formatSignalDetail(s: any) {
  return {
    ...formatSignal(s),
    analysis: s.analysis,
    tradeSignal: {
      action: s.entryPrice > 0 ? (s.signal === "SELL" ? "SELL" : s.signal === "HOLD" ? "HOLD" : "BUY") : "HOLD",
      entry: Number(s.entryPrice),
      stopLoss: Number(s.stopLoss),
      takeProfit: Number(s.takeProfit),
      riskReward: s.riskReward,
    },
    technicalIndicators: {
      rsi: Number(s.rsi), macd: Number(s.macd), ema20: Number(s.ema20),
      ema50: Number(s.ema50), sma200: Number(s.sma200),
      bollingerUpper: Number(s.bollingerUpper), bollingerLower: Number(s.bollingerLower),
      volume24h: Number(s.volume), support: Number(s.support), resistance: Number(s.resistance),
    },
  };
}

export default router;
