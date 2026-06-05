import { useGetDashboardStats, useGetPortfolioChart, useGetTopMovers } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Target, Briefcase } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetPortfolioChart({ period: "1M" });
  const { data: moversData, isLoading: moversLoading } = useGetTopMovers();

  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Genel Bakış Paneli</h1>
          <p className="text-muted-foreground">Gerçek zamanlı piyasa bilgileri ve portföy performansı.</p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Değer</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse w-32" />
              ) : (
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
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse w-32" />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${stats?.dailyPnl && stats.dailyPnl > 0 ? "text-primary" : "text-destructive"}`}>
                    {formatCurrency(stats?.dailyPnl || 0)}
                  </div>
                  <p className="text-xs mt-1 text-muted-foreground font-medium">
                    {formatPercent(stats?.dailyPnlPercent || 0)} Bugün
                  </p>
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
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse w-16" />
              ) : (
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
              {statsLoading ? (
                <div className="h-8 bg-muted rounded animate-pulse w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.winRate?.toFixed(1) || 0}%</div>
                  <p className="text-xs mt-1 text-muted-foreground">Kapalı işlemlere göre</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana Grafik */}
          <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Portföy Performansı</CardTitle>
              <CardDescription>Son 30 günlük değer değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
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
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                        formatter={(value: number) => [formatCurrency(value), 'Değer']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                      />
                      <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Grafik verisi bulunamadı</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* En Çok Hareket Edenler */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>En Çok Hareket Edenler</CardTitle>
              <CardDescription>Piyasa volatilite tarayıcısı</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {moversLoading ? (
                <div className="px-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-muted/20 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {moversData?.gainers?.slice(0, 3).map((gainer) => (
                    <div key={gainer.symbol} className="flex items-center justify-between px-6 py-2 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-bold text-sm">{gainer.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate w-24">{gainer.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{formatCurrency(gainer.price)}</div>
                        <div className="text-xs font-bold text-primary">{formatPercent(gainer.changePercent)}</div>
                      </div>
                    </div>
                  ))}
                  {moversData?.losers?.slice(0, 2).map((loser) => (
                    <div key={loser.symbol} className="flex items-center justify-between px-6 py-2 hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-bold text-sm">{loser.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate w-24">{loser.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{formatCurrency(loser.price)}</div>
                        <div className="text-xs font-bold text-destructive">{formatPercent(loser.changePercent)}</div>
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
