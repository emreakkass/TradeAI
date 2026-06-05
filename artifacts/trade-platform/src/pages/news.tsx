import { useState } from "react";
import { Sidebar } from "@/components/layout";
import { useGetNews, useGetSentimentSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Globe, BarChart2 } from "lucide-react";

type MarketTab = "GLOBAL" | "BIST";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} sa önce`;
  return `${Math.floor(diffH / 24)} gün önce`;
}

function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function News() {
  const [activeTab, setActiveTab] = useState<MarketTab>("GLOBAL");

  const { data: news, isLoading: newsLoading } = useGetNews({ market: activeTab as any });
  const { data: sentiment, isLoading: sentimentLoading } = useGetSentimentSummary({ market: activeTab as any });

  const getSentimentIcon = (sent: string) => {
    switch (sent) {
      case "POSITIVE": return <TrendingUp className="w-4 h-4 text-primary" />;
      case "NEGATIVE": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentLabel = (sent: string) => {
    switch (sent) {
      case "POSITIVE": return "Olumlu";
      case "NEGATIVE": return "Olumsuz";
      default: return "Nötr";
    }
  };

  const overallLabel = (o?: string) => {
    if (!o) return "—";
    if (o === "BULLISH") return "YÜKSELİŞ";
    if (o === "BEARISH") return "DÜŞÜŞ";
    return "NÖTR";
  };

  const overallColor = (o?: string) => {
    if (o === "BULLISH") return "text-primary";
    if (o === "BEARISH") return "text-destructive";
    return "text-yellow-500";
  };

  const sentimentData = [
    { name: "Olumlu", value: sentiment?.positive || 0, color: "hsl(var(--primary))" },
    { name: "Nötr", value: sentiment?.neutral || 0, color: "hsl(var(--muted-foreground))" },
    { name: "Olumsuz", value: sentiment?.negative || 0, color: "hsl(var(--destructive))" },
  ];

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        {/* Header + Tab Selector */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Piyasa Haberleri</h1>
            <p className="text-muted-foreground">YZ destekli haber duyarlılığı ve piyasa etkisi analizi.</p>
          </div>

          {/* Premium Tab Switcher */}
          <div className="flex items-center bg-card border border-border/60 rounded-xl p-1 gap-1 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("GLOBAL")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "GLOBAL"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Globe className="w-4 h-4" />
              Yabancı Borsalar
            </button>
            <button
              onClick={() => setActiveTab("BIST")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "BIST"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Türk Borsası
            </button>
          </div>
        </div>

        {/* Market label */}
        <div className="flex items-center gap-2 -mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            {activeTab === "BIST"
              ? "Borsa İstanbul · KAP Duyuruları · BIST 100 · Türkiye Piyasaları · Canlı"
              : "NASDAQ · NYSE · S&P 500 · Kripto · Fed Kararları · Küresel Finans · Canlı RSS"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Sentiment */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Genel Piyasa Duyarlılığı</CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  {activeTab === "BIST" ? "Borsa İstanbul" : "Küresel Piyasalar"}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[180px] w-full">
                  {sentimentLoading ? (
                    <div className="w-full h-full bg-muted/20 animate-pulse rounded-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={55} outerRadius={72} paddingAngle={4} dataKey="value">
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} itemStyle={{ color: "hsl(var(--foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="text-center mt-2">
                  <div className={`text-2xl font-extrabold tracking-tight ${overallColor(sentiment?.overall)}`}>
                    {overallLabel(sentiment?.overall)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Son haberlere göre</div>
                </div>
                <div className="mt-4 w-full space-y-2">
                  {sentimentData.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-semibold">{s.value} haber</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">
                  {activeTab === "BIST" ? "BIST Yükseliş Öncüleri" : "Küresel Yükseliş Öncüleri"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sentiment?.topBullishSymbols?.map(sym => (
                    <Badge key={sym} variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                      <TrendingUp className="w-3 h-3 mr-1" /> {sym}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main: News Feed */}
          <div className="lg:col-span-3 space-y-4">
            {newsLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/50 animate-pulse h-36" />
              ))
            ) : news?.length === 0 ? (
              <Card className="bg-card/50 border-border/50">
                <CardContent className="py-16 text-center text-muted-foreground">
                  Haber bulunamadı. Bağlantı kontrol ediniz.
                </CardContent>
              </Card>
            ) : (
              news?.map((article) => (
                <Card key={article.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all hover:border-border group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-semibold">{article.source}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium text-foreground/70">{relativeTime(article.publishedAt)}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{absoluteDate(article.publishedAt)}</span>
                          </div>
                        </div>
                        <a href={article.url} target="_blank" rel="noreferrer" className="block group/link">
                          <h3 className="text-base font-semibold leading-snug group-hover/link:text-accent transition-colors flex items-center gap-2">
                            {article.title}
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                          </h3>
                        </a>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{article.summary}</p>
                        <div className="flex items-center gap-4 pt-1 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            {getSentimentIcon(article.sentiment)}
                            <span className={
                              article.sentiment === "POSITIVE" ? "text-primary" :
                                article.sentiment === "NEGATIVE" ? "text-destructive" : "text-muted-foreground"
                            }>
                              {getSentimentLabel(article.sentiment)} ({(article.sentimentScore * 100).toFixed(0)}%)
                            </span>
                          </div>
                          {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {article.relatedSymbols.map(sym => (
                                <Badge key={sym} variant="outline" className="text-[10px] px-1.5 py-0 font-semibold">{sym}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
