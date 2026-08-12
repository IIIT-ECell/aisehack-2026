import type { Metadata } from "next";

// Isolated internal-only section. Explicitly de-indexed and never linked
// from the public site's nav, footer, or sitemap.
export const metadata: Metadata = {
  title: "mail-ops",
  robots: { index: false, follow: false, nocache: true },
};

export default function MailOpsLayout({ children }: { children: React.ReactNode }) {
  // data-lenis-prevent: the public site's ReactLenis (app/layout.tsx) wraps
  // the whole document and hijacks wheel/touch scrolling by default, which
  // breaks nested overflow-y-auto panes in this dashboard. This attribute
  // tells Lenis to leave scroll input inside this subtree to the browser.
  return (
    <div className="mail-ops-root" data-lenis-prevent>
      {children}
    </div>
  );
}
