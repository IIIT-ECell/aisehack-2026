import { NextRequest } from "next/server";
import { handlers } from "@/lib/mail-ops/auth";

// Next.js strips the configured basePath (NEXT_PUBLIC_BASE_PATH, "/aisehack")
// before ANY route handler ever sees a request -- but Auth.js's own
// config.basePath (derived from AUTH_URL, needed so the OAuth redirect_uri
// it constructs for Google is the real public callback URL) expects to
// see that same prefix on the incoming request path too. Without this,
// every Auth.js action fails with "UnknownAction: Cannot parse action at
// /api/auth/...", because Auth.js is trying to strip "/aisehack/api/auth"
// off a path that no longer has "/aisehack" on it (Next already removed
// it). Re-add it here before handing the request to next-auth, so both of
// Auth.js's internal uses of basePath agree on the same path.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();

async function withBasePath(req: NextRequest): Promise<NextRequest> {
  if (!basePath) return req;
  const url = new URL(req.url);
  if (url.pathname.startsWith(basePath)) return req;
  url.pathname = `${basePath}${url.pathname}`;

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();
  return new NextRequest(url, { method: req.method, headers: req.headers, body });
}

export async function GET(req: NextRequest) {
  return handlers.GET(await withBasePath(req));
}

export async function POST(req: NextRequest) {
  return handlers.POST(await withBasePath(req));
}
