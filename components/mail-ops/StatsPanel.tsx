"use client";

import { CategoryBadge } from "./CategoryBadge";
import type { MailCategory } from "@/lib/mail-ops/config";

export interface Stats {
  total: number;
  byCategory: Record<string, number>;
  byDay: Record<string, number>;
}

export function StatsPanel({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return <div className="text-sm text-zinc-500">Loading stats…</div>;
  }

  const maxCategory = Math.max(1, ...Object.values(stats.byCategory));
  const days = Object.entries(stats.byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  const maxDay = Math.max(1, ...days.map(([, v]) => v));

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Categorized queries by type</h3>
        <div className="space-y-2">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <div key={category} className="flex items-center gap-2">
              <div className="w-32 shrink-0">
                <CategoryBadge category={category as MailCategory} />
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(count / maxCategory) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-zinc-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">Volume (last 14 days seen)</h3>
        <div className="flex h-24 items-end gap-1">
          {days.length === 0 && <span className="text-xs text-zinc-600">No data yet</span>}
          {days.map(([day, count]) => (
            <div key={day} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-secondary/70 transition-colors group-hover:bg-secondary"
                style={{ height: `${(count / maxDay) * 96}px` }}
                title={`${day}: ${count}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-zinc-600">Total categorized: {stats.total}</p>
      </div>
    </div>
  );
}
