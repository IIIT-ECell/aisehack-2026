import { NextResponse } from "next/server";
import { auth } from "@/lib/mail-ops/auth";
import { mailOpsConfig } from "@/lib/mail-ops/config";

// Gate for the hidden mail-ops dashboard. Not linked from anywhere in the
// public site's nav/sitemap; this middleware is the second layer, on top
// of the Google-account allowlist enforced in auth.ts's signIn callback.
export default auth((req) => {
  // req.nextUrl.pathname includes the deployed basePath (e.g.
  // "/aisehack/mail-ops-x9k2"), NOT the app-relative path — verified
  // empirically. Strip it before comparing against our app-relative
  // route strings, or every check below silently fails once the site is
  // deployed under a subpath.
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const fullPathname = req.nextUrl.pathname;
  const pathname =
    basePath && fullPathname.startsWith(basePath) ? fullPathname.slice(basePath.length) || "/" : fullPathname;

  const isSignInPage = pathname === mailOpsConfig.signInPath;
  const isApiRoute = pathname.startsWith("/api/mail-ops");

  if (isSignInPage) return NextResponse.next();

  if (!req.auth || req.auth.error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // NextURL does NOT re-apply basePath when .pathname is reassigned and
    // the result is serialized for NextResponse.redirect() — also verified
    // empirically. Prepend it explicitly so the browser lands on a URL
    // still under the app's deployed subpath, not one outside it that
    // 404s at whatever fronts this app.
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = `${basePath}${mailOpsConfig.signInPath}`;
    signInUrl.search = "";
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/mail-ops-x9k2/:path*", "/api/mail-ops/:path*"],
};
