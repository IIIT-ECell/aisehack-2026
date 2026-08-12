import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { mailOpsConfig } from "./config";

// Auth wiring for the internal mail-ops dashboard only. This is intentionally
// separate from (and unrelated to) the public aisehack site, which has no
// auth of its own. Only mailOpsConfig.adminEmail may ever hold a session:
// every other Google account is rejected in the signIn callback below, so
// no route or page needs to re-check "is this the right admin" beyond
// "does a session exist at all".

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: "RefreshTokenError";
  }
}

interface MailOpsToken {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: "RefreshTokenError";
  [key: string]: unknown;
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: mailOpsConfig.googleClientId(),
      client_secret: mailOpsConfig.googleClientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Google access token");
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    accessTokenExpires: Date.now() + data.expires_in * 1000,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: mailOpsConfig.googleClientId(),
      clientSecret: mailOpsConfig.googleClientSecret(),
      authorization: {
        params: {
          scope: mailOpsConfig.gmailScopes.join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: mailOpsConfig.authSecret(),
  session: { strategy: "jwt" },
  pages: {
    signIn: mailOpsConfig.signInPath,
    error: mailOpsConfig.signInPath,
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      // Hard allowlist: this is the entire access-control model for the
      // dashboard. Anyone else who completes Google sign-in is rejected here
      // and never gets a session cookie at all.
      return (user.email ?? "").toLowerCase() === mailOpsConfig.adminEmail;
    },
    async jwt({ token, account }) {
      const t = token as MailOpsToken;

      if (account) {
        t.accessToken = account.access_token;
        t.refreshToken = account.refresh_token ?? undefined;
        t.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
        return t;
      }

      if (t.accessTokenExpires && Date.now() < t.accessTokenExpires - 60_000) {
        return t;
      }

      if (!t.refreshToken) {
        return t;
      }

      try {
        const refreshed = await refreshAccessToken(t.refreshToken);
        return { ...t, ...refreshed, error: undefined };
      } catch {
        return { ...t, error: "RefreshTokenError" as const };
      }
    },
    async session({ session, token }) {
      const t = token as MailOpsToken;
      session.accessToken = t.accessToken;
      session.error = t.error;
      return session;
    },
  },
});
