// fetch() paths starting with "/" resolve against the browser's current
// origin, not the current page -- this completely bypasses Next.js's
// basePath (which only auto-applies to <Link>/router.push/redirect(),
// never to hand-written fetch() calls). Every mail-ops client-side fetch
// must go through this helper, or it silently drops NEXT_PUBLIC_BASE_PATH
// once deployed under a subpath (confirmed in production: every
// fetch("/api/mail-ops/...") 404'd, landing outside the deployed app).
export function mailOpsApi(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}
