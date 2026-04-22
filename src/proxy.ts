import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin dashboard auth check
  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const isValid = await verifySession(token);

    if (!isValid) {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.delete("admin_session");
      return response;
    }

    return NextResponse.next();
  }

  // Admin API routes auth check (except auth endpoint itself)
  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/auth") {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isValid = await verifySession(token);

    if (!isValid) {
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
      response.cookies.delete("admin_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
