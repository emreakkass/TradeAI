import { useState } from "react";
import { Sidebar } from "@/components/layout";
import { useGetWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Star, Trash2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const POPULAR_SYMBOLS = [
  { symbol: "BTC", market: "CRYPTO", name: "Bitcoin" },
  { symbol: "ETH", market: "CRYPTO", name: "Ethereum" },
  { symbol: "SOL", market: "CRYPTO", name: "Solana" },
  { symbol: "AAPL", market: "NASDAQ", name: "Apple Inc." },
  { symbol: "NVDA", market: "NASDAQ", name: "NVIDIA Corporation" },
  { symbol: "TSLA", market: "NASDAQ", name: "Tesla Inc." },
  { symbol: "MSFT", market: "NASDAQ", name: "Microsoft Corporation" },
  { symbol: "GOOGL", market: "NASDAQ", name: "Alphabet Inc." },
  { symbol: "META", market: "NASDAQ", name: "Meta Platforms Inc." },
  { symbol: "AMZN", market: "NASDAQ", name: "Amazon.com Inc." },
  { symbol: "AMD", market: "NASDAQ", name: "Advanced Micro Devices" },
  { symbol: "NFLX", market: "NASDAQ", name: "Netflix Inc." },
  { symbol: "JPM", market: "NYSE", name: "JPMorgan Chase & Co." },
  { symbol: "BAC", market: "NYSE", name: "Bank of America Corp." },
  { symbol: "GS", market: "NYSE", name: "Goldman Sachs Group" },
  { symbol: "XOM", market: "NYSE", name: "Exxon Mobil Corporation" },
  { symbol: "EURUSD", market: "FOREX", name: "EUR/USD" },
  { symbol: "GBPUSD", market: "FOREX", name: "GBP/USD" },
  { symbol: "THYAO", market: "BIST", name: "Türk Hava Yolları" },
  { symbol: "GARAN", market: "BIST", name: "Garanti Bankası" },
];

export default function Watchlist() {
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const { data: watchlist, isLoading } = useGetWatchlist();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const watchlistSymbols = new Set(watchlist?.map(w => w.symbol) || []);

  const filteredModal = POPULAR_SYMBOLS.filter(s =>
    s.symbol.toLowerCase().includes(modalSearch.toLowerCase()) ||
    s.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  const handleAdd = (sym: typeof POPULAR_SYMBOLS[0]) => {
    if (watchlistSymbols.has(sym.symbol)) return;
    addMutation.mutate(
      { data: { symbol: sym.symbol, market: sym.market as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
          toast({ title: "Eklendi", description: `${sym.symbol} izleme listenize eklendi.` });
        },
        onError: () => {
          toast({ title: "Hata", description: "Sembol eklenemedi.", variant: "destructive" });
        },
      }
    );
  };

  const handleRemove = (id: number, symbol: string) => {
    removeMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
          toast({ title: "Kaldırıldı", description: `${symbol} izleme listenizden kaldırıldı.` });
        },
      }
    );
  };

  const getSignalBadge = (sig: string) => {
    switch (sig) {
      case "STRONG_BUY": return <Badge className="bg-primary hover:bg-primary text-primary-foreground font-bold">GÜÇLÜ AL</Badge>;
      case "BUY": return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">AL</Badge>;
      case "HOLD": return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10">BEKLE</Badge>;
      case "RISKY": return <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">RİSKLİ</Badge>;
      case "SELL": return <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20">SAT</Badge>;
      default: return <Badge variant="outline">{sig}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  const filteredWatchlist = watchlist?.filter(w =>
    w.symbol.toLowerCase().includes(filter.toLowerCase()) ||
    w.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">İzleme Listesi</h1>
            <p className="text-muted-foreground">Takip ettiğiniz semboller ve otomatik uyarılar.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Sembol Ekle
          </Button>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shrink-0">
          <CardContent className="p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İzleme listesini filtrele..."
                className="pl-9 bg-input/50 border-border/50"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden">
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-md z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Sembol</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Sinyal</TableHead>
                  <TableHead className="text-right">YZ Skoru</TableHead>
                  <TableHead className="text-right">Uyarı Fiyatı</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
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
                ) : filteredWatchlist?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {watchlist?.length === 0
                        ? <span>İzleme listeniz boş. <button className="text-primary underline underline-offset-2" onClick={() => setModalOpen(true)}>Sembol ekleyin</button>.</span>
                        : "Arama kriterinize uyan sembol bulunamadı."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWatchlist?.map((item) => (
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
                      <TableCell>{getSignalBadge(item.signal)}</TableCell>
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
                          <span className="text-muted-foreground text-xs">Uyarı yok</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemove(item.id, item.symbol)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Sembol Ekleme Modalı */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Sembol Ekle
            </DialogTitle>
            <DialogDescription>
              Popüler semboller arasından seçin veya arama yapın.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="BTC, AAPL, TSLA..."
              className="pl-9 bg-input/50 border-border/50"
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              autoFocus
            />
            {modalSearch && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setModalSearch("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 max-h-[340px] overflow-y-auto space-y-1 pr-1">
            {filteredModal.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Sembol bulunamadı.</p>
            ) : (
              filteredModal.map((sym) => {
                const alreadyAdded = watchlistSymbols.has(sym.symbol);
                return (
                  <div
                    key={sym.symbol}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{sym.symbol}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{sym.market}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{sym.name}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyAdded ? "outline" : "default"}
                      className={alreadyAdded
                        ? "text-muted-foreground border-border/50 cursor-default"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }
                      disabled={alreadyAdded || addMutation.isPending}
                      onClick={() => !alreadyAdded && handleAdd(sym)}
                    >
                      {alreadyAdded ? "Eklendi" : (
                        <>
                          <Plus className="w-3 h-3 mr-1" /> Ekle
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
