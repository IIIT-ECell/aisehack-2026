"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SIGNAL_WEIGHTS } from "@/lib/kaggle-ops/analysis";
import type { ContenderDossier, SignalComponent } from "@/lib/kaggle-ops/types";
import { DeltaChip, Empty, Meter, Panel, StatusPill, formatScore } from "./Bits";

const COMPONENT_LABELS: Record<SignalComponent, string> = {
  peak: "Peak standing",
  momentum: "Momentum (R1→R2)",
  consistency: "Consistency across rounds",
  separation: "Separation from next team",
  earliness: "Locked in early",
};

/**
 * The centrepiece: one row per top contender, synthesising every survivable
 * signal into a single expandable dossier. None of this exists on Kaggle,
 * which can only ever show one board at a time with no cross-round identity.
 */
export function ContenderTable({ contenders }: { contenders: ContenderDossier[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (contenders.length === 0) {
    return (
      <Panel title="Top contenders">
        <Empty>No leaderboard data available yet.</Empty>
      </Panel>
    );
  }

  return (
    <Panel
      title="Top contenders"
      subtitle="A composite ranking aid, not a verdict. The signal blends standing, cross-round movement, consistency, separation from the next team, and how early the best score landed — weighted, then renormalised over whichever components the data actually supports. Click a row for the breakdown."
    >
      <ul className="divide-y divide-border">
        {contenders.map((c) => {
          const isOpen = expanded === `${c.track}:${c.normKey}`;
          return (
            <li key={`${c.track}:${c.normKey}`}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : `${c.track}:${c.normKey}`)}
                className="flex w-full items-center gap-3 py-2 text-left hover:bg-white/[0.03]"
              >
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  #{c.headline.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">{c.displayName}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {c.headline.label} · {formatScore(c.headline.score)} · tier {c.tier}
                  </span>
                </span>
                {c.trajectory && <StatusPill status={c.trajectory.status} />}
                <span className="hidden w-24 shrink-0 items-center sm:flex">
                  <Meter value={c.finalistSignal} />
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {(c.finalistSignal * 100).toFixed(0)}
                </span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-l-2 border-primary/30 py-3 pl-4 pr-2">
                  <div className="space-y-1.5">
                    {(Object.keys(SIGNAL_WEIGHTS) as SignalComponent[]).map((key) => {
                      const value = c.components[key];
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-44 shrink-0 text-[11px] text-muted-foreground">
                            {COMPONENT_LABELS[key]}
                            <span className="ml-1 text-muted-foreground">
                              ×{SIGNAL_WEIGHTS[key].toFixed(2)}
                            </span>
                          </span>
                          {value === undefined ? (
                            <span className="flex-1 text-[11px] text-muted-foreground">not available</span>
                          ) : (
                            <>
                              <Meter value={value} className="bg-secondary" />
                              <span className="w-8 text-right text-[11px] tabular-nums text-muted-foreground">
                                {(value * 100).toFixed(0)}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-4">
                    <Stat label="R1 rank" value={c.trajectory?.r1 ? `#${c.trajectory.r1.rank}` : "—"} />
                    <Stat label="R2 rank" value={c.trajectory?.r2 ? `#${c.trajectory.r2.rank}` : "—"} />
                    <Stat
                      label="Gap to next"
                      value={
                        c.gapBelowRatio !== null
                          ? `${c.gapBelowRatio.toFixed(1)}× median`
                          : "—"
                      }
                    />
                    <Stat
                      label="Best score submitted"
                      value={
                        c.daysBeforeClose !== null
                          ? `${c.daysBeforeClose.toFixed(1)}d before close`
                          : "—"
                      }
                    />
                  </dl>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-muted-foreground">Rank movement</span>
                    <DeltaChip delta={c.trajectory?.rankDelta ?? null} />
                    <span
                      className={cn(
                        "ml-auto",
                        c.signalCoverage < 0.7 ? "text-amber-400" : "text-muted-foreground"
                      )}
                      title="Fraction of the signal's total weight that could actually be computed for this team."
                    >
                      signal coverage {(c.signalCoverage * 100).toFixed(0)}%
                    </span>
                  </div>

                  {c.crossTrack.length > 0 && (
                    <p className="text-[11px] text-sky-300">
                      Also on: {c.crossTrack.join(", ")}
                    </p>
                  )}

                  {c.notes.length > 0 && (
                    <ul className="space-y-0.5">
                      {c.notes.map((note) => (
                        <li key={note} className="text-[11px] text-amber-400/80">
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
