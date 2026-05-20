import { Sidebar } from "@/components/layout";
import { useGetPortfolio, useGetPositions, useGetTrades } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Briefcase, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Portfolio() {
  const { data: portfolio, isLoading: portfolioLoading } = useGetPortfolio();
  const { data: positions, isLoading: positionsLoading } = useGetPositions();
  const { data: trades, isLoading: tradesLoading } = useGetTrades({ status: "ALL", limit: 50 });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Manage your open positions and trade history.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
              <Briefcase className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-32" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{formatCurrency(portfolio?.totalValue || 0)}</div>
                  <div className={`text-sm mt-1 font-medium ${portfolio?.totalPnl && portfolio.totalPnl > 0 ? "text-primary" : "text-destructive"}`}>
                    {portfolio?.totalPnl && portfolio.totalPnl > 0 ? <ArrowUpRight className="inline w-3 h-3 mr-1" /> : <ArrowDownRight className="inline w-3 h-3 mr-1" />}
                    {formatCurrency(portfolio?.totalPnl || 0)} ({formatPercent(portfolio?.totalPnlPercent || 0)}) All Time
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Invested Amount</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-32" />
              ) : (
                <div className="text-3xl font-bold text-accent">{formatCurrency(portfolio?.investedAmount || 0)}</div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Cash</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-32" />
              ) : (
                <div className="text-3xl font-bold">{formatCurrency(portfolio?.cashBalance || 0)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <Tabs defaultValue="positions" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="positions">Open Positions</TabsTrigger>
                <TabsTrigger value="history">Trade History</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value="positions" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionsLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Loading positions...</TableCell></TableRow>
                  ) : positions?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No open positions.</TableCell></TableRow>
                  ) : (
                    positions?.map((pos) => (
                      <TableRow key={pos.id}>
                        <TableCell>
                          <div className="font-bold">{pos.symbol}</div>
                          <div className="text-xs text-muted-foreground">{pos.name}</div>
                          {pos.isPaper && <Badge variant="outline" className="mt-1 border-yellow-500/50 text-yellow-500 text-[10px]">PAPER</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-medium">{pos.quantity}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(pos.avgPrice)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(pos.currentPrice)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(pos.totalValue)}</TableCell>
                        <TableCell className="text-right">
                          <div className={`font-bold ${pos.pnl > 0 ? "text-primary" : "text-destructive"}`}>{formatCurrency(pos.pnl)}</div>
                          <div className={`text-xs ${pos.pnlPercent > 0 ? "text-primary" : "text-destructive"}`}>{formatPercent(pos.pnlPercent)}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="history" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradesLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">Loading history...</TableCell></TableRow>
                  ) : trades?.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No trade history.</TableCell></TableRow>
                  ) : (
                    trades?.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="text-sm text-muted-foreground">{new Date(trade.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold">{trade.symbol}</TableCell>
                        <TableCell>
                          <span className={`font-bold text-xs px-2 py-1 rounded ${trade.type === 'BUY' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                            {trade.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{trade.quantity}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(trade.price)}</TableCell>
                        <TableCell className="text-right">
                          {trade.pnl != null ? (
                            <div className={`font-bold ${trade.pnl > 0 ? "text-primary" : "text-destructive"}`}>
                              {formatCurrency(trade.pnl)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{trade.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Sidebar>
  );
}
