// Realistic market data generator for demo purposes
// In production this would connect to Alpha Vantage / Finnhub / Binance APIs

export interface SymbolData {
  symbol: string;
  name: string;
  market: "NASDAQ" | "NYSE" | "BIST" | "CRYPTO" | "FOREX";
  basePrice: number;
  sector: string;
  smallCap?: boolean;
}

export const SYMBOLS: SymbolData[] = [
  // NASDAQ Large-Cap
  { symbol: "NVDA", name: "NVIDIA Corporation", market: "NASDAQ", basePrice: 875.4, sector: "Technology" },
  { symbol: "AAPL", name: "Apple Inc.", market: "NASDAQ", basePrice: 189.5, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", market: "NASDAQ", basePrice: 415.2, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "NASDAQ", basePrice: 248.3, sector: "Consumer Discretionary" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "NASDAQ", basePrice: 182.7, sector: "Consumer Discretionary" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "NASDAQ", basePrice: 165.8, sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", market: "NASDAQ", basePrice: 519.4, sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices", market: "NASDAQ", basePrice: 154.6, sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", market: "NASDAQ", basePrice: 31.2, sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", market: "NASDAQ", basePrice: 642.1, sector: "Communication Services" },

  // NYSE Large-Cap
  { symbol: "JPM", name: "JPMorgan Chase & Co.", market: "NYSE", basePrice: 198.4, sector: "Financials" },
  { symbol: "BAC", name: "Bank of America Corp.", market: "NYSE", basePrice: 38.7, sector: "Financials" },
  { symbol: "GS", name: "Goldman Sachs Group", market: "NYSE", basePrice: 468.2, sector: "Financials" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", market: "NYSE", basePrice: 112.3, sector: "Energy" },

  // CRYPTO - Major
  { symbol: "BTC", name: "Bitcoin", market: "CRYPTO", basePrice: 67450.0, sector: "Crypto" },
  { symbol: "ETH", name: "Ethereum", market: "CRYPTO", basePrice: 3580.0, sector: "Crypto" },
  { symbol: "SOL", name: "Solana", market: "CRYPTO", basePrice: 145.2, sector: "Crypto" },
  { symbol: "BNB", name: "Binance Coin", market: "CRYPTO", basePrice: 412.5, sector: "Crypto" },
  { symbol: "AVAX", name: "Avalanche", market: "CRYPTO", basePrice: 36.8, sector: "Crypto" },
  { symbol: "LINK", name: "Chainlink", market: "CRYPTO", basePrice: 14.6, sector: "Crypto" },

  // CRYPTO - Altcoin/Meme (Small-Cap, high volatility)
  { symbol: "DOGE", name: "Dogecoin", market: "CRYPTO", basePrice: 0.148, sector: "Meme Token", smallCap: true },
  { symbol: "PEPE", name: "Pepe Coin", market: "CRYPTO", basePrice: 0.0000128, sector: "Meme Token", smallCap: true },
  { symbol: "SHIB", name: "Shiba Inu", market: "CRYPTO", basePrice: 0.0000248, sector: "Meme Token", smallCap: true },
  { symbol: "ARB", name: "Arbitrum", market: "CRYPTO", basePrice: 0.82, sector: "DeFi", smallCap: true },
  { symbol: "MATIC", name: "Polygon", market: "CRYPTO", basePrice: 0.58, sector: "DeFi", smallCap: true },

  // BIST Large-Cap
  { symbol: "THYAO", name: "Türk Hava Yolları", market: "BIST", basePrice: 284.5, sector: "Airlines" },
  { symbol: "GARAN", name: "Garanti Bankası", market: "BIST", basePrice: 123.8, sector: "Financials" },
  { symbol: "AKBNK", name: "Akbank", market: "BIST", basePrice: 58.4, sector: "Financials" },
  { symbol: "ISCTR", name: "İş Bankası", market: "BIST", basePrice: 14.2, sector: "Financials" },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", market: "BIST", basePrice: 42.1, sector: "Materials" },
  { symbol: "ASELS", name: "Aselsan", market: "BIST", basePrice: 88.6, sector: "Defense" },
  { symbol: "KCHOL", name: "Koç Holding", market: "BIST", basePrice: 172.4, sector: "Conglomerates" },
  { symbol: "KOZAL", name: "Koza Altın", market: "BIST", basePrice: 214.0, sector: "Mining" },
  { symbol: "ENKAI", name: "Enka İnşaat", market: "BIST", basePrice: 48.9, sector: "Construction" },
  { symbol: "PETKM", name: "Petkim", market: "BIST", basePrice: 18.6, sector: "Chemicals" },

  // BIST Small-Cap / Yan Tahtalar (Yüksek Volatilite)
  { symbol: "KONTR", name: "Kontrolmatik Teknoloji", market: "BIST", basePrice: 14.8, sector: "Technology", smallCap: true },
  { symbol: "MIATK", name: "Mi Teknoloji", market: "BIST", basePrice: 8.2, sector: "Technology", smallCap: true },
  { symbol: "BRSAN", name: "Borusan Mannesmann", market: "BIST", basePrice: 156.4, sector: "Materials", smallCap: true },
  { symbol: "YEOTK", name: "Yeşil Elektrik Üretim", market: "BIST", basePrice: 22.6, sector: "Energy", smallCap: true },
  { symbol: "SMRTG", name: "Smartiks Yazılım", market: "BIST", basePrice: 11.4, sector: "Technology", smallCap: true },
  { symbol: "ASTOR", name: "Astor Enerji", market: "BIST", basePrice: 45.8, sector: "Energy", smallCap: true },
  { symbol: "KLGYO", name: "Kılıç GYO", market: "BIST", basePrice: 38.2, sector: "Real Estate", smallCap: true },
  { symbol: "SASA", name: "SASA Polyester", market: "BIST", basePrice: 94.6, sector: "Chemicals", smallCap: true },

  // FOREX
  { symbol: "EURUSD", name: "EUR/USD", market: "FOREX", basePrice: 1.0845, sector: "Forex" },
  { symbol: "GBPUSD", name: "GBP/USD", market: "FOREX", basePrice: 1.2734, sector: "Forex" },
  { symbol: "USDJPY", name: "USD/JPY", market: "FOREX", basePrice: 151.42, sector: "Forex" },
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function round(n: number, d = 4): number {
  return Math.round(n * 10 ** d) / 10 ** d;
}

export function getLivePrice(sym: SymbolData): { price: number; change: number; changePercent: number } {
  // Small-caps are 3-4x more volatile (Tavan/Taban potansiyeli)
  const baseVol = sym.market === "CRYPTO" ? 0.06 : sym.market === "FOREX" ? 0.003 : 0.025;
  const volatility = sym.smallCap ? baseVol * 3.5 : baseVol;
  const changePercent = round(randomBetween(-volatility * 100, volatility * 100), 4);
  const price = round(sym.basePrice * (1 + changePercent / 100), sym.basePrice < 1 ? 8 : 4);
  const change = round(price - sym.basePrice, sym.basePrice < 1 ? 8 : 4);
  return { price, change, changePercent };
}

export function generateTechnicals(price: number, market: string, smallCap = false) {
  const rsi = round(randomBetween(smallCap ? 15 : 25, smallCap ? 85 : 75), 2);
  const ema20 = round(price * randomBetween(0.97, 1.03), 4);
  const ema50 = round(price * randomBetween(0.94, 1.06), 4);
  const sma200 = round(price * randomBetween(0.88, 1.12), 4);
  const bbWidth = market === "CRYPTO" ? 0.08 : smallCap ? 0.12 : 0.04;
  const bollingerUpper = round(price * (1 + bbWidth), 4);
  const bollingerLower = round(price * (1 - bbWidth), 4);
  const macd = round(randomBetween(smallCap ? -8 : -5, smallCap ? 8 : 5), 6);
  const support = round(price * randomBetween(0.92, 0.98), 4);
  const resistance = round(price * randomBetween(1.02, 1.08), 4);
  const volume = round(randomBetween(smallCap ? 500_000 : 1_000_000, smallCap ? 20_000_000 : 50_000_000), 0);
  return { rsi, ema20, ema50, sma200, bollingerUpper, bollingerLower, macd, support, resistance, volume };
}

export function computeSignal(rsi: number, macd: number, price: number, ema20: number): "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "RISKY" {
  const aboveEma = price > ema20;
  if (rsi < 35 && macd > 0 && aboveEma) return "STRONG_BUY";
  if (rsi < 50 && aboveEma) return "BUY";
  if (rsi > 70) return "RISKY";
  if (rsi > 65 && macd < 0) return "SELL";
  return "HOLD";
}

export function computeScores(rsi: number, macd: number, signal: string, changePercent: number) {
  const technicalScore = Math.min(100, Math.max(0, Math.round(
    (signal === "STRONG_BUY" ? 85 : signal === "BUY" ? 72 : signal === "HOLD" ? 55 : signal === "SELL" ? 38 : 30)
    + randomBetween(-8, 8)
  )));
  const sentimentScore = Math.min(100, Math.max(0, Math.round(55 + changePercent * 3 + randomBetween(-10, 10))));
  const newsScore = Math.min(100, Math.max(0, Math.round(randomBetween(40, 85))));
  const riskScore = Math.min(100, Math.max(0, Math.round(100 - (rsi > 70 ? 30 : rsi < 30 ? 20 : 10) - randomBetween(0, 20))));
  const momentumScore = Math.min(100, Math.max(0, Math.round(55 + macd * 4 + randomBetween(-10, 10))));
  const aiScore = Math.round((technicalScore * 0.3 + sentimentScore * 0.2 + newsScore * 0.2 + riskScore * 0.15 + momentumScore * 0.15));
  return { technicalScore, sentimentScore, newsScore, riskScore, momentumScore, aiScore };
}

export function generateTradeSignal(signal: string, price: number) {
  const action = signal === "STRONG_BUY" || signal === "BUY" ? "BUY" : signal === "SELL" ? "SELL" : "HOLD";
  const stopLossPct = 0.028;
  const takeProfitPct = signal === "STRONG_BUY" ? 0.085 : 0.055;
  const stopLoss = round(price * (1 - stopLossPct), 4);
  const takeProfit = round(price * (1 + takeProfitPct), 4);
  const rr = round(takeProfitPct / stopLossPct, 1);
  return { action: action as "BUY" | "SELL" | "HOLD", entry: price, stopLoss, takeProfit, riskReward: `1:${rr}` };
}

const NEWS_HEADLINES = [
  { title: "Fed Signals Potential Rate Cuts as Inflation Cools", source: "Bloomberg", sentiment: "POSITIVE" as const, score: 0.72 },
  { title: "NVIDIA Reports Record AI Chip Demand in Q4 Earnings", source: "Reuters", sentiment: "POSITIVE" as const, score: 0.89 },
  { title: "Tech Stocks Rally as AI Spending Surges", source: "Yahoo Finance", sentiment: "POSITIVE" as const, score: 0.78 },
  { title: "Bitcoin Surges Past Key Resistance Level", source: "CoinDesk", sentiment: "POSITIVE" as const, score: 0.82 },
  { title: "Market Volatility Spikes Amid Geopolitical Tensions", source: "Reuters", sentiment: "NEGATIVE" as const, score: -0.65 },
];

export { NEWS_HEADLINES };
