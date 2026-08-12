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
  anthropicApiKey: process.env.MAIL_OPS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "",
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
