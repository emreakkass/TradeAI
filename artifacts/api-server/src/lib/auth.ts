import { createHmac, timingSafeEqual } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-key-change-in-prod";

export function hashPassword(password: string): string {
  return createHmac("sha256", SESSION_SECRET).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(passwordHash), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function createToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, ts, sig] = parts;
    const payload = `${userId}:${ts}`;
    const expectedSig = createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    return parseInt(userId, 10);
  } catch {
    return null;
  }
}
