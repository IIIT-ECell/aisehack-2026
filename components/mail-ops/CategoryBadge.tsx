"use client";

import { cn } from "@/lib/utils";
import type { MailCategory } from "@/lib/mail-ops/config";

const COLORS: Record<MailCategory, string> = {
  registration: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  sponsorship: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "team-formation": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  "technical-dataset": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  "logistics-travel": "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "general-query": "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  other: "bg-zinc-700/30 text-zinc-400 border-zinc-600/30",
};

export function CategoryBadge({ category }: { category?: MailCategory }) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500">
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
