import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

async function seedNotifications(userId: number) {
  const existing = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId)).limit(1);
  if (existing.length > 0) return;

  const samples = [
    { type: "BUY_SIGNAL" as const, title: "Strong Buy Signal: NVDA", message: "NVIDIA showing STRONG BUY signal. AI Score: 94/100. Entry: $875.40, Target: $950, Stop: $850.", symbol: "NVDA" },
    { type: "BREAKOUT" as const, title: "Breakout Alert: BTC", message: "Bitcoin breaking above key resistance at $67,500. Volume surge detected. Momentum building.", symbol: "BTC" },
    { type: "PRICE_ALERT" as const, title: "Price Alert: AAPL", message: "Apple Inc. crossed your alert price of $190. Current price: $189.50.", symbol: "AAPL" },
    { type: "NEWS_ALERT" as const, title: "Breaking: Fed Rate Decision", message: "Federal Reserve signals potential rate cuts. Bullish sentiment for growth stocks.", symbol: null },
    { type: "SYSTEM" as const, title: "AI Scanner Complete", message: "Market scan finished. 8 new signals identified across NASDAQ and Crypto markets.", symbol: null },
  ];

  for (let i = 0; i < samples.length; i++) {
    await db.insert(notificationsTable).values({ userId, ...samples[i], isRead: i > 1 });
  }
}

function fmt(n: any) {
  return {
    id: n.id, type: n.type, title: n.title, message: n.message,
    symbol: n.symbol ?? null, isRead: n.isRead, createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  await seedNotifications(userId);
  const { unreadOnly } = req.query;
  let notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt));
  if (unreadOnly === "true") notifs = notifs.filter(n => !n.isRead);
  res.json(notifs.map(fmt));
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const userId = req.userId!;
  const [updated] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(updated));
});

router.post("/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.json({ message: "All notifications marked as read" });
});

export default router;
