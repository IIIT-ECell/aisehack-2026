# mail-ops — internal AISEHack mail dashboard

A hidden, admin-only dashboard for triaging student emails sent to
`democratiseresearch@gmail.com` about AISEHack. It is **not** linked from
any public page, is disallowed in `robots.txt`, and only the
`MAIL_OPS_ADMIN_EMAIL` Google account can ever obtain a session — every
other account is rejected during sign-in itself (`lib/mail-ops/auth.ts`).

All code for this feature lives in its own namespace, separate from the
public marketing site:

- `lib/mail-ops/` — auth, Gmail API client, AI categorization, file cache
- `app/api/auth/[...nextauth]/` — NextAuth route handler
- `app/api/mail-ops/` — dashboard API routes (list/thread/reply/categorize/stats)
- `app/mail-ops-x9k2/` — the dashboard UI itself, at a non-guessable path
- `components/mail-ops/` — dashboard-only UI components
- `proxy.ts` — gates `/mail-ops-x9k2/*` and `/api/mail-ops/*` (Next.js 16's
  successor to `middleware.ts`)

## How access control works

1. **Google sign-in allowlist** (the real boundary): `auth.ts`'s `signIn`
   callback compares the signed-in Google account's email against
   `MAIL_OPS_ADMIN_EMAIL` and rejects everyone else outright — no session
   cookie is ever issued to another account.
2. **Middleware**: redirects any request without a valid session to the
   sign-in page (for the dashboard pages) or returns a bare `404` (for the
   API routes), so an unauthenticated visitor can't distinguish "route
   doesn't exist" from "route exists but you're not allowed in."
3. **No public links, no robots.txt entry**: the route isn't in any
   nav/footer/sitemap. It's deliberately *not* listed in `robots.txt`
   either — a `Disallow` entry there is public and would just announce
   the hidden path to anyone who checks it. Instead, `noindex` is set via
   a page-level meta tag (`app/mail-ops-x9k2/layout.tsx`), which keeps it
   out of search engines without revealing it to a `robots.txt` scan.
4. **Encrypted session**: NextAuth issues an encrypted, `httpOnly`,
   `secure` JWT cookie (`MAIL_OPS_AUTH_SECRET` is the encryption key) —
   nothing about the session is readable or forgeable client-side.

## One-time Google Cloud setup (required — do this before it will work)

The dashboard needs its own OAuth client so it can read/send mail as
`democratiseresearch@gmail.com`. This has to be created once, by someone
with access to a Google Cloud project tied to that account:

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create (or pick) a project.
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: External (or Internal if using Google Workspace).
   - Add scopes: `.../auth/gmail.readonly`, `.../auth/gmail.send`,
     `openid`, `email`, `profile`.
   - Under "Test users" (while the app is unpublished), add
     `democratiseresearch@gmail.com` — otherwise Google will refuse to
     grant these scopes to it.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: Web application.
   - Authorized redirect URI — this site is served under the
     `/aisehack` basePath (`next.config.ts`), and Next.js prefixes *all*
     routes with it, including API routes, so the real production URL is:
     - `https://precog.iiit.ac.in/aisehack/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (local dev has no
       basePath — `.env.development` sets `NEXT_PUBLIC_BASE_PATH=` empty).
   - Save the generated **Client ID** and **Client Secret**.
5. Set the environment variables in `.env.example` (copy to `.env.local`
   for local dev, or your host's environment settings for production):
   - `MAIL_OPS_GOOGLE_CLIENT_ID`, `MAIL_OPS_GOOGLE_CLIENT_SECRET`
   - `MAIL_OPS_AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `MAIL_OPS_ADMIN_EMAIL=democratiseresearch@gmail.com`
   - `AUTH_URL` — Auth.js has its own, separate `basePath` concept
     (defaults to `/api/auth`) for building absolute redirect URLs, on
     top of Next.js's site-wide `/aisehack` basePath. Setting `AUTH_URL`
     to the full path tells Auth.js to use that as its base, so the two
     stay in sync:
     - Production: `AUTH_URL=https://precog.iiit.ac.in/aisehack/api/auth`
     - Local dev: `AUTH_URL=http://localhost:3000/api/auth`
   - `MAIL_OPS_GEMINI_API_KEY` — optional, enables AI categorization
6. Visit `https://precog.iiit.ac.in/aisehack/mail-ops-x9k2` and sign in
   **as democratiseresearch@gmail.com** — the consent screen will ask for
   Gmail read + send permission on that mailbox specifically, which is
   what lets the dashboard query and reply to its own inbox.

Until these credentials exist, the routes will throw a clear
"Missing required environment variable" error rather than failing silently.

## Notes on categorization

AI categorization (`lib/mail-ops/categorize.ts`, via Gemini) runs on-demand
from the "Scan for new" button in the Queries & Grievances tab, not
automatically on every page load, to avoid burning API calls just from
opening the dashboard. Results — including the "awaiting reply" flag used
to surface not-yet-answered queries — are cached in
`.mail-ops-cache/categories.json` (gitignored — it can contain excerpts of
student email content, so it must never be committed).

## Teams data (registration form import)

The Teams tab and the "sender's team" panel shown while triaging a query
are backed by `.mail-ops-cache/teams.json` (gitignored — real names, phone
numbers, emails), generated from the registration Google Form's response
export by a one-time script:

```
pip3 install openpyxl   # once
python3 scripts/import-teams.py "/path/to/Registration form ... (Responses).xlsx"
```

Re-run it whenever there's a fresh export to refresh the dashboard's copy.
Until this file exists, the Teams tab shows an empty state rather than
erroring.
