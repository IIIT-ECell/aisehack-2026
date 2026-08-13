// Central config for the mail-ops internal dashboard.
// Everything here is isolated from the public site config on purpose.
//
// IMPORTANT: none of these values may throw at module-evaluation time.
// auth.ts constructs NextAuth(...) at module top level, and that module is
// imported by proxy.ts (Next's middleware), which Next.js loads as a
// single runtime for the *entire app* regardless of its `matcher` scope —
// so a throw here previously took down every route on the public site,
// not just mail-ops ones, whenever a mail-ops env var was unset. Missing
// config must instead surface only when someone actually exercises
// mail-ops, via isMailOpsConfigured()/requireAdminSession().

// .trim(): stray whitespace pasted into a deploy env file has already
// silently broken auth/routing more than once tonight — trim defensively
// rather than trust every future edit to be clean.
function optional(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function isMailOpsConfigured(): boolean {
  return Boolean(optional("MAIL_OPS_GOOGLE_CLIENT_ID") && optional("MAIL_OPS_GOOGLE_CLIENT_SECRET") && optional("MAIL_OPS_AUTH_SECRET"));
}

export const mailOpsConfig = {
  adminEmail: (process.env.MAIL_OPS_ADMIN_EMAIL ?? "democratiseresearch@gmail.com").trim().toLowerCase(),
  googleClientId: () => optional("MAIL_OPS_GOOGLE_CLIENT_ID"),
  googleClientSecret: () => optional("MAIL_OPS_GOOGLE_CLIENT_SECRET"),
  authSecret: () => optional("MAIL_OPS_AUTH_SECRET"),
  geminiApiKey: process.env.MAIL_OPS_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
  gmailScopes: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ],
  // Default search restricting the inbox view to hackathon-related mail.
  defaultQuery: process.env.MAIL_OPS_DEFAULT_QUERY || "aisehack OR hackathon",
  signInPath: "/mail-ops-x9k2/signin",
  dashboardPath: "/mail-ops-x9k2",
} as const;

// Fixed CC list for every batch-send blast (organizer + stakeholders).
// Static and not editable per-send from the UI.
export const BATCH_SEND_CC = [
  "pk.guru@iiit.ac.in",
  "rahul.sundar95@gmail.com",
  "amolmk@gmail.com",
  "laks316@gmail.com",
  "bhoomikasingh2026@gmail.com",
] as const;

export const CATEGORIES = [
  "registration",
  "sponsorship",
  "team-formation",
  "technical-dataset",
  "logistics-travel",
  "general-query",
  "other",
] as const;

export type MailCategory = (typeof CATEGORIES)[number];
