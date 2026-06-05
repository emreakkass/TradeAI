import { Router } from "express";
import Parser from "rss-parser";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();
const rssParser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; TradeAI/1.0)" },
  customFields: {
    item: [["media:content", "media"], ["description", "description"]],
  },
});

interface NewsArticle {
  id: number;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number;
  summary: string;
  relatedSymbols: string[];
  imageUrl: string | null;
}

interface CacheEntry {
  articles: NewsArticle[];
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const RSS_FEEDS = [
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^IXIC,^GSPC,BTC-USD&region=US&lang=en-US", source: "Yahoo Finance" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
  { url: "https://feeds.marketwatch.com/marketwatch/topstories/", source: "MarketWatch" },
  { url: "https://feeds.bloomberg.com/markets/news.rss", source: "Bloomberg" },
  { url: "https://feeds.reuters.com/reuters/businessNews", source: "Reuters" },
];

const POSITIVE_WORDS = new Set([
  "surge", "surged", "surging", "rally", "rallied", "rallying", "gain", "gained", "gaining",
  "rise", "risen", "rising", "rises", "profit", "profits", "growth", "grew", "beat",
  "record", "strong", "bullish", "bull", "up", "positive", "breakthrough", "outperform",
  "upgrade", "upgraded", "boost", "boosted", "soar", "soaring", "soared", "jump", "jumped",
  "jumping", "recover", "recovery", "rebound", "advance", "advancing", "high", "higher",
  "victory", "win", "winning", "exceed", "exceeded", "approval", "approved", "buy",
]);

const NEGATIVE_WORDS = new Set([
  "fall", "fell", "falling", "drop", "dropped", "dropping", "crash", "crashed", "crashing",
  "loss", "losses", "decline", "declined", "declining", "miss", "missed", "weak", "bearish",
  "bear", "down", "negative", "struggle", "struggling", "underperform", "warning", "risk",
  "downgrade", "downgraded", "cut", "cuts", "plunge", "plunged", "plunging", "sink", "sinking",
  "sank", "tumble", "tumbled", "tumbling", "slump", "slumped", "slumping", "recession",
  "layoff", "layoffs", "bankruptcy", "bankrupt", "debt", "inflation", "tariff", "tariffs",
  "sanction", "sanctions", "concern", "fears", "fear", "worried", "worry", "crisis",
]);

const KNOWN_SYMBOLS = [
  "AAPL", "NVDA", "TSLA", "MSFT", "GOOGL", "META", "AMZN", "AMD", "NFLX", "JPM",
  "BAC", "GS", "XOM", "BTC", "ETH", "SOL", "DOGE", "GARAN", "THYAO", "EURUSD",
  "GBPUSD", "USDJPY", "SP500", "NASDAQ", "SPY", "QQQ", "INTC", "ARM", "PLTR",
];

function detectSentiment(text: string): { sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; score: number } {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/);
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  if (pos === 0 && neg === 0) return { sentiment: "NEUTRAL", score: 0.5 };
  const total = pos + neg;
  const score = pos / total;
  if (score > 0.55) return { sentiment: "POSITIVE", score: Math.min(0.6 + (score - 0.55) * 3, 0.99) };
  if (score < 0.45) return { sentiment: "NEGATIVE", score: Math.max(0.4 - (0.45 - score) * 3, 0.01) };
  return { sentiment: "NEUTRAL", score: 0.5 };
}

function extractSymbols(text: string): string[] {
  const found: string[] = [];
  const upper = text.toUpperCase();
  for (const sym of KNOWN_SYMBOLS) {
    if (upper.includes(sym) || upper.includes(sym.replace("USD", ""))) {
      if (!found.includes(sym)) found.push(sym);
    }
  }
  return found.slice(0, 4);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

async function fetchFeed(feedConfig: typeof RSS_FEEDS[0]): Promise<NewsArticle[]> {
  try {
    const feed = await rssParser.parseURL(feedConfig.url);
    return (feed.items || []).slice(0, 12).map((item, idx) => {
      const title = stripHtml(item.title || "");
      const rawSummary = item.contentSnippet || item.summary || item.content || item.description || "";
      const summary = stripHtml(rawSummary).slice(0, 400) || title;
      const text = `${title} ${summary}`;
      const { sentiment, score } = detectSentiment(text);
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      return {
        id: idx,
        title,
        source: feedConfig.source,
        url: item.link || item.guid || "#",
        publishedAt: pubDate.toISOString(),
        sentiment,
        sentimentScore: score,
        summary: summary || title,
        relatedSymbols: extractSymbols(text),
        imageUrl: null,
      };
    });
  } catch {
    return [];
  }
}

async function getLiveNews(): Promise<NewsArticle[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.articles;
  }

  // Fetch all feeds in parallel with a timeout
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchFeed(feed))
  );

  const allArticles: NewsArticle[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  });

  // Deduplicate by title similarity and sort by date
  const seen = new Set<string>();
  const deduped: NewsArticle[] = [];
  for (const article of allArticles) {
    const key = article.title.slice(0, 60).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(article);
    }
  }

  // Sort newest first
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Re-assign sequential IDs
  const articles = deduped.map((a, i) => ({ ...a, id: i + 1 }));

  cache = { articles, fetchedAt: now };
  return articles;
}

router.get("/news", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const articles = await getLiveNews();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

router.get("/news/sentiment-summary", requireAuth, async (_req: AuthRequest, res) => {
  try {
    const articles = await getLiveNews();
    const pos = articles.filter(a => a.sentiment === "POSITIVE").length;
    const neg = articles.filter(a => a.sentiment === "NEGATIVE").length;
    const neu = articles.filter(a => a.sentiment === "NEUTRAL").length;
    const total = articles.length || 1;
    const bullPct = (pos / total) * 100;
    const bearPct = (neg / total) * 100;

    // Find most mentioned bullish symbols
    const symbolCounts: Record<string, number> = {};
    for (const article of articles.filter(a => a.sentiment === "POSITIVE")) {
      for (const sym of article.relatedSymbols) {
        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1;
      }
    }
    const topBullish = Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sym]) => sym);

    res.json({
      overall: bullPct > 50 ? "BULLISH" : bearPct > 50 ? "BEARISH" : "NEUTRAL",
      positive: pos, negative: neg, neutral: neu,
      bullishPercent: Math.round(bullPct * 10) / 10,
      bearishPercent: Math.round(bearPct * 10) / 10,
      topBullishSymbols: topBullish.length > 0 ? topBullish : ["NVDA", "AAPL", "MSFT"],
      topBearishSymbols: ["TSLA", "INTC"],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sentiment" });
  }
});

export default router;
