import { NextResponse } from "next/server";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";

// Gate for the hidden mail-ops dashboard. Not linked from anywhere in the
// public site's nav/sitemap; this middleware is the second layer, on top
// of the Google-account allowlist enforced in auth.ts's signIn callback.
export default auth((req) => {
  // NextURL's `pathname` is already basePath-relative in middleware (Next
  // strips the configured basePath before middleware ever sees it, and
  // re-applies it automatically when a NextURL clone is serialized for a
  // redirect's Location header). So route comparisons AND the redirect
  // target below must both stay in plain app-relative terms — manually
  // prepending NEXT_PUBLIC_BASE_PATH here double-applies it, producing
  // "/aisehack/aisehack/..." on the deployed server (confirmed via
  // `curl http://localhost:3000/...` directly against the container).
  const { pathname } = req.nextUrl;
  const isSignInPage = pathname === mailOpsConfig.signInPath;
  const isApiRoute = pathname.startsWith("/api/mail-ops");

  if (isSignInPage) return NextResponse.next();

  if (!req.auth || req.auth.error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = mailOpsConfig.signInPath;
    signInUrl.search = "";
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mail-ops-x9k2/:path*", "/api/mail-ops/:path*"],
};
