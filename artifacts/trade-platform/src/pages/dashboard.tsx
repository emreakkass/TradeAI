import { useGetDashboardStats, useGetPortfolioChart, useGetTopMovers } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Target, Briefcase, TrendingUp, Flame } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetPortfolioChart({ period: "1M" });
  const { data: moversData, isLoading: moversLoading } = useGetTopMovers();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? "+" : ""}${val.toFixed(2)}%`;
  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(1)}Mr`;
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(0)}M`;
    return `$${(vol / 1_000).toFixed(0)}K`;
  };

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Genel Bakış Paneli</h1>
          <p className="text-muted-foreground">Gerçek zamanlı piyasa bilgileri ve portföy performansı.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Değer</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <div className="h-8 bg-muted rounded animate-pulse w-32" /> : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(stats?.totalPortfolioValue || 0)}</div>
                  <p className={`text-xs mt-1 font-medium ${stats?.totalPnl && stats.totalPnl > 0 ? "text-primary" : "text-destructive"}`}>
                    {stats?.totalPnl && stats.totalPnl > 0
                      ? <ArrowUpRight className="inline w-3 h-3 mr-1" />
                      : <ArrowDownRight className="inline w-3 h-3 mr-1" />}
                    {formatCurrency(stats?.totalPnl || 0)} ({formatPercent(stats?.totalPnlPercent || 0)})
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Günlük K/Z</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <div className="h-8 bg-muted rounded animate-pulse w-32" /> : (
                <>
                  <div className={`text-2xl font-bold ${stats?.dailyPnl && stats.dailyPnl > 0 ? "text-primary" : "text-destructive"}`}>
                    {formatCurrency(stats?.dailyPnl || 0)}
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground font-medium">{formatPercent(stats?.dailyPnlPercent || 0)} Bugün</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Sinyaller</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <div className="h-8 bg-muted rounded animate-pulse w-16" /> : (
                <>
                  <div className="text-2xl font-bold text-accent">{stats?.activeSignals || 0}</div>
                  <p className="text-xs mt-1 text-muted-foreground">Yüksek güven kurulumları</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kazanma Oranı</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <div className="h-8 bg-muted rounded animate-pulse w-16" /> : (
                <>
                  <div className="text-2xl font-bold">{stats?.winRate?.toFixed(1) || 0}%</div>
                  <p className="text-xs mt-1 text-muted-foreground">Kapalı işlemlere göre</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main chart + Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Portföy Performansı</CardTitle>
              <CardDescription>Son 30 günlük değer değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                {chartLoading ? (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-md" />
                ) : chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => new Date(v).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} itemStyle={{ color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }} formatter={(value: number) => [formatCurrency(value), "Değer"]} labelFormatter={(l) => new Date(l).toLocaleDateString("tr-TR")} />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Grafik verisi bulunamadı</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>En Çok Hareket Edenler</CardTitle>
              <CardDescription>Piyasa volatilite tarayıcısı</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {moversLoading ? (
                <div className="px-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />)}</div>
              ) : (
                <div className="space-y-0.5">
                  {moversData?.gainers?.slice(0, 3).map(g => (
                    <div key={g.symbol} className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors">
                      <div><div className="font-bold text-sm">{g.symbol}</div><div className="text-xs text-muted-foreground truncate w-24">{g.name}</div></div>
                      <div className="text-right"><div className="font-medium text-sm">{formatCurrency(g.price)}</div><div className="text-xs font-bold text-primary">{formatPercent(g.changePercent)}</div></div>
                    </div>
                  ))}
                  <div className="mx-4 border-t border-border/30 my-1" />
                  {moversData?.losers?.slice(0, 2).map(l => (
                    <div key={l.symbol} className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors">
                      <div><div className="font-bold text-sm">{l.symbol}</div><div className="text-xs text-muted-foreground truncate w-24">{l.name}</div></div>
                      <div className="text-right"><div className="font-medium text-sm">{formatCurrency(l.price)}</div><div className="text-xs font-bold text-destructive">{formatPercent(l.changePercent)}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* New cards: Top Gainers + Volume Spikes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Günün En Çok Yükselenleri</CardTitle>
                  <CardDescription className="text-xs">Tüm piyasalarda en yüksek kazanç</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {moversLoading ? (
                <div className="px-6 space-y-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />)}</div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 px-4 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/30">
                    <span>Sembol</span>
                    <span className="text-right">Fiyat</span>
                    <span className="text-right">Değişim</span>
                    <span className="text-right">Piyasa</span>
                  </div>
                  {moversData?.gainers?.slice(0, 6).map((g, i) => (
                    <div key={g.symbol} className={`grid grid-cols-4 items-center px-4 py-2.5 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <div>
                        <div className="font-bold text-sm">{g.symbol}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{g.name}</div>
                      </div>
                      <div className="text-right font-mono text-sm font-medium">{formatCurrency(g.price)}</div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          <ArrowUpRight className="w-3 h-3" />{formatPercent(g.changePercent)}
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{g.market}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Volume Spikes */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">Hacim Kırılımı Yaşayanlar</CardTitle>
                  <CardDescription className="text-xs">Ortalama hacmin üzerinde işlem görüyorlar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {moversLoading ? (
                <div className="px-6 space-y-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />)}</div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 px-4 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/30">
                    <span>Sembol</span>
                    <span className="text-right">Hacim</span>
                    <span className="text-right">Ort. x</span>
                    <span className="text-right">Değişim</span>
                  </div>
                  {(moversData as any)?.volumeSpikes?.slice(0, 6).map((g: any, i: number) => (
                    <div key={g.symbol} className={`grid grid-cols-4 items-center px-4 py-2.5 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <div>
                        <div className="font-bold text-sm">{g.symbol}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{g.name}</div>
                      </div>
                      <div className="text-right font-mono text-xs">{formatVolume(g.volume)}</div>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${g.volumeRatio >= 2 ? "text-accent" : g.volumeRatio >= 1.5 ? "text-yellow-500" : "text-muted-foreground"}`}>
                          {g.volumeRatio.toFixed(1)}x
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold ${g.changePercent > 0 ? "text-primary" : "text-destructive"}`}>
                          {formatPercent(g.changePercent)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}
