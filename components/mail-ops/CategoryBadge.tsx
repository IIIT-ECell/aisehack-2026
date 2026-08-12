"use client";

import { cn } from "@/lib/utils";
import type { MailCategory } from "@/lib/mail-ops/config";

const COLORS: Record<MailCategory, string> = {
  registration: "bg-emerald-500/15 text-emerald-300 mail-light:text-emerald-700 border-emerald-500/30",
  sponsorship: "bg-amber-500/15 text-amber-300 mail-light:text-amber-700 border-amber-500/30",
  "team-formation": "bg-sky-500/15 text-sky-300 mail-light:text-sky-700 border-sky-500/30",
  "technical-dataset": "bg-fuchsia-500/15 text-fuchsia-300 mail-light:text-fuchsia-700 border-fuchsia-500/30",
  "logistics-travel": "bg-orange-500/15 text-orange-300 mail-light:text-orange-700 border-orange-500/30",
  "general-query": "bg-zinc-500/15 text-zinc-300 mail-light:text-zinc-700 border-zinc-500/30",
  other: "bg-zinc-700/30 text-zinc-400 mail-light:text-zinc-700 border-zinc-600/30",
};

export function CategoryBadge({ category }: { category?: MailCategory }) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
        uncategorized
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        COLORS[category]
      )}
    >
      {category.replace("-", " ")}
    </span>
  );
}
