import { Router } from "express";
import { db, newsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { NEWS_HEADLINES } from "../lib/marketData.js";

const router = Router();

async function seedNews() {
  const existing = await db.select().from(newsTable).limit(1);
  if (existing.length > 0) return;

  const sources = ["Bloomberg", "Reuters", "Yahoo Finance", "Investing.com", "CoinDesk", "CNBC"];
  const now = new Date();

  for (let i = 0; i < NEWS_HEADLINES.length; i++) {
    const h = NEWS_HEADLINES[i];
    const publishedAt = new Date(now.getTime() - i * 45 * 60 * 1000);
    await db.insert(newsTable).values({
      title: h.title,
      source: h.source,
      url: `https://example.com/news/${i + 1}`,
      imageUrl: null,
      summary: `${h.title}. This development is expected to have significant implications for markets. Analysts are closely watching the situation for further developments.`,
      sentiment: h.sentiment,
      sentimentScore: h.score.toString(),
      relatedSymbols: i % 3 === 0 ? ["NVDA", "AAPL"] : i % 3 === 1 ? ["BTC", "ETH"] : ["TSLA", "AMZN"],
      publishedAt,
    });
  }
}

function fmt(n: any) {
  return {
    id: n.id, title: n.title, source: n.source, url: n.url,
    publishedAt: n.publishedAt.toISOString(),
    sentiment: n.sentiment,
    sentimentScore: Number(n.sentimentScore),
    summary: n.summary,
    relatedSymbols: Array.isArray(n.relatedSymbols) ? n.relatedSymbols : [],
    imageUrl: n.imageUrl ?? null,
  };
}

router.get("/news", requireAuth, async (req: AuthRequest, res) => {
  await seedNews();
  const { symbol, sentiment, limit } = req.query;
  let articles = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  if (sentiment && sentiment !== "ALL") articles = articles.filter(a => a.sentiment === sentiment);
  if (symbol) articles = articles.filter(a => Array.isArray(a.relatedSymbols) && (a.relatedSymbols as string[]).includes(symbol as string));
  if (limit) articles = articles.slice(0, Number(limit));
  res.json(articles.map(fmt));
});

router.post("/news/:id/analyze", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [article] = await db.select().from(newsTable).where(eq(newsTable.id, id)).limit(1);
  if (!article) { res.status(404).json({ error: "Article not found" }); return; }
  res.json({
    articleId: id,
    summary: article.summary,
    sentiment: article.sentiment,
    sentimentScore: Number(article.sentimentScore),
    impact: Number(article.sentimentScore) > 0.5 ? "Strongly Positive — likely to drive buying pressure" :
      Number(article.sentimentScore) < -0.5 ? "Strongly Negative — likely to increase selling pressure" :
        "Moderate — mixed market reaction expected",
    relatedSymbols: Array.isArray(article.relatedSymbols) ? article.relatedSymbols : [],
  });
});

router.get("/news/sentiment-summary", requireAuth, async (_req, res) => {
  await seedNews();
  const articles = await db.select().from(newsTable);
  const pos = articles.filter(a => a.sentiment === "POSITIVE").length;
  const neg = articles.filter(a => a.sentiment === "NEGATIVE").length;
  const neu = articles.filter(a => a.sentiment === "NEUTRAL").length;
  const total = articles.length || 1;
  const bullPct = (pos / total) * 100;
  const bearPct = (neg / total) * 100;
  res.json({
    overall: bullPct > 50 ? "BULLISH" : bearPct > 50 ? "BEARISH" : "NEUTRAL",
    positive: pos, negative: neg, neutral: neu,
    bullishPercent: Math.round(bullPct * 10) / 10,
    bearishPercent: Math.round(bearPct * 10) / 10,
    topBullishSymbols: ["NVDA", "AAPL", "MSFT"],
    topBearishSymbols: ["TSLA", "INTC"],
  });
});

export default router;
