"use client";

import { cn } from "@/lib/utils";
import type { BoardStatus, SeparationAnalysis } from "@/lib/kaggle-ops/types";
import { Empty, Panel, formatScore } from "./Bits";

const VERDICT_STYLES: Record<SeparationAnalysis["verdict"], string> = {
  decisive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  clustered: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  "noise-level": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "insufficient-data": "border-border bg-muted text-muted-foreground",
};

/**
 * Kaggle renders the score column as an ordered list and never says whether
 * the ordering is meaningful. This turns that column into gap structure: where
 * the natural cutoffs are, which teams are separated only by noise, and which
 * are outright tied.
 */
export function SeparationPanel({
  separation,
  boards,
}: {
  separation: SeparationAnalysis[];
  boards: BoardStatus[];
}) {
  if (separation.length === 0) {
    return (
      <Panel title="Score separation">
        <Empty>No board data to analyse.</Empty>
      </Panel>
    );
  }

  return (
    <Panel
      title="Score separation — where the real cutoff is"
      subtitle="Gaps between consecutive teams, expressed as multiples of that board's median gap. A tall bar is a genuine break in the field; a flat run means the ranks inside it are within noise of each other."
    >
      <div className="space-y-5">
        {separation.map((s) => {
          const board = boards.find((b) => b.slug === s.slug);
          const maxRatio = Math.max(1, ...s.cutoffs.map((c) => c.gapRatio));

          return (
            <div key={s.slug}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h4 className="text-xs font-medium text-foreground">{s.label}</h4>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                    VERDICT_STYLES[s.verdict]
                  )}
                >
                  {s.verdict.replace("-", " ")}
                </span>
                {board && (
                  <span className="text-[10px] text-muted-foreground">
                    {board.scoredCount} teams · {board.scoreHigherIsBetter ? "higher" : "lower"} is
                    better ({board.directionSource === "api-order" ? "detected" : "configured"})
                  </span>
                )}
              </div>

              <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">{s.verdictText}</p>

              {s.cutoffs.length > 0 ? (
                <ul className="space-y-1">
                  {s.cutoffs.map((c) => (
                    <li key={c.afterRank} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 text-[11px] text-muted-foreground">
                        after #{c.afterRank}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(c.gapRatio / maxRatio) * 100}%` }}
                          title={`gap ${formatScore(c.gap)} · ${c.gapRatio.toFixed(2)}× median`}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                        {c.gapRatio.toFixed(1)}×
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No gap in the top of this board stands out.</Empty>
              )}

              {s.topTies.length > 0 && (
                <div className="mt-2 rounded border border-destructive/30 bg-destructive/10 p-2">
                  <p className="text-[11px] text-red-300">
                    Exact ties near the top — the metric cannot separate these teams, so their
                    relative order is arbitrary:
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {s.topTies.slice(0, 4).map((tie) => (
                      <li key={tie.score} className="text-[11px] text-muted-foreground">
                        rank #{tie.rank} · {tie.teams.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.tiers.length > 1 && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {s.tiers.length} tiers detected · median gap {formatScore(s.medianGap)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
