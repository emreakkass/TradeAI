import { pgTable, serial, text, timestamp, numeric, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sentimentEnum = pgEnum("sentiment", ["POSITIVE", "NEGATIVE", "NEUTRAL"]);

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  summary: text("summary").notNull(),
  sentiment: sentimentEnum("sentiment").default("NEUTRAL").notNull(),
  sentimentScore: numeric("sentiment_score", { precision: 5, scale: 4 }).default("0").notNull(),
  relatedSymbols: jsonb("related_symbols").$type<string[]>().default([]),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, createdAt: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;
