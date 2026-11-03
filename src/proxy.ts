import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession, homeFor } from "@/lib/auth/token";

// Optimistic routing only; every page and action re-checks the session against the database.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/masuk") {
    return session ? NextResponse.redirect(new URL(homeFor(session.role), request.url)) : NextResponse.next();
  }
  if (!session) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  const wantsAdmin = pathname.startsWith("/admin");
  if (wantsAdmin === (session.role === "siswa")) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/siswa/:path*", "/admin/:path*", "/masuk"],
};
