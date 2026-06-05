import { useGetWatchlist, useGetTopMovers } from "@workspace/api-client-react";
import { TrendingUp, TrendingDown, Dot } from "lucide-react";

function formatPrice(price: number, market: string): string {
  if (market === "BIST") {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency", currency: "TRY", minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(price);
  }
  if (market === "FOREX") {
    return price.toFixed(4);
  }
  if (price < 0.001) return `$${price.toFixed(7)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(price);
}

interface TickerItem {
  symbol: string;
  price: number;
  changePercent: number;
  market: string;
}

function TickerItem({ item }: { item: TickerItem }) {
  const isUp = item.changePercent >= 0;
  const pct = `${isUp ? "+" : ""}${item.changePercent.toFixed(2)}%`;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 select-none whitespace-nowrap">
      <span className="font-bold text-[11px] text-foreground/90 tracking-wide">{item.symbol}</span>
      <span className="font-mono text-[11px] text-foreground/70">{formatPrice(item.price, item.market)}</span>
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
          isUp
            ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]"
            : "text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.6)]"
        }`}
      >
        {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
        {pct}
      </span>
      <Dot className="w-3 h-3 text-border/40 shrink-0" />
    </span>
  );
}

export function TickerBar() {
  const { data: watchlist } = useGetWatchlist();
  const { data: movers } = useGetTopMovers();

  // Use watchlist items if available, otherwise fall back to top movers
  let items: TickerItem[] = [];

  if (watchlist && watchlist.length > 0) {
    items = watchlist.map(w => ({
      symbol: w.symbol,
      price: w.price,
      changePercent: w.changePercent,
      market: w.market,
    }));
  } else if (movers) {
    const gainers = (movers.gainers || []).slice(0, 8).map((g: any) => ({
      symbol: g.symbol, price: g.price, changePercent: g.changePercent, market: g.market,
    }));
    const losers = (movers.losers || []).slice(0, 4).map((l: any) => ({
      symbol: l.symbol, price: l.price, changePercent: l.changePercent, market: l.market,
    }));
    items = [...gainers, ...losers];
  }

  if (items.length === 0) return null;

  // Duplicate items for seamless loop
  const repeated = [...items, ...items, ...items];

  // Speed: 30s per full cycle (smooth, not too fast)
  const duration = `${Math.max(20, items.length * 3.5)}s`;

  return (
    <div className="h-8 bg-[hsl(var(--background))] border-b border-border/30 overflow-hidden relative flex items-center">
      {/* Left edge fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      {/* Right edge fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      {/* LIVE badge */}
      <div className="absolute left-3 z-20 flex items-center gap-1.5 bg-background pr-2">
        <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-primary uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
          Canlı
        </span>
        <div className="w-px h-3 bg-border/40" />
      </div>

      {/* Scrolling track */}
      <div className="pl-16 flex items-center">
        <div
          className="flex items-center animate-ticker-scroll"
          style={{ animationDuration: duration }}
        >
          {repeated.map((item, i) => (
            <TickerItem key={`${item.symbol}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
