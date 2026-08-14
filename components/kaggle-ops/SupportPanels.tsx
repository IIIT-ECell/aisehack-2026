"use client";

import { TRACKS, trackLabels } from "@/lib/kaggle-ops/config";
import type { KaggleAnalysis } from "@/lib/kaggle-ops/types";
import { Empty, Panel } from "./Bits";

export function FunnelPanel({ analysis }: { analysis: KaggleAnalysis }) {
  const hasAny = TRACKS.some((t) => (analysis.funnels[t] ?? []).length > 0);

  return (
    <Panel
      title="Who came back for Round 2"
      subtitle="Share of each Round 1 rank band that appears on the Round 2 board. Round 2 is invite-only, so a team's absence may mean they were not invited rather than that they dropped out — read this as reappearance, not attrition."
    >
      {!hasAny ? (
        <Empty>Needs both rounds of a track to be available.</Empty>
      ) : (
        <div className="space-y-4">
          {TRACKS.map((track) => {
            const bands = analysis.funnels[track] ?? [];
            if (bands.length === 0) return null;
            return (
              <div key={track}>
                <h4 className="mb-1.5 text-xs font-medium text-foreground">{trackLabels[track]}</h4>
                <ul className="space-y-1">
                  {bands.map((band) => (
                    <li key={band.label} className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{band.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-secondary"
                          style={{ width: `${band.rate * 100}%` }}
                          title={`${band.reappeared} of ${band.r1Teams} returned`}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                        {band.reappeared}/{band.r1Teams}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function TimingPanel({ analysis }: { analysis: KaggleAnalysis }) {
  const usable = analysis.timing.filter((t) => t.byDay.length > 0);

  return (
    <Panel
      title="When the best scores landed"
      subtitle="Distribution of each team's best-scoring submission date, with the top cohort overlaid. Only the best submission's date is exposed by the API — there is no full submission history, so this shows timing, not effort."
    >
      {usable.length === 0 ? (
        <Empty>Submission dates were not exposed for these boards.</Empty>
      ) : (
        <div className="space-y-4">
          {usable.map((t) => {
            const max = Math.max(1, ...t.byDay.map((d) => d.all));
            return (
              <div key={t.slug}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h4 className="text-xs font-medium text-foreground">{t.label}</h4>
                  {t.lastDayShareTop !== null && (
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(t.lastDayShareTop * 100)}% of the top cohort peaked on the final
                      day
                    </span>
                  )}
                </div>
                <div className="flex h-20 items-end gap-0.5">
                  {t.byDay.map((d) => (
                    <div key={d.day} className="relative flex-1" title={`${d.day}: ${d.all} teams (${d.top} in top cohort)`}>
                      <div
                        className="w-full rounded-t bg-accent"
                        style={{ height: `${(d.all / max) * 80}px` }}
                      />
                      <div
                        className="absolute bottom-0 w-full rounded-t bg-secondary"
                        style={{ height: `${(d.top / max) * 80}px` }}
                      />
                    </div>
                  ))}
                </div>
                {t.coverage < 1 && (
                  <p className="mt-1 text-[10px] text-amber-400/70">
                    dates available for {Math.round(t.coverage * 100)}% of teams
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function CrossTrackPanel({ analysis }: { analysis: KaggleAnalysis }) {
  return (
    <Panel
      title="Teams in both tracks"
      subtitle="Matched on team name across tracks. Common names can collide, so treat this as a list to eyeball rather than a statistic."
    >
      {analysis.crossTrack.length === 0 ? (
        <Empty>No team name appears in both tracks.</Empty>
      ) : (
        <ul className="space-y-1">
          {analysis.crossTrack.slice(0, 20).map((team) => (
            <li key={team.normKey} className="flex items-center gap-2 text-[11px]">
              <span className="min-w-0 flex-1 truncate text-foreground">{team.displayName}</span>
              <span className="shrink-0 text-muted-foreground">
                {team.entries.map((e) => `${e.label} #${e.rank}`).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function TrackShapePanel({ analysis }: { analysis: KaggleAnalysis }) {
  const rows = analysis.trackShape.filter((s) => s.teamsR1 !== null || s.teamsR2 !== null);

  return (
    <Panel
      title="Field shape by track"
      subtitle="Structural comparison only. The two tracks use different metrics, so raw scores are never comparable across them — everything here is a count or a ratio."
    >
      {rows.length === 0 ? (
        <Empty>No board data.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-1 font-normal">Track</th>
                <th className="pb-1 font-normal">R1 teams</th>
                <th className="pb-1 font-normal">R2 teams</th>
                <th className="pb-1 font-normal">Returned</th>
                <th className="pb-1 font-normal">Tied in R2</th>
                <th className="pb-1 font-normal">Tiers in top 25</th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {rows.map((s) => (
                <tr key={s.track} className="border-t border-border">
                  <td className="py-1">{trackLabels[s.track]}</td>
                  <td className="tabular-nums">{s.teamsR1 ?? "—"}</td>
                  <td className="tabular-nums">{s.teamsR2 ?? "—"}</td>
                  <td className="tabular-nums">
                    {s.retentionRate !== null ? `${Math.round(s.retentionRate * 100)}%` : "—"}
                  </td>
                  <td className="tabular-nums">
                    {s.tieDensityR2 !== null ? `${Math.round(s.tieDensityR2 * 100)}%` : "—"}
                  </td>
                  <td className="tabular-nums">{s.tierCountTop25R2 ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
