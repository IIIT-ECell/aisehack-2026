"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TRACKS, trackLabels, type Track } from "@/lib/kaggle-ops/config";
import type { KaggleAnalysis } from "@/lib/kaggle-ops/types";
import { ContenderTable } from "./ContenderTable";
import { SeparationPanel } from "./SeparationPanel";
import { TrajectoryPanel } from "./TrajectoryPanel";
import { CrossTrackPanel, FunnelPanel, TimingPanel, TrackShapePanel } from "./SupportPanels";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { TeamEmailLookup } from "./TeamEmailLookup";

export function KaggleTab({
  analysis,
  loading,
  error,
  onRefresh,
}: {
  analysis: KaggleAnalysis | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [track, setTrack] = useState<Track>("polymer");

  if (loading && !analysis) {
    return <p className="p-6 text-sm text-muted-foreground">Fetching Kaggle leaderboards…</p>;
  }

  if (error && !analysis) {
    return (
      <div className="p-6">
        <p className="whitespace-pre-line text-sm text-destructive">{error}</p>
        <p className="mt-2 max-w-prose text-xs text-muted-foreground">
          Check that <code className="text-muted-foreground">KAGGLE_OPS_USERNAME</code> and{" "}
          <code className="text-muted-foreground">KAGGLE_OPS_KEY</code> are set, and that this Kaggle
          account has joined and accepted the rules for all four competitions — the API mirrors web
          permissions exactly. See <code className="text-muted-foreground">lib/kaggle-ops/README.md</code>.
        </p>
        <button
          onClick={onRefresh}
          className="mt-3 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:border-primary/50 hover:text-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return <p className="p-6 text-sm text-muted-foreground">No analysis yet.</p>;
  }

  const boardTrackBySlug = new Map(analysis.boards.map((b) => [b.slug, b.track]));
  const trackBoards = analysis.boards.filter((b) => b.track === track);
  const trackContenders = analysis.contenders.filter((c) => c.track === track);
  const trackSeparation = analysis.separation.filter((s) => boardTrackBySlug.get(s.slug) === track);
  const trackTiming = analysis.timing.filter((t) => boardTrackBySlug.get(t.slug) === track);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] text-muted-foreground">
          Generated {new Date(analysis.generatedAt).toLocaleTimeString()}
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh from Kaggle"}
        </button>
        <button
          onClick={() => setShowDiagnostics((s) => !s)}
          className="text-[11px] text-muted-foreground hover:text-muted-foreground"
        >
          {showDiagnostics ? "Hide diagnostics" : "Show diagnostics"}
        </button>
      </div>

      {analysis.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <ul className="space-y-1">
            {analysis.warnings.map((warning) => (
              <li key={warning} className="text-[11px] leading-relaxed text-amber-300">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-1.5 rounded-full border border-border bg-muted/30 p-1 w-fit">
        {TRACKS.map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              track === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {trackLabels[t]}
          </button>
        ))}
      </div>

      {showDiagnostics && (
        <DiagnosticsPanel boards={trackBoards} generatedAt={analysis.generatedAt} />
      )}

      <ContenderTable contenders={trackContenders} />
      <TeamEmailLookup contenders={trackContenders} track={track} />
      <SeparationPanel separation={trackSeparation} boards={trackBoards} />
      <TrajectoryPanel analysis={analysis} track={track} />
      <FunnelPanel analysis={analysis} track={track} />
      <TimingPanel timing={trackTiming} />

      <div>
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          Cross-track comparison (both tracks)
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <TrackShapePanel analysis={analysis} />
          <CrossTrackPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
}
