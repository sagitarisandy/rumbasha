// Signed session token, safe to use from proxy.ts (no next/headers).
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "../db/schema";

export const SESSION_COOKIE = "rb_session";
export const MAX_AGE_MS = 7 * 86_400_000;
// Preview-only fallback; set SESSION_SECRET on Vercel so sessions survive redeploys safely.
const SECRET = process.env.SESSION_SECRET ?? "rumbasha-preview-session-secret";

export type Session = { uid: number; role: Role; exp: number };

const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("base64url");

export function encodeSession(s: Session) {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(mac);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export const homeFor = (role: Role) => (role === "siswa" ? "/siswa" : "/admin");
