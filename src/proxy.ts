import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_auth";

// Demo-only auth: the cookie just holds the shared password itself. A real
// deployment would use Supabase Auth or a signed session token instead.
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get(COOKIE_NAME)?.value === process.env.ADMIN_PASSWORD;

  if (pathname === "/admin/login") {
    if (isAuthed) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
