import { Sidebar } from "@/components/layout";
import { useGetWatchlist } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Watchlist() {
  const { data: watchlist, isLoading } = useGetWatchlist();

  const getSignalBadge = (sig: string) => {
    switch(sig) {
      case "STRONG_BUY": return <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold">STRONG BUY</Badge>;
      case "BUY": return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">BUY</Badge>;
      case "HOLD": return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">HOLD</Badge>;
      case "RISKY": return <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">RISKY</Badge>;
      case "SELL": return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20">SELL</Badge>;
      default: return <Badge variant="outline">{sig}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <Sidebar>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Watchlist</h1>
            <p className="text-muted-foreground">Tracked symbols and automated alerts.</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Search className="w-4 h-4 mr-2" /> Add Symbol
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter watchlist..." 
                className="pl-9 bg-input/50 border-border/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border border-border/50 bg-card/30 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Symbol</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead className="text-right">AI Score</TableHead>
                  <TableHead className="text-right">Alert Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                      <TableCell><div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : watchlist?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Your watchlist is empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  watchlist?.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <div>
                            <div className="font-bold text-sm">{item.symbol}</div>
                            <div className="text-xs text-muted-foreground">{item.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{formatCurrency(item.price)}</div>
                        <div className={`text-xs ${item.changePercent > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {formatPercent(item.changePercent)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSignalBadge(item.signal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={`font-bold text-lg ${getScoreColor(item.aiScore)}`}>{item.aiScore}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.alertPrice ? (
                          <div className="flex items-center justify-end gap-2 text-sm text-accent">
                            <Bell className="w-3 h-3" />
                            {formatCurrency(item.alertPrice)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No alert</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Target className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
