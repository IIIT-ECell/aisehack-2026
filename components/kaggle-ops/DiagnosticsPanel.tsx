"use client";

import { cn } from "@/lib/utils";
import type { BoardStatus } from "@/lib/kaggle-ops/types";
import { Empty, Panel } from "./Bits";

const STATUS_STYLES: Record<BoardStatus["status"], string> = {
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  stale: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  unavailable: "bg-red-500/15 text-red-300 border-red-500/30",
};

/**
 * The verification instrument. kaggle.com was unreachable from the environment
 * this feature was written in, so the field-name and envelope guesses in
 * client.ts are unverified by construction. This panel reports exactly what the
 * normalizer managed to read, so a wrong guess shows up as a coverage bar at
 * 0% rather than as silently missing analysis.
 */
export function DiagnosticsPanel({
  boards,
  generatedAt,
}: {
  boards: BoardStatus[];
  /** Ages are measured against this rather than Date.now(), to keep render pure. */
  generatedAt: number;
}) {
  if (boards.length === 0) {
    return (
      <Panel title="Diagnostics">
        <Empty>No boards.</Empty>
      </Panel>
    );
  }

  return (
    <Panel
      title="Diagnostics"
      subtitle="What was actually fetched and parsed. Check this first if a panel looks wrong: a coverage bar near zero means the API used a field name the client did not expect."
    >
      <div className="space-y-3">
        {boards.map((board) => (
          <div key={board.slug} className="rounded border border-border p-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] uppercase",
                  STATUS_STYLES[board.status]
                )}
              >
                {board.status}
              </span>
              <span className="text-xs text-foreground">{board.label}</span>
              {board.fetchedAt && (
                <span className="text-[10px] text-muted-foreground">
                  fetched {Math.max(0, Math.round((generatedAt - board.fetchedAt) / 60_000))}m ago
                </span>
              )}
            </div>

            {board.status === "unavailable" ? (
              <p className="text-[11px] text-red-300">
                {board.reason}: {board.message}
              </p>
            ) : (
              <>
                <p className="mb-1.5 text-[10px] text-muted-foreground">
                  {board.scoredCount}/{board.rowCount} rows usable · envelope{" "}
                  <code className="text-muted-foreground">{board.coverage?.envelopeShape ?? "?"}</code> ·{" "}
                  {board.scoreHigherIsBetter ? "higher" : "lower"} is better (
                  {board.directionSource})
                </p>

                {board.coverage && (
                  <div className="space-y-0.5">
                    {(["teamName", "score", "submissionDate", "entries"] as const).map((field) => {
                      const value = board.coverage![field];
                      return (
                        <div key={field} className="flex items-center gap-2">
                          <span className="w-28 shrink-0 text-[10px] text-muted-foreground">{field}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                value > 0.9
                                  ? "bg-emerald-500"
                                  : value > 0
                                    ? "bg-amber-500"
                                    : "bg-muted-foreground"
                              )}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {board.coverage && board.coverage.unknownKeys.length > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    unused fields: {board.coverage.unknownKeys.join(", ")}
                  </p>
                )}

                {board.possiblyTruncated && (
                  <p className="mt-1 text-[10px] text-amber-400">
                    Exactly {board.rowCount} rows — possibly a page limit. Compare against the team
                    count on Kaggle; percentiles are wrong if the field is truncated.
                  </p>
                )}
                {board.directionConflict && (
                  <p className="mt-1 text-[10px] text-amber-400">
                    Row order disagrees with the configured metric direction.
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
