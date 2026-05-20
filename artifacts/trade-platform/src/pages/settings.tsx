import { Sidebar } from "@/components/layout";
import { useGetMe, useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user } = useAuth();
  
  return (
    <Sidebar>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and trading settings.</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <div className="p-2 bg-muted/50 rounded border border-border/50 text-sm">{user?.name}</div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-2 bg-muted/50 rounded border border-border/50 text-sm">{user?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>Configure how AI signals adapt to your style.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Risk Level</Label>
                  <p className="text-sm text-muted-foreground">Determines stop-loss tightness and signal filtering.</p>
                </div>
                <Select defaultValue={user?.riskLevel || "MEDIUM"}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low (Conservative)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (Balanced)</SelectItem>
                    <SelectItem value="HIGH">High (Aggressive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="bg-border/50" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Paper Trading Balance</Label>
                  <p className="text-sm text-muted-foreground">Starting balance for simulation accounts.</p>
                </div>
                <div className="font-mono font-bold text-lg text-primary">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(user?.paperBalance || 100000)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts when targets are hit.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Buy Signals</Label>
                  <p className="text-sm text-muted-foreground">Instant notifications for STRONG BUY signals.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>News Impact</Label>
                  <p className="text-sm text-muted-foreground">Alerts for extreme sentiment shifts.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}
