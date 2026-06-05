import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
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
  User,
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

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/scanner", label: "YZ Tarayıcı", icon: Activity },
  { href: "/watchlist", label: "İzleme Listesi", icon: List },
  { href: "/portfolio", label: "Portföy", icon: Briefcase },
  { href: "/news", label: "Haberler", icon: Newspaper },
  { href: "/chat", label: "YZ Asistan", icon: MessageSquare },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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

          {/* Right: User Profile */}
          <div className="flex items-center gap-2">
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
