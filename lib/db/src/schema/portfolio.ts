import { pgTable, serial, text, timestamp, numeric, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const tradeTypeEnum = pgEnum("trade_type", ["BUY", "SELL"]);
export const tradeStatusEnum = pgEnum("trade_status", ["OPEN", "CLOSED", "PENDING"]);

export const portfoliosTable = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }).default("0").notNull(),
  cashBalance: numeric("cash_balance", { precision: 18, scale: 2 }).default("50000").notNull(),
  investedAmount: numeric("invested_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  totalPnl: numeric("total_pnl", { precision: 18, scale: 2 }).default("0").notNull(),
  totalPnlPercent: numeric("total_pnl_percent", { precision: 10, scale: 4 }).default("0").notNull(),
  dayPnl: numeric("day_pnl", { precision: 18, scale: 2 }).default("0").notNull(),
  dayPnlPercent: numeric("day_pnl_percent", { precision: 10, scale: 4 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  market: text("market").notNull(),
  type: tradeTypeEnum("type").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull(),
  price: numeric("price", { precision: 18, scale: 4 }).notNull(),
  totalValue: numeric("total_value", { precision: 18, scale: 2 }).notNull(),
  stopLoss: numeric("stop_loss", { precision: 18, scale: 4 }),
  takeProfit: numeric("take_profit", { precision: 18, scale: 4 }),
  status: tradeStatusEnum("status").default("OPEN").notNull(),
  isPaper: boolean("is_paper").default(false).notNull(),
  pnl: numeric("pnl", { precision: 18, scale: 2 }),
  pnlPercent: numeric("pnl_percent", { precision: 10, scale: 4 }),
  closedAt: timestamp("closed_at"),
  aiSignalId: integer("ai_signal_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
