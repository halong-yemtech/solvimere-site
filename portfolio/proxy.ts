import { NextResponse, type NextRequest } from "next/server";

/**
 * Passes the requested dashboard path to server components (as `x-pathname`)
 * so the admin guard can send people back to it after signing in.
 * Authorization itself happens server-side in lib/auth.ts.
 */
export function proxy(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/dashboard/:path*"] };
