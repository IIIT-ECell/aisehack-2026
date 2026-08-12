import type { Metadata } from "next";

// Isolated internal-only section. Explicitly de-indexed and never linked
// from the public site's nav, footer, or sitemap.
export const metadata: Metadata = {
  title: "mail-ops",
  robots: { index: false, follow: false, nocache: true },
};

export default function MailOpsLayout({ children }: { children: React.ReactNode }) {
  return <div className="mail-ops-root">{children}</div>;
}
