import { cookies } from "next/headers";
import type { Role } from "../db/schema";
import { MAX_AGE_MS, SESSION_COOKIE, decodeSession, encodeSession } from "./token";

export { homeFor } from "./token";

export async function createSession(uid: number, role: Role) {
  const exp = Date.now() + MAX_AGE_MS;
  (await cookies()).set(SESSION_COOKIE, encodeSession({ uid, role, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession() {
  return decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
}
