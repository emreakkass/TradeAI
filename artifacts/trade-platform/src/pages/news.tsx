import { Sidebar } from "@/components/layout";
import { useGetNews, useGetSentimentSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} sa önce`;
  return `${Math.floor(diffH / 24)} gün önce`;
}

export default function News() {
  const { data: news, isLoading: newsLoading } = useGetNews({ limit: 50 });
  const { data: sentiment, isLoading: sentimentLoading } = useGetSentimentSummary();

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
    if (!o) return "YÜKLENİYOR";
    if (o === "BULLISH") return "YÜKSELİŞ";
    if (o === "BEARISH") return "DÜŞÜŞ";
    return "NÖTR";
  };

  const sentimentData = [
    { name: 'Olumlu', value: sentiment?.positive || 0, color: 'hsl(var(--primary))' },
    { name: 'Nötr', value: sentiment?.neutral || 0, color: 'hsl(var(--muted-foreground))' },
    { name: 'Olumsuz', value: sentiment?.negative || 0, color: 'hsl(var(--destructive))' },
  ];

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Piyasa Haberleri & Duyarlılık</h1>
          <p className="text-muted-foreground">YZ destekli haber duyarlılığı ve piyasa etkisi analizi.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Genel Piyasa Duyarlılığı</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[200px] w-full">
                  {sentimentLoading ? (
                    <div className="w-full h-full bg-muted/20 animate-pulse rounded-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold tracking-tight">{overallLabel(sentiment?.overall)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Son 24 saatin haberlerine göre</div>
                </div>
                <div className="mt-4 w-full space-y-2">
                  {sentimentData.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-medium">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">En Yükselişçi Varlıklar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sentiment?.topBullishSymbols?.map(sym => (
                    <Badge key={sym} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <TrendingUp className="w-3 h-3 mr-1" /> {sym}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {newsLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/50 animate-pulse h-32" />
              ))
            ) : (
              news?.map((article) => (
                <Card key={article.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{article.source}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {relativeTime(article.publishedAt)}
                          </div>
                        </div>
                        <a href={article.url} target="_blank" rel="noreferrer" className="block group">
                          <h3 className="text-lg font-semibold group-hover:text-accent transition-colors flex items-center gap-2">
                            {article.title}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </h3>
                        </a>
                        <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-4 pt-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm font-medium">
                            YZ Duyarlılığı: {getSentimentIcon(article.sentiment)}
                            <span className={
                              article.sentiment === "POSITIVE" ? "text-primary" :
                                article.sentiment === "NEGATIVE" ? "text-destructive" : "text-muted-foreground"
                            }>
                              {getSentimentLabel(article.sentiment)} — {(article.sentimentScore * 100).toFixed(0)}/100
                            </span>
                          </div>
                          {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {article.relatedSymbols.map(sym => (
                                <Badge key={sym} variant="outline" className="text-xs px-1.5 py-0">{sym}</Badge>
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
