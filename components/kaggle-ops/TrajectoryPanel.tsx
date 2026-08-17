"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Track } from "@/lib/kaggle-ops/config";
import type { KaggleAnalysis, TrajectoryEntry } from "@/lib/kaggle-ops/types";
import { DeltaChip, Empty, Panel, StatusPill } from "./Bits";

type Filter = "all" | TrajectoryEntry["status"];

const FILTERS: Filter[] = ["all", "climber", "held", "faller", "r2-only", "r1-only"];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  climber: "Climbers",
  held: "Held",
  faller: "Fallers",
  "r2-only": "New in R2",
  "r1-only": "Did not return",
};

/**
 * The flagship cross-round view. Kaggle treats Round 1 and Round 2 as unrelated
 * competitions with no shared team identity, so this join is structurally
 * impossible in its UI.
 */
export function TrajectoryPanel({ analysis, track }: { analysis: KaggleAnalysis; track: Track }) {
  const [filter, setFilter] = useState<Filter>("all");

  const entries = analysis.trajectories[track] ?? [];
  const joinRate = analysis.nameJoinRate[track];
  const probable = analysis.probableNameMatches.filter((m) => m.track === track);

  const visible = entries
    .filter((e) => filter === "all" || e.status === filter)
    .sort((a, b) => (a.r2?.rank ?? Infinity) - (b.r2?.rank ?? Infinity));

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Panel
      title="Round 1 → Round 2 trajectory"
      subtitle="Teams matched across rounds by name. Movement is measured in percentile, not raw rank, because the two rounds have different field sizes."
    >
      {joinRate !== null && (
        <div className="mb-3 flex justify-end">
          <span
            className={cn(
              "text-[11px]",
              joinRate < 0.6 ? "text-amber-400" : "text-muted-foreground"
            )}
            title="Share of teams that could be matched across rounds by name. A low rate usually means teams renamed between rounds."
          >
            name join {Math.round(joinRate * 100)}%
          </span>
        </div>
      )}

      {entries.length === 0 ? (
        <Empty>
          No cross-round data for this track — either a board is unavailable, or the name join was
          too unreliable to trust (see warnings above).
        </Empty>
      ) : (
        <>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const count = f === "all" ? entries.length : (counts[f] ?? 0);
              if (count === 0 && f !== "all") return null;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[11px]",
                    filter === f
                      ? "border-foreground/30 bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {FILTER_LABELS[f]} {count}
                </button>
              );
            })}
          </div>

          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {visible.slice(0, 100).map((e) => (
              <li key={e.normKey} className="flex items-center gap-3 py-1.5">
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                  {e.displayName}
                </span>
                <span className="w-24 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                  {e.r1 ? `#${e.r1.rank}` : "—"} → {e.r2 ? `#${e.r2.rank}` : "—"}
                </span>
                <span className="w-12 shrink-0 text-right">
                  <DeltaChip delta={e.rankDelta} />
                </span>
                <StatusPill status={e.status} />
              </li>
            ))}
          </ul>
        </>
      )}

      {probable.length > 0 && (
        <div className="mt-3 rounded border border-amber-500/20 bg-amber-500/5 p-2">
          <p className="text-[11px] text-amber-300">
            Possible renames between rounds — these were <em>not</em> merged automatically, since
            wrongly joining two distinct teams is worse than missing a rename. Confirm by eye:
          </p>
          <ul className="mt-1 space-y-0.5">
            {probable.slice(0, 8).map((m) => (
              <li key={`${m.r1Name}->${m.r2Name}`} className="text-[11px] text-muted-foreground">
                {m.r1Name} → {m.r2Name}{" "}
                <span className="text-muted-foreground">({Math.round(m.similarity * 100)}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
