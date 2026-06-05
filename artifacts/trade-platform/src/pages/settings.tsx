import { Sidebar } from "@/components/layout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user } = useAuth();

  return (
    <Sidebar>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
          <p className="text-muted-foreground">Hesap tercihlerinizi ve işlem ayarlarınızı yönetin.</p>
        </div>

        <div className="grid gap-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Kişisel bilgileriniz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <div className="p-2 bg-muted/50 rounded border border-border/50 text-sm">{user?.name}</div>
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <div className="p-2 bg-muted/50 rounded border border-border/50 text-sm">{user?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>İşlem Tercihleri</CardTitle>
              <CardDescription>YZ sinyallerinin stilinize göre uyarlanmasını yapılandırın.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Risk Seviyesi</Label>
                  <p className="text-sm text-muted-foreground">Zarar-kes sıkılığını ve sinyal filtrelemesini belirler.</p>
                </div>
                <Select defaultValue={user?.riskLevel || "MEDIUM"}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Risk seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Düşük (Muhafazakâr)</SelectItem>
                    <SelectItem value="MEDIUM">Orta (Dengeli)</SelectItem>
                    <SelectItem value="HIGH">Yüksek (Agresif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sanal İşlem Bakiyesi</Label>
                  <p className="text-sm text-muted-foreground">Simülasyon hesabı için başlangıç bakiyesi.</p>
                </div>
                <div className="font-mono font-bold text-lg text-primary">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(user?.paperBalance || 100000)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Bildirimler</CardTitle>
              <CardDescription>Uyarılarınızı yönetin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fiyat Uyarıları</Label>
                  <p className="text-sm text-muted-foreground">Hedef fiyatlara ulaşıldığında bildirim al.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>YZ Alım Sinyalleri</Label>
                  <p className="text-sm text-muted-foreground">GÜÇLÜ AL sinyalleri için anlık bildirim.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Haber Etkisi</Label>
                  <p className="text-sm text-muted-foreground">Aşırı duyarlılık değişikliklerinde uyarı.</p>
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
