import { pgTable, serial, text, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signalTypeEnum = pgEnum("signal_type", ["STRONG_BUY", "BUY", "HOLD", "SELL", "RISKY"]);
export const marketTypeEnum = pgEnum("market_type", ["NASDAQ", "NYSE", "BIST", "CRYPTO", "FOREX", "OTHER"]);

export const aiSignalsTable = pgTable("ai_signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  market: marketTypeEnum("market").default("NASDAQ").notNull(),
  price: numeric("price", { precision: 18, scale: 4 }).notNull(),
  change: numeric("change", { precision: 18, scale: 4 }).notNull(),
  changePercent: numeric("change_percent", { precision: 10, scale: 4 }).notNull(),
  signal: signalTypeEnum("signal").notNull(),
  aiScore: integer("ai_score").notNull(),
  technicalScore: integer("technical_score").notNull(),
  sentimentScore: integer("sentiment_score").notNull(),
  newsScore: integer("news_score").notNull(),
  riskScore: integer("risk_score").notNull(),
  momentumScore: integer("momentum_score").notNull(),
  volume: numeric("volume", { precision: 18, scale: 2 }).notNull(),
  marketCap: numeric("market_cap", { precision: 20, scale: 2 }),
  analysis: text("analysis").notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 4 }),
  stopLoss: numeric("stop_loss", { precision: 18, scale: 4 }),
  takeProfit: numeric("take_profit", { precision: 18, scale: 4 }),
  riskReward: text("risk_reward"),
  rsi: numeric("rsi", { precision: 8, scale: 4 }),
  macd: numeric("macd", { precision: 12, scale: 6 }),
  ema20: numeric("ema20", { precision: 18, scale: 4 }),
  ema50: numeric("ema50", { precision: 18, scale: 4 }),
  sma200: numeric("sma200", { precision: 18, scale: 4 }),
  bollingerUpper: numeric("bollinger_upper", { precision: 18, scale: 4 }),
  bollingerLower: numeric("bollinger_lower", { precision: 18, scale: 4 }),
  support: numeric("support", { precision: 18, scale: 4 }),
  resistance: numeric("resistance", { precision: 18, scale: 4 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiSignalSchema = createInsertSchema(aiSignalsTable).omit({ id: true, createdAt: true });
export type InsertAiSignal = z.infer<typeof insertAiSignalSchema>;
export type AiSignal = typeof aiSignalsTable.$inferSelect;
