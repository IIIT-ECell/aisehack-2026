import { NextResponse } from "next/server";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";

// Gate for the hidden mail-ops dashboard. Not linked from anywhere in the
// public site's nav/sitemap; this middleware is the second layer, on top
// of the Google-account allowlist enforced in auth.ts's signIn callback.
export default auth((req) => {
  // Whether req.nextUrl.pathname includes the configured basePath here has
  // behaved inconsistently across testing against the deployed server
  // (confirmed via direct curl against the container, not assumption) —
  // so this strips it defensively rather than trusting either behavior,
  // and the redirect below is built as a plain URL (origin + explicit
  // basePath + path) rather than relying on NextURL's clone()/.pathname
  // re-application semantics, which have also proven unreliable.
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
  const rawPathname = req.nextUrl.pathname;
  const pathname =
    basePath && rawPathname.startsWith(basePath) ? rawPathname.slice(basePath.length) || "/" : rawPathname;

  const isSignInPage = pathname === mailOpsConfig.signInPath;
  const isApiRoute = pathname.startsWith("/api/mail-ops");

  if (isSignInPage) return NextResponse.next();

  if (!req.auth || req.auth.error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const target = new URL(`${basePath}${mailOpsConfig.signInPath}`, req.nextUrl.origin);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mail-ops-x9k2/:path*", "/api/mail-ops/:path*"],
};
