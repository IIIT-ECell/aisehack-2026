import { NextResponse } from "next/server";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";

// Gate for the hidden mail-ops dashboard. Not linked from anywhere in the
// public site's nav/sitemap; this middleware is the second layer, on top
// of the Google-account allowlist enforced in auth.ts's signIn callback.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isSignInPage = pathname === mailOpsConfig.signInPath;
  const isApiRoute = pathname.startsWith("/api/mail-ops");

  if (isSignInPage) return NextResponse.next();

  if (!req.auth || req.auth.error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const signInUrl = new URL(mailOpsConfig.signInPath, req.nextUrl.origin);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mail-ops-x9k2/:path*", "/api/mail-ops/:path*"],
};
