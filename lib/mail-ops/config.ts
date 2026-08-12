// Central config for the mail-ops internal dashboard.
// Everything here is isolated from the public site config on purpose.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[mail-ops] Missing required environment variable: ${name}. See lib/mail-ops/README.md for setup.`
    );
  }
  return value;
}

export const mailOpsConfig = {
  adminEmail: (process.env.MAIL_OPS_ADMIN_EMAIL ?? "democratiseresearch@gmail.com").toLowerCase(),
  googleClientId: () => required("MAIL_OPS_GOOGLE_CLIENT_ID"),
  googleClientSecret: () => required("MAIL_OPS_GOOGLE_CLIENT_SECRET"),
  authSecret: () => required("MAIL_OPS_AUTH_SECRET"),
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
