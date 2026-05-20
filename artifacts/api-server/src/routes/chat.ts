import { Router } from "express";
import { db, chatMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { SendChatMessageBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

const SYSTEM_PROMPT = `You are TradeAI, an elite AI trading analyst and financial advisor embedded in a professional trading platform. You have deep expertise in:
- Technical analysis (RSI, MACD, Bollinger Bands, EMA, SMA, support/resistance)
- Fundamental analysis and valuation metrics
- Market sentiment and news analysis
- Risk management and portfolio optimization
- Crypto, stocks (NASDAQ, NYSE, BIST), forex markets

Speak with confidence and precision. Provide specific, actionable insights. Always mention relevant technical levels. When asked about specific stocks or crypto, give AI scores and trade signals. Keep responses concise but information-rich. Include risk warnings where appropriate. Do not use emojis. Respond in the same language the user uses (Turkish or English).`;

router.get("/chat/messages", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const messages = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, userId))
    .orderBy(chatMessagesTable.createdAt)
    .limit(50);
  res.json(messages.map(m => ({
    id: m.id, role: m.role, content: m.content, createdAt: m.createdAt.toISOString()
  })));
});

router.post("/chat/messages", requireAuth, async (req: AuthRequest, res) => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const userId = req.userId!;
  const { message } = parsed.data;

  // Save user message
  await db.insert(chatMessagesTable).values({ userId, role: "user", content: message });

  // Get last 10 messages for context
  const history = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.userId, userId))
    .orderBy(desc(chatMessagesTable.createdAt))
    .limit(10);
  history.reverse();

  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: chatMessages,
    max_completion_tokens: 600,
  });

  const aiContent = completion.choices[0]?.message?.content || "I'm unable to respond at this moment. Please try again.";

  const [saved] = await db.insert(chatMessagesTable).values({
    userId, role: "assistant", content: aiContent,
  }).returning();

  res.json({ id: saved.id, role: saved.role, content: saved.content, createdAt: saved.createdAt.toISOString() });
});

router.post("/chat/clear", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  await db.delete(chatMessagesTable).where(eq(chatMessagesTable.userId, userId));
  res.json({ message: "Chat history cleared" });
});

export default router;
