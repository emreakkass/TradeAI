# 📈 TradeAI

**TradeAI**, piyasa verilerini izleyen, yapay zeka destekli sinyal üreten ve sanal (paper trading) portföy yönetimi sunan bir finans web uygulamasıdır. Dark temalı bir arayüze sahip olan proje; AI tarayıcı, haber duygu analizi, watchlist, portföy takibi ve bir AI sohbet asistanını tek platformda bir araya getirir.

> ⚠️ **Not:** Piyasa fiyatları bu sürümde simüle edilmektedir. Gerçek bir borsa ya da veri sağlayıcısına bağlı değildir. Proje bir eğitim ve portföy geliştirme çalışmasıdır, yatırım tavsiyesi değildir.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle-4169E1?logo=postgresql&logoColor=white)

---

## ✨ Özellikler

- **📊 Dashboard:** Portföy özeti, performans grafiği ve en çok yükselen/düşen varlıklar.
- **🤖 AI Tarayıcı (Scanner):** Teknik göstergelere (RSI, MACD, EMA) dayalı sinyaller. `STRONG_BUY`'dan `RISKY`'ye kadar filtrelenebilir bir tablo ve satır bazlı detaylı analiz.
- **⭐ Watchlist:** Takip edilen varlıkları ekleme ve çıkarma.
- **💼 Portföy ve İşlemler:** Açık pozisyonlar ve işlem geçmişi. Her kullanıcıya kayıt sırasında sanal bakiye tanımlanır.
- **📰 Haber Duygu Analizi:** Haberler duygu etiketiyle listelenir, özet grafik ile toplu görünüm sunulur.
- **💬 AI Sohbet Asistanı:** OpenAI GPT-4.1 ile çalışan, ChatGPT benzeri bir sohbet arayüzü.
- **⚙️ Ayarlar:** Profil, risk seviyesi ve bildirim tercihleri.
- **📱 Responsive Tasarım:** Masaüstü ve mobil cihazlarda kullanılabilen arayüz.

---

## 🛠️ Teknolojiler

| Katman | Teknolojiler |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter, TanStack React Query |
| **Backend** | Node.js 24, Express 5, Pino (loglama) |
| **Veritabanı** | PostgreSQL, Drizzle ORM |
| **Doğrulama** | Zod, drizzle-zod |
| **API Sözleşmesi** | OpenAPI spec, Orval ile otomatik üretilen React Query hook'ları ve Zod şemaları |
| **Yapay Zeka** | OpenAI GPT-4.1 (Replit AI Integration üzerinden) |
| **Araçlar** | pnpm workspaces, TypeScript 5.9, esbuild |

---

## 📂 Proje Yapısı

```text
TradeAI/
├── artifacts/
│   ├── trade-platform/   # React + Vite ön yüz uygulaması
│   ├── api-server/       # Express 5 API sunucusu
│   └── mockup-sandbox/   # Bileşen ve arayüz deneme ortamı
├── lib/
│   ├── db/               # Drizzle şeması ve PostgreSQL bağlantısı
│   ├── api-spec/         # OpenAPI tanımı (tek doğruluk kaynağı)
│   ├── api-client-react/ # Orval ile üretilen istemci kodları
│   └── api-zod/          # İstek gövdeleri için Zod şemaları
└── pnpm-workspace.yaml
```

**Mimari yaklaşım:** API önce OpenAPI spec ile tanımlanır, ardından Orval istemci hook'larını ve Zod şemalarını üretir. Bu sayede ön yüz ve arka uç aynı sözleşmeyi paylaşır ve hook'lar elle yazılmaz.

---

## 🚀 Kurulum

**Gereksinimler:** Node.js 24, pnpm, PostgreSQL

```bash
# 1. Bağımlılıkları yükleyin
pnpm install

# 2. Proje kök dizinine bir .env dosyası oluşturup aşağıdaki değişkenleri ekleyin

# 3. Veritabanı şemasını oluşturun (geliştirme ortamı)
pnpm --filter @workspace/db run push

# 4. API sunucusunu başlatın (port 8080)
pnpm --filter @workspace/api-server run dev

# 5. Ön yüzü başlatın (ayrı bir terminalde)
pnpm --filter @workspace/trade-platform run dev
```

### Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantı adresi |
| `SESSION_SECRET` | Token imzalama için HMAC anahtarı |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI proxy adresi (Replit AI Integration) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI proxy anahtarı |

Diğer kullanışlı komutlar:

```bash
pnpm run typecheck   # Tüm paketlerin tip kontrolü
pnpm run build       # Tip kontrolü ve derleme
pnpm --filter @workspace/api-spec run codegen   # API hook ve şemalarını yeniden üret
```

---

## 🧠 Teknik Notlar

- **Kimlik doğrulama:** JWT kütüphanesi kullanmadan HMAC-SHA256 ile özel token üretimi (`userId:timestamp:signature`).
- **Sinyal hesaplama:** Sinyaller sunucuda hesaplanır ve veritabanına kaydedilir. Tarayıcı uç noktası aiScore değerine göre azalan sırada sonuç döndürür.
- **Piyasa verisi:** NASDAQ, NYSE, BIST, kripto ve forex olmak üzere 22 sembol için simüle edilmiş fiyat üreticisi kullanılır. Gerçek bir veri kaynağına (Alpha Vantage, Finnhub, Binance) bağlanmak için `artifacts/api-server/src/lib/marketData.ts` dosyasındaki katmanın değiştirilmesi yeterlidir.

---

## 🗺️ Yol Haritası

- [ ] Simüle edilen veri yerine gerçek piyasa veri sağlayıcısı entegrasyonu
- [ ] Bildirim sisteminin tamamlanması
- [ ] Testlerin (unit ve API) eklenmesi
- [ ] Docker ile tek komutta kurulum

---

## 📸 Ekran Görüntüleri

<!-- Buraya dashboard, scanner ve chat ekran görüntüleri eklenecek -->

---

## 📄 Lisans

Bu proje MIT lisansı altında yayımlanmıştır.

---

**Geliştirici:** Emre
