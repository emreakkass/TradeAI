import { useState } from "react";
import { Sidebar } from "@/components/layout";
import { useGetScannerSignals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, AlertCircle, Target, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Scanner() {
  const [market, setMarket] = useState<"ALL" | "NASDAQ" | "NYSE" | "CRYPTO">("ALL");
  const [signal, setSignal] = useState<"ALL" | "STRONG_BUY" | "BUY" | "SELL">("ALL");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // In a real app we would type this better and pass the correct enum
  const { data: signals, isLoading } = useGetScannerSignals({ 
    market: market as any, 
    signal: signal === "ALL" ? undefined : signal as any,
    limit: 50 
  });

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

  const filteredSignals = signals?.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="flex flex-col gap-6 h-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Market Scanner</h1>
          <p className="text-muted-foreground">Real-time algorithmic scanning and trade setups.</p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search symbol or name..." 
                className="pl-9 bg-input/50 border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={market} onValueChange={(v: any) => setMarket(v)}>
                <SelectTrigger className="w-[140px] bg-input/50">
                  <SelectValue placeholder="Market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Markets</SelectItem>
                  <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                  <SelectItem value="NYSE">NYSE</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={signal} onValueChange={(v: any) => setSignal(v)}>
                <SelectTrigger className="w-[140px] bg-input/50">
                  <SelectValue placeholder="Signal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Signals</SelectItem>
                  <SelectItem value="STRONG_BUY">Strong Buy</SelectItem>
                  <SelectItem value="BUY">Buy</SelectItem>
                  <SelectItem value="SELL">Sell</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
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
                  <TableHead className="text-right">Tech</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                      <TableCell><div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : filteredSignals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No signals found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSignals?.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-muted/30 transition-colors ${expandedRow === item.id ? 'bg-muted/20' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                      >
                        <TableCell>
                          <div className="font-bold text-sm">{item.symbol}</div>
                          <div className="text-xs text-muted-foreground">{item.name}</div>
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
                          <div className={`text-sm font-medium ${getScoreColor(item.technicalScore)}`}>{item.technicalScore}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`text-sm font-medium ${getScoreColor(item.sentimentScore)}`}>{item.sentimentScore}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`text-sm font-medium ${getScoreColor(item.riskScore)}`}>{item.riskScore}</div>
                        </TableCell>
                        <TableCell>
                          {expandedRow === item.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>
                      
                      {expandedRow === item.id && (
                        <TableRow className="bg-muted/10 border-b border-border/50 hover:bg-muted/10">
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Target className="h-4 w-4 text-accent" /> Trade Setup
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-card/80 p-4 rounded-lg border border-border/50">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Action</div>
                                    <div className="font-bold text-foreground">{item.signal.includes('BUY') ? 'BUY' : 'SELL'}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">Entry Zone</div>
                                    <div className="font-mono font-medium">{formatCurrency(item.price)}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground text-destructive">Stop Loss</div>
                                    <div className="font-mono font-medium">{formatCurrency(item.price * (item.signal.includes('BUY') ? 0.95 : 1.05))}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground text-primary">Take Profit</div>
                                    <div className="font-mono font-medium">{formatCurrency(item.price * (item.signal.includes('BUY') ? 1.15 : 0.85))}</div>
                                  </div>
                                  <div className="col-span-2 pt-2 border-t border-border/50">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-muted-foreground">Risk:Reward</span>
                                      <span className="font-bold text-accent">1:3.0</span>
                                    </div>
                                  </div>
                                </div>
                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Execute Paper Trade</Button>
                              </div>

                              <div className="lg:col-span-2 space-y-4">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-primary" /> AI Analysis
                                </h4>
                                <div className="text-sm text-muted-foreground leading-relaxed bg-card/80 p-4 rounded-lg border border-border/50">
                                  <p className="mb-2">
                                    The algorithm detects strong institutional accumulation combined with bullish options flow. RSI is currently resetting from overbought conditions, providing an optimal entry window.
                                  </p>
                                  <p>
                                    News sentiment has shifted markedly positive over the last 24 hours. The 20 EMA is crossing above the 50 EMA on the 4H timeframe. Key resistance at {formatCurrency(item.price * 1.08)} likely to be tested soon.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
