import { Router } from "express";
import { db, usersTable, portfoliosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createToken } from "../lib/auth.js";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const { email, password, name } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    email,
    password: hashPassword(password),
    name,
    riskLevel: "MEDIUM",
    paperBalance: "100000",
  }).returning();

  // Create portfolio for new user
  await db.insert(portfoliosTable).values({
    userId: user.id,
    totalValue: "50000",
    cashBalance: "50000",
    investedAmount: "0",
    totalPnl: "0",
    totalPnlPercent: "0",
    dayPnl: "0",
    dayPnlPercent: "0",
  });

  const token = createToken(user.id);
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      riskLevel: user.riskLevel,
      paperBalance: Number(user.paperBalance),
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = createToken(user.id);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      riskLevel: user.riskLevel,
      paperBalance: Number(user.paperBalance),
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    riskLevel: user.riskLevel,
    paperBalance: Number(user.paperBalance),
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

export default router;
