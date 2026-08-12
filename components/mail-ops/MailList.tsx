"use client";

import { CategoryBadge } from "./CategoryBadge";
import type { MailCategory } from "@/lib/mail-ops/config";
import { cn } from "@/lib/utils";

export interface MailRowData {
  id: string;
  threadId: string;
  fromName: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  category?: MailCategory;
  categorizing?: boolean;
}

export function MailList({
  items,
  selectedThreadId,
  onSelect,
  onCategorize,
}: {
  items: MailRowData[];
  selectedThreadId?: string;
  onSelect: (item: MailRowData) => void;
  onCategorize: (item: MailRowData) => void;
}) {
  if (items.length === 0) {
    return <p className="p-6 text-sm text-zinc-500">No mail matches this query.</p>;
  }

  return (
    <ul className="divide-y divide-white/5">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "cursor-pointer px-4 py-3 transition-colors hover:bg-white/5",
            selectedThreadId === item.threadId && "bg-white/10"
          )}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("truncate text-sm", item.unread ? "font-semibold text-white" : "text-zinc-300")}>
                  {item.fromName || item.from}
                </span>
                <span className="shrink-0 text-[11px] text-zinc-600">{item.date}</span>
              </div>
              <p className="truncate text-sm text-zinc-400">{item.subject}</p>
              <p className="truncate text-xs text-zinc-600">{item.snippet}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {item.category ? (
                <CategoryBadge category={item.category} />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategorize(item);
                  }}
                  disabled={item.categorizing}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400 hover:border-primary/50 hover:text-primary disabled:opacity-50"
                >
                  {item.categorizing ? "…" : "Categorize"}
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
