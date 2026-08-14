import { NextResponse } from "next/server";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";

// Gate for the hidden mail-ops dashboard. Not linked from anywhere in the
// public site's nav/sitemap; this middleware is the second layer, on top
// of the Google-account allowlist enforced in auth.ts's signIn callback.
// req.nextUrl.pathname here includes the site's basePath (e.g. "/aisehack")
// even though the matcher below is defined basePath-relative — the two are
// not the same thing, and mixing them up breaks both the signin-page check
// (infinite redirect loop) and the API 404 check. Always strip basePath
// before comparing, and add it back explicitly when building redirect URLs.

// Every gated API prefix must be listed here as well as in the matcher below.
// A prefix present in the matcher but missing here falls into the redirect
// branch instead of the 404 branch, which tells an unauthenticated caller the
// route exists — exactly what the 404-not-403 convention exists to prevent.
const API_PREFIXES = ["/api/mail-ops", "/api/kaggle-ops"];

export default auth((req) => {
  // Whether req.nextUrl.pathname includes the configured basePath here has
  // behaved inconsistently across testing against the deployed server
  // (confirmed via direct curl against the container, not assumption) —
  // so this strips it defensively rather than trusting either behavior,
  // and the redirect below is built as a plain URL (origin + explicit
  // basePath + path) rather than relying on NextURL's clone()/.pathname
  // re-application semantics, which have also proven unreliable.
  const trimmedBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
  const rawPathname = req.nextUrl.pathname;
  const pathname =
    trimmedBasePath && rawPathname.startsWith(trimmedBasePath) ? rawPathname.slice(trimmedBasePath.length) || "/" : rawPathname;

  const isSignInPage = pathname === mailOpsConfig.signInPath;
  const isApiRoute = API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isSignInPage) return NextResponse.next();

  if (!req.auth || req.auth.error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const target = new URL(`${trimmedBasePath}${mailOpsConfig.signInPath}`, req.nextUrl.origin);
    return NextResponse.redirect(target);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mail-ops-x9k2/:path*", "/api/mail-ops/:path*", "/api/kaggle-ops/:path*"],
};
