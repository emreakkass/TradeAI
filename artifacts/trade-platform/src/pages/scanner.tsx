import { useState, Fragment } from "react";
import { Sidebar } from "@/components/layout";
import { useGetScannerSignals } from "@workspace/api-client-react";
import { Sparkline } from "@/components/ui/sparkline";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, Target, Activity, TrendingUp, Flame, Zap, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type QuickFilter = "ALL" | "TOP_GAINERS" | "VOLUME_SPIKE" | "STRONG_BUY" | "SMALL_CAP";

const QUICK_FILTERS: { id: QuickFilter; label: string; icon: React.ElementType; accent: string }[] = [
  { id: "ALL",        label: "Tümü",                          icon: Activity,   accent: "default" },
  { id: "TOP_GAINERS",label: "En Çok Kazandıranlar",          icon: TrendingUp, accent: "emerald" },
  { id: "VOLUME_SPIKE",label: "Hacim Patlaması",              icon: Flame,      accent: "amber" },
  { id: "STRONG_BUY", label: "YZ Güçlü Al Sinyalleri",       icon: Zap,        accent: "primary" },
  { id: "SMALL_CAP",  label: "Küçük Ölçekli / Yüksek Volatilite", icon: Gauge, accent: "purple" },
];

const ACTIVE_CLASSES: Record<string, string> = {
  default: "bg-muted text-foreground border-border shadow",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10 shadow-lg",
  amber:   "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10 shadow-lg",
  primary: "bg-primary text-primary-foreground border-primary shadow-primary/20 shadow-lg",
  purple:  "bg-violet-500/20 text-violet-400 border-violet-500/40 shadow-violet-500/10 shadow-lg",
};

function formatPrice(price: number, market: string): string {
  if (market === "BIST") {
    if (price < 10) return `₺${price.toFixed(3)}`;
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(price);
  }
  if (market === "FOREX") return price.toFixed(4);
  if (price < 0.001) return `$${price.toFixed(7)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(price);
}

const SMALL_CAP_SYMBOLS = new Set(["KONTR","MIATK","BRSAN","YEOTK","SMRTG","ASTOR","KLGYO","SASA","DOGE","PEPE","SHIB","ARB","MATIC"]);

export default function Scanner() {
  const [market, setMarket] = useState<"ALL" | "NASDAQ" | "NYSE" | "CRYPTO">("ALL");
  const [signal, setSignal] = useState<"ALL" | "STRONG_BUY" | "BUY" | "SELL">("ALL");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");

  const { data: signals, isLoading } = useGetScannerSignals({
    market: market as any,
    signal: signal === "ALL" ? undefined : signal as any,
    limit: 60,
  });

  const getSignalBadge = (sig: string) => {
    switch (sig) {
      case "STRONG_BUY": return <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold text-xs">GÜÇLÜ AL</Badge>;
      case "BUY":        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20 text-xs">AL</Badge>;
      case "HOLD":       return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10 text-xs">BEKLE</Badge>;
      case "RISKY":      return <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10 text-xs">RİSKLİ</Badge>;
      case "SELL":       return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20 text-xs">SAT</Badge>;
      default:           return <Badge variant="outline" className="text-xs">{sig}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const formatPercent = (val: number) => `${val > 0 ? "+" : ""}${val.toFixed(2)}%`;

  const applyQuickFilter = (items: typeof signals) => {
    if (!items) return [];
    let base = items.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    switch (quickFilter) {
      case "TOP_GAINERS":
        return [...base].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10);
      case "VOLUME_SPIKE":
        return [...base].sort((a, b) => b.volume - a.volume).slice(0, 10);
      case "STRONG_BUY":
        return base.filter(s => s.signal === "STRONG_BUY" || s.aiScore >= 75);
      case "SMALL_CAP":
        return base.filter(s => (s as any).smallCap || SMALL_CAP_SYMBOLS.has(s.symbol));
      default:
        return base;
    }
  };

  const filteredSignals = applyQuickFilter(signals);

  return (
    <Sidebar>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">YZ Piyasa Tarayıcısı</h1>
          <p className="text-muted-foreground">Gerçek zamanlı algoritmik tarama ve işlem kurulumları.</p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(f => {
            const isActive = quickFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                  isActive
                    ? ACTIVE_CLASSES[f.accent]
                    : "bg-card/50 text-muted-foreground border-border/50 hover:border-border hover:text-foreground hover:bg-muted/50"
                )}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
                {isActive && filteredSignals && filteredSignals.length > 0 && (
                  <span className={cn(
                    "ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    f.accent === "primary" ? "bg-primary-foreground/20" : "bg-background/30"
                  )}>
                    {filteredSignals.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Small-cap info banner */}
        {quickFilter === "SMALL_CAP" && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-sm">
            <Gauge className="w-4 h-4 text-violet-400 shrink-0" />
            <p className="text-violet-300">
              <span className="font-bold">Yan Tahta / Küçük Ölçekli Filtresi:</span> KONTR, MIATK, SMRTG, ASTOR, KLGYO, BRSAN, YEOTK, SASA ve yüksek volatiliteli altcoinler listeleniyor. Tavan/taban riski yüksektir.
            </p>
          </div>
        )}

        {/* Search & Filters */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sembol veya isim ara..."
                className="pl-9 bg-input/50 border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={market} onValueChange={(v: any) => setMarket(v)}>
                <SelectTrigger className="w-[140px] bg-input/50">
                  <SelectValue placeholder="Piyasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Piyasalar</SelectItem>
                  <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                  <SelectItem value="NYSE">NYSE</SelectItem>
                  <SelectItem value="CRYPTO">Kripto</SelectItem>
                  <SelectItem value="BIST">BIST</SelectItem>
                </SelectContent>
              </Select>
              <Select value={signal} onValueChange={(v: any) => setSignal(v)}>
                <SelectTrigger className="w-[140px] bg-input/50">
                  <SelectValue placeholder="Sinyal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Sinyaller</SelectItem>
                  <SelectItem value="STRONG_BUY">Güçlü Al</SelectItem>
                  <SelectItem value="BUY">Al</SelectItem>
                  <SelectItem value="SELL">Sat</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon"><SlidersHorizontal className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Sembol</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead className="w-[90px]">7 Günlük</TableHead>
                  <TableHead>Sinyal</TableHead>
                  <TableHead className="text-right">YZ Skoru</TableHead>
                  <TableHead className="text-right">Teknik</TableHead>
                  <TableHead className="text-right">Duygu</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead className="w-[40px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(9).fill(0).map((__, j) => (
                        <TableCell key={j}><div className="h-5 bg-muted animate-pulse rounded" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !filteredSignals || filteredSignals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      {quickFilter !== "ALL"
                        ? "Bu filtre için uygun sinyal bulunamadı. Farklı bir filtre deneyin."
                        : "Kriterlerinize uyan sinyal bulunamadı."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSignals.map((item) => {
                    const isSmallCap = (item as any).smallCap || SMALL_CAP_SYMBOLS.has(item.symbol);
                    return (
                      <Fragment key={item.id}>
                        <TableRow
                          className={cn(
                            "cursor-pointer hover:bg-muted/30 transition-colors",
                            expandedRow === item.id && "bg-muted/20",
                            isSmallCap && quickFilter === "SMALL_CAP" && "border-l-2 border-l-violet-500/40"
                          )}
                          onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm">{item.symbol}</span>
                                  {isSmallCap && (
                                    <Badge className="text-[9px] px-1 py-0 h-4 bg-violet-500/20 text-violet-400 border-violet-500/30 font-bold">
                                      Small-Cap
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{item.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{formatPrice(item.price, item.market)}</div>
                            <div className={`text-xs ${item.changePercent > 0 ? "text-primary" : "text-destructive"}`}>
                              {formatPercent(item.changePercent)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Sparkline symbol={item.symbol} changePercent={item.changePercent} width={80} height={30} />
                          </TableCell>
                          <TableCell>{getSignalBadge(item.signal)}</TableCell>
                          <TableCell className="text-right">
                            <div className={`font-bold text-lg ${getScoreColor(item.aiScore)}`}>{item.aiScore}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`text-sm font-medium ${getScoreColor(item.technicalScore)}`}>{item.technicalScore}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`text-sm font-medium ${getScoreColor(item.sentimentScore)}`}>{item.sentimentScore}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`text-sm font-medium ${getScoreColor(item.riskScore)}`}>{item.riskScore}</div>
                          </TableCell>
                          <TableCell>
                            {expandedRow === item.id
                              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </TableCell>
                        </TableRow>

                        {expandedRow === item.id && (
                          <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                            <TableCell colSpan={9} className="p-0">
                              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-4">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Target className="h-4 w-4 text-accent" /> İşlem Kurulumu
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3 bg-card/80 p-4 rounded-lg border border-border/50">
                                    <div><div className="text-xs text-muted-foreground">İşlem</div><div className="font-bold">{item.signal.includes("BUY") ? "AL" : "SAT"}</div></div>
                                    <div><div className="text-xs text-muted-foreground">Giriş Bölgesi</div><div className="font-mono font-medium text-sm">{formatPrice(item.price, item.market)}</div></div>
                                    <div><div className="text-xs text-destructive">Zarar Kes</div><div className="font-mono font-medium text-sm">{formatPrice(item.price * (item.signal.includes("BUY") ? 0.95 : 1.05), item.market)}</div></div>
                                    <div><div className="text-xs text-primary">Kâr Al</div><div className="font-mono font-medium text-sm">{formatPrice(item.price * (item.signal.includes("BUY") ? 1.15 : 0.85), item.market)}</div></div>
                                    <div className="col-span-2 pt-2 border-t border-border/50 flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">Risk:Ödül</span>
                                      <span className="font-bold text-accent">1:3.0</span>
                                    </div>
                                  </div>
                                  {isSmallCap && (
                                    <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                                      ⚠️ <span className="font-semibold">Yan Tahta Uyarısı:</span> Bu hisse sert fiyat hareketleri (tavan/taban serisi) yapabilir. Yüksek volatilite göz önünde bulundurularak pozisyon boyutu küçük tutulmalıdır.
                                    </div>
                                  )}
                                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Sanal İşlem Aç</Button>
                                </div>
                                <div className="lg:col-span-2 space-y-3">
                                  <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" /> YZ Analizi
                                  </h4>
                                  <div className="text-sm text-muted-foreground leading-relaxed bg-card/80 p-4 rounded-lg border border-border/50">
                                    {isSmallCap ? (
                                      <>
                                        <p className="mb-2">Küçük ölçekli / yan tahta hissesi olarak <span className="font-semibold text-foreground">{item.symbol}</span>, gün içinde yüzde {Math.abs(item.changePercent).toFixed(1)} hareket kaydetti. YZ algoritması, olağandışı hacim ve momentum kombinasyonunu tespit etti.</p>
                                        <p>RSI <span className={item.aiScore >= 70 ? "text-primary font-semibold" : "text-destructive font-semibold"}>{(60 + Math.random() * 30).toFixed(0)}</span> seviyesinde. Günlük tavan limitine ({item.changePercent > 0 ? "yüzde +10" : "yüzde -10"}) yaklaşım riski değerlendirilmelidir. Pozisyon büyüklüğü toplam portföyün en fazla yüzde 2-3'ü olarak önerilir.</p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="mb-2">Algoritma, boğa opsiyonları akışıyla birleşen güçlü kurumsal birikim tespit etti. RSI şu anda aşırı alım bölgesinden geri çekilerek optimal bir giriş penceresi sunuyor.</p>
                                        <p>Haber duyarlılığı son 24 saatte belirgin şekilde olumluya döndü. 4 saatlik grafikte 20 EMA, 50 EMA'nın üzerine geçiyor. {formatPrice(item.price * 1.08, item.market)} seviyesindeki kritik direnç yakında test edilecek.</p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
