import { NextResponse } from "next/server";

const PUBLIC_ONLY  = ["/login", "/register", "/verify-otp", "/forgot-password"];
const PROTECTED    = ["/dashboard"];
const ADMIN_ONLY   = ["/dashboard/admin"];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const accessToken  = request.cookies.get("accessToken")?.value;
  const userRole     = request.cookies.get("userRole")?.value;

  const isPublicOnly = PUBLIC_ONLY.some((p) => pathname.startsWith(p));
  const isProtected  = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdminOnly  = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  if (isPublicOnly && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdminOnly && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
