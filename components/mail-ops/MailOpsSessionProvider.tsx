"use client";

import { SessionProvider } from "next-auth/react";

// next-auth's client-side signIn()/signOut() resolve their target URL from
// a module-level default that only knows about NEXTAUTH_URL/AUTH_URL --
// neither of which is NEXT_PUBLIC_-prefixed, so it's invisible in the
// browser bundle. Without this, the client silently drops the deployed
// basePath and posts to a bare "/api/auth/...", missing "/aisehack" once
// deployed under that subpath. SessionProvider's basePath prop is how
// next-auth expects this to be told to client code.
export function MailOpsSessionProvider({ children }: { children: React.ReactNode }) {
  const basePath = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`;
  return <SessionProvider basePath={basePath}>{children}</SessionProvider>;
}
