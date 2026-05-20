import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, BarChart2, ShieldAlert, Zap, ArrowRight, TrendingUp, Cpu } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="h-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
          <Activity className="w-8 h-8" />
          <span>TRADE<span className="text-foreground">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-[100%] blur-[100px] rotate-12" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-sm font-medium text-muted-foreground mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-foreground">v2.0 Model Live</span> - 94% accuracy on tech sector
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Machine Precision.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Human Decisions.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The ultimate AI-powered trading cockpit. We scan the markets, analyze sentiment, and compute the risks. You just decide yes or no.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                Launch Terminal <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-border hover:bg-muted">
                View Performance
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-y border-border/50 bg-card/30 backdrop-blur-sm p-8 w-full max-w-5xl rounded-2xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">12M+</div>
            <div className="text-sm text-muted-foreground mt-1">Symbols Analyzed Daily</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-primary">87.4%</div>
            <div className="text-sm text-muted-foreground mt-1">Win Rate (Top Quartile)</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">&lt;50ms</div>
            <div className="text-sm text-muted-foreground mt-1">Signal Latency</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-accent">$4.2B</div>
            <div className="text-sm text-muted-foreground mt-1">Simulated Volume</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 lg:px-12 bg-card/30 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Professional Grade Infrastructure</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Built for sophisticated traders who need an edge in modern markets.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Market Scanner</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time scanning across all markets. Multi-factor scoring combining technicals, momentum, and sentiment.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Risk Modeling</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dynamic risk-to-reward calculations with automated entry, stop-loss, and take-profit targets for every signal.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-3">News & Sentiment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instant NLP analysis of news and social feeds. Catch market-moving events before the crowd reacts.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2 mb-4 text-foreground/80">
          <Activity className="w-5 h-5" />
          <span className="font-semibold tracking-tight">TRADE<span className="text-foreground">AI</span></span>
        </div>
        <p>© 2025 TradeAI Platform. For simulation and informational purposes only.</p>
      </footer>
    </div>
  );
}
