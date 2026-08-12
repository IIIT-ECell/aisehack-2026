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
  awaitingReply?: boolean;
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
    return <p className="p-6 text-sm text-muted-foreground">No mail matches this query.</p>;
  }

  return (
    <ul className="divide-y divide-border/50">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "cursor-pointer px-4 py-3 transition-colors hover:bg-muted",
            selectedThreadId === item.threadId && "bg-accent"
          )}
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "truncate text-sm",
                    item.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.fromName || item.from}
                </span>
                {item.awaitingReply && (
                  <span className="shrink-0 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                    awaiting reply
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-muted-foreground/70">{item.date}</span>
              </div>
              <p className="truncate text-sm text-muted-foreground">{item.subject}</p>
              <p className="truncate text-xs text-muted-foreground/70">{item.snippet}</p>
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
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-50"
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
