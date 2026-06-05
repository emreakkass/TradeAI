import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Activity,
  List,
  Briefcase,
  Newspaper,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/scanner", label: "YZ Tarayıcı", icon: Activity },
  { href: "/watchlist", label: "İzleme Listesi", icon: List },
  { href: "/portfolio", label: "Portföy", icon: Briefcase },
  { href: "/news", label: "Haberler", icon: Newspaper },
  { href: "/chat", label: "YZ Asistan", icon: MessageSquare },
];

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "BUY_SIGNAL": return <TrendingUp className="w-4 h-4 text-primary" />;
    case "SELL_SIGNAL": return <TrendingDown className="w-4 h-4 text-destructive" />;
    case "PRICE_ALERT": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "BREAKOUT": return <Zap className="w-4 h-4 text-accent" />;
    default: return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa`;
  return `${Math.floor(h / 24)} g`;
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: notifications } = useGetNotifications({ unreadOnly: false as any });
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      },
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Sticky Top Navbar */}
      <header className="h-16 shrink-0 sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-screen-2xl mx-auto w-full">
          {/* Logo */}
          <Link href="/dashboard">
            <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight cursor-pointer select-none shrink-0">
              <Activity className="w-5 h-5" />
              <span>TRADE<span className="text-foreground">AI</span></span>
            </div>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer relative group",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "")} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/0 group-hover:bg-primary/40 rounded-full transition-all" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right: Notifications + User Profile */}
          <div className="flex items-center gap-1">
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border/50 p-0" sideOffset={4}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="font-semibold text-sm">Bildirimler</div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      onClick={handleMarkAllRead}
                    >
                      <CheckCheck className="w-3 h-3" />
                      Tümünü Okundu İşaretle
                    </Button>
                  )}
                </div>
                <ScrollArea className="max-h-[360px]">
                  {!notifications || notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Bildirim bulunmuyor.
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            "flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                            !n.isRead && "bg-primary/5"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-xs font-medium leading-snug", !n.isRead && "text-foreground")}>{n.title}</p>
                              <span className="text-[10px] text-muted-foreground shrink-0">{relativeTime(n.createdAt)}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Avatar className="w-7 h-7 border border-border">
                    <AvatarImage src={user?.avatarUrl || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {user?.name?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex items-center gap-2 cursor-pointer w-full">
                      <Settings className="w-4 h-4" />
                      Ayarlar
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden flex items-center overflow-x-auto gap-1 px-3 pb-2 border-t border-border/30 bg-background/80">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] font-medium cursor-pointer whitespace-nowrap transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
