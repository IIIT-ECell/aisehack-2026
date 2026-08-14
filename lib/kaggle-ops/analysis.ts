import type { LeaderboardRow } from "./client";
import {
  COMPETITIONS,
  TRACKS,
  kaggleOpsConfig,
  metricHigherIsBetter,
  trackLabels,
  type CompetitionSlug,
  type Track,
} from "./config";
import type {
  BoardStatus,
  CompetitionBoard,
  ContenderDossier,
  CrossTrackTeam,
  CutoffCandidate,
  FunnelBand,
  KaggleAnalysis,
  ProbableNameMatch,
  RankedRow,
  RoundSnapshot,
  SeparationAnalysis,
  SignalComponent,
  TieGroup,
  TierSummary,
  TimingAnalysis,
  TrackShape,
  TrajectoryEntry,
} from "./types";

// Pure analysis over fetched leaderboards. No I/O, no caching — everything here
// is a deterministic function of its inputs so it can be exercised against a
// saved JSON fixture without touching the network.
//
// Design constraint that shapes all of this: the Kaggle leaderboard endpoint
// exposes only { teamId, teamName, submissionDate, score }. There are no
// per-team entry counts, no member lists and no submission histories, so
// anything resembling "effort", "iteration count" or per-team score curves is
// not derivable and is deliberately absent rather than approximated.

const EPSILON = 1e-12;
const DAY_MS = 86_400_000;

/** Relative weights of the finalist-signal components. Displayed in the UI. */
export const SIGNAL_WEIGHTS: Record<SignalComponent, number> = {
  peak: 0.35,
  momentum: 0.2,
  consistency: 0.2,
  separation: 0.15,
  earliness: 0.1,
};

// ---------------------------------------------------------------- primitives

export function normalizeTeamName(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function looseKey(normalized: string): string {
  return normalized.replace(/[^a-z0-9]/g, "");
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Levenshtein-based similarity in 0..1. Used only to *suggest* renames. */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
}

// ------------------------------------------------------------------ ranking

/**
 * Infers whether higher scores are better from the API's own row order.
 *
 * Kaggle returns boards already sorted best-first, so a strongly monotonic
 * score sequence tells us the direction without needing to know the metric.
 * Falls back to the configured value when the order is ambiguous, and reports
 * a conflict rather than silently picking a side.
 */
export function inferDirection(
  rows: LeaderboardRow[],
  configured: boolean
): { higherIsBetter: boolean; source: "api-order" | "config"; conflict: boolean } {
  const scores = rows.map((r) => r.score);
  if (scores.length < 5) {
    return { higherIsBetter: configured, source: "config", conflict: false };
  }

  let nonIncreasing = 0;
  let nonDecreasing = 0;
  for (let i = 1; i < scores.length; i += 1) {
    if (scores[i] <= scores[i - 1]) nonIncreasing += 1;
    if (scores[i] >= scores[i - 1]) nonDecreasing += 1;
  }

  const pairs = scores.length - 1;
  if (nonIncreasing / pairs >= 0.98) {
    return { higherIsBetter: true, source: "api-order", conflict: configured !== true };
  }
  if (nonDecreasing / pairs >= 0.98) {
    return { higherIsBetter: false, source: "api-order", conflict: configured !== false };
  }
  return { higherIsBetter: configured, source: "config", conflict: false };
}

export function rankRows(rows: LeaderboardRow[], higherIsBetter: boolean): RankedRow[] {
  if (rows.length === 0) return [];

  const sorted = [...rows].sort((a, b) =>
    higherIsBetter ? b.score - a.score : a.score - b.score
  );

  const counts = new Map<number, number>();
  for (const row of sorted) counts.set(row.score, (counts.get(row.score) ?? 0) + 1);

  const times = sorted
    .map((r) => (r.submissionDate ? new Date(r.submissionDate).getTime() : null))
    .filter((t): t is number => t !== null);
  const windowEnd = times.length ? Math.max(...times) : null;

  const best = sorted[0].score;
  const total = sorted.length;

  // Competition ranking: equal scores share the lowest rank of their group.
  const ranks: number[] = [];
  sorted.forEach((row, index) => {
    ranks[index] = index > 0 && row.score === sorted[index - 1].score ? ranks[index - 1] : index + 1;
  });

  const tiers = assignTiers(sorted.map((r) => r.score));

  return sorted.map((row, index) => {
    const next = sorted[index + 1];
    const submittedAt = row.submissionDate ? new Date(row.submissionDate).getTime() : null;

    return {
      ...row,
      normKey: normalizeTeamName(row.teamName),
      rank: ranks[index],
      percentile: total > 1 ? 1 - (ranks[index] - 1) / (total - 1) : 1,
      gapToNext: next ? Math.abs(row.score - next.score) : null,
      gapToLead: Math.abs(best - row.score),
      tiedCount: counts.get(row.score) ?? 1,
      tier: tiers[index],
      daysBeforeClose:
        windowEnd !== null && submittedAt !== null ? (windowEnd - submittedAt) / DAY_MS : null,
    };
  });
}

/**
 * Walks the sorted scores and starts a new tier whenever the gap to the next
 * team exceeds a multiple of the board's median gap.
 *
 * Chosen over clustering algorithms deliberately: this is explainable to a
 * participant who asks why they were cut, which k-means output is not.
 */
function assignTiers(sortedScores: number[]): number[] {
  if (sortedScores.length === 0) return [];

  const gaps: number[] = [];
  for (let i = 1; i < sortedScores.length; i += 1) {
    gaps.push(Math.abs(sortedScores[i] - sortedScores[i - 1]));
  }
  const threshold = median(gaps.filter((g) => g > 0)) * kaggleOpsConfig.tierGapMultiplier;

  const tiers = [1];
  for (let i = 1; i < sortedScores.length; i += 1) {
    const gap = Math.abs(sortedScores[i] - sortedScores[i - 1]);
    tiers[i] = threshold > EPSILON && gap > threshold ? tiers[i - 1] + 1 : tiers[i - 1];
  }
  return tiers;
}

// --------------------------------------------------------------- separation

export function buildSeparation(board: CompetitionBoard): SeparationAnalysis {
  const rows = board.rows;
  const depth = Math.min(rows.length, kaggleOpsConfig.separationDepth);

  const gaps: number[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    gaps.push(Math.abs(rows[i].score - rows[i - 1].score));
  }
  const medianGap = median(gaps.filter((g) => g > 0));

  const leadOverSecond = rows.length > 1 ? Math.abs(rows[0].score - rows[1].score) : null;
  const leadOverSecondRatio =
    leadOverSecond !== null && medianGap > EPSILON ? leadOverSecond / medianGap : null;

  const cutoffs: CutoffCandidate[] = rows
    .slice(0, depth)
    .map((row) => ({
      afterRank: row.rank,
      gap: row.gapToNext ?? 0,
      gapRatio: medianGap > EPSILON ? (row.gapToNext ?? 0) / medianGap : 0,
    }))
    .filter((c) => c.gap > 0)
    .sort((a, b) => b.gapRatio - a.gapRatio)
    .slice(0, 3)
    .sort((a, b) => a.afterRank - b.afterRank);

  const tiers = summarizeTiers(rows);
  const topTies = collectTies(rows.slice(0, depth));

  let verdict: SeparationAnalysis["verdict"];
  if (rows.length < 5) {
    verdict = "insufficient-data";
  } else if (topTies.some((t) => t.rank <= 5)) {
    verdict = "noise-level";
  } else if (leadOverSecondRatio !== null && leadOverSecondRatio >= 3) {
    verdict = "decisive";
  } else if (cutoffs.some((c) => c.gapRatio >= 1.5)) {
    verdict = "clustered";
  } else {
    verdict = "noise-level";
  }

  return {
    slug: board.slug,
    label: board.label,
    medianGap,
    leadOverSecond,
    leadOverSecondRatio,
    tiers,
    cutoffs,
    topTies,
    verdict,
    verdictText: describeSeparation(verdict, cutoffs, leadOverSecondRatio, topTies),
  };
}

function describeSeparation(
  verdict: SeparationAnalysis["verdict"],
  cutoffs: CutoffCandidate[],
  leadRatio: number | null,
  ties: TieGroup[]
): string {
  if (verdict === "insufficient-data") {
    return "Too few scored teams on this board to say anything about separation.";
  }
  if (verdict === "noise-level") {
    const tie = ties.find((t) => t.rank <= 5);
    if (tie) {
      return `${tie.teams.length} teams are tied at rank ${tie.rank} on an identical score — the metric cannot separate them, so their ordering is arbitrary.`;
    }
    return "No gap in the top of the board stands out against the typical gap. Ranks here are close to noise; treat the ordering as provisional.";
  }
  const best = cutoffs[0];
  const lead =
    leadRatio !== null && leadRatio >= 3
      ? `The leader is ${leadRatio.toFixed(1)}× the median gap ahead of second. `
      : "";
  if (!best) return `${lead}No single natural cutoff stands out.`;
  return `${lead}The clearest natural cutoff is after rank ${best.afterRank} — a gap ${best.gapRatio.toFixed(1)}× the median.`;
}

function summarizeTiers(rows: RankedRow[]): TierSummary[] {
  const byTier = new Map<number, RankedRow[]>();
  for (const row of rows) {
    const list = byTier.get(row.tier) ?? [];
    list.push(row);
    byTier.set(row.tier, list);
  }

  return [...byTier.entries()]
    .sort(([a], [b]) => a - b)
    .map(([tier, members], index, all) => {
      const prev = index > 0 ? all[index - 1][1] : null;
      const prevWorst = prev ? prev[prev.length - 1].score : null;
      return {
        tier,
        fromRank: members[0].rank,
        toRank: members[members.length - 1].rank,
        size: members.length,
        bestScore: members[0].score,
        worstScore: members[members.length - 1].score,
        gapToPrevTier: prevWorst === null ? null : Math.abs(prevWorst - members[0].score),
      } satisfies TierSummary;
    });
}

function collectTies(rows: RankedRow[]): TieGroup[] {
  const groups = new Map<number, RankedRow[]>();
  for (const row of rows) {
    if (row.tiedCount < 2) continue;
    const list = groups.get(row.score) ?? [];
    list.push(row);
    groups.set(row.score, list);
  }
  return [...groups.entries()]
    .map(([score, members]) => ({
      score,
      rank: members[0].rank,
      teams: members.map((m) => m.teamName),
    }))
    .sort((a, b) => a.rank - b.rank);
}

// --------------------------------------------------------------- trajectory

export function buildTrajectories(
  r1: CompetitionBoard | undefined,
  r2: CompetitionBoard | undefined,
  track: Track
): { entries: TrajectoryEntry[]; joinRate: number | null; probable: ProbableNameMatch[] } {
  if (!r1?.rows.length || !r2?.rows.length) {
    const only = r1?.rows.length ? r1 : r2;
    if (!only?.rows.length) return { entries: [], joinRate: null, probable: [] };

    const isR1 = only.round === 1;
    return {
      entries: only.rows.map((row) => ({
        normKey: row.normKey,
        displayName: row.teamName,
        track,
        [isR1 ? "r1" : "r2"]: snapshot(row, only.rows.length),
        rankDelta: null,
        percentileDelta: null,
        status: isR1 ? ("r1-only" as const) : ("r2-only" as const),
      })),
      joinRate: null,
      probable: [],
    };
  }

  const r1ByKey = new Map(r1.rows.map((row) => [row.normKey, row]));
  const r2ByKey = new Map(r2.rows.map((row) => [row.normKey, row]));

  const entries: TrajectoryEntry[] = [];
  let matched = 0;

  for (const row of r2.rows) {
    const prior = r1ByKey.get(row.normKey);
    const r2Snap = snapshot(row, r2.rows.length);

    if (!prior) {
      entries.push({
        normKey: row.normKey,
        displayName: row.teamName,
        track,
        r2: r2Snap,
        rankDelta: null,
        percentileDelta: null,
        status: "r2-only",
      });
      continue;
    }

    matched += 1;
    const r1Snap = snapshot(prior, r1.rows.length);
    const percentileDelta = r2Snap.percentile - r1Snap.percentile;

    entries.push({
      normKey: row.normKey,
      displayName: row.teamName,
      track,
      r1: r1Snap,
      r2: r2Snap,
      rankDelta: r1Snap.rank - r2Snap.rank,
      percentileDelta,
      status: percentileDelta > 0.05 ? "climber" : percentileDelta < -0.05 ? "faller" : "held",
    });
  }

  for (const row of r1.rows) {
    if (r2ByKey.has(row.normKey)) continue;
    entries.push({
      normKey: row.normKey,
      displayName: row.teamName,
      track,
      r1: snapshot(row, r1.rows.length),
      rankDelta: null,
      percentileDelta: null,
      status: "r1-only",
    });
  }

  const joinRate = matched / Math.max(1, Math.min(r1.rows.length, r2.rows.length));

  return {
    entries,
    joinRate,
    probable: findProbableMatches(
      r1.rows.filter((r) => !r2ByKey.has(r.normKey)),
      r2.rows.filter((r) => !r1ByKey.has(r.normKey)),
      track
    ),
  };
}

function snapshot(row: RankedRow, total: number): RoundSnapshot {
  return { rank: row.rank, total, percentile: row.percentile, score: row.score };
}

/**
 * Suggests possible renames between rounds. Candidate-restricted (shared
 * alphanumeric key, or shared first token with high similarity) so this never
 * degenerates into an O(n²) full edit-distance sweep — and never auto-applied,
 * because silently merging two distinct teams is worse than missing a rename.
 */
function findProbableMatches(
  unmatchedR1: RankedRow[],
  unmatchedR2: RankedRow[],
  track: Track
): ProbableNameMatch[] {
  const out: ProbableNameMatch[] = [];

  for (const a of unmatchedR1) {
    const aLoose = looseKey(a.normKey);
    const aFirst = a.normKey.split(" ")[0];

    for (const b of unmatchedR2) {
      const bLoose = looseKey(b.normKey);
      const sharesLoose = aLoose.length > 2 && aLoose === bLoose;
      const sharesFirst =
        aFirst.length >= 4 && aFirst === b.normKey.split(" ")[0] && a.normKey.length >= 5;

      if (!sharesLoose && !sharesFirst) continue;

      const score = sharesLoose ? 1 : similarity(a.normKey, b.normKey);
      if (score >= 0.9) {
        out.push({ track, r1Name: a.teamName, r2Name: b.teamName, similarity: score });
      }
    }
  }

  return out.sort((x, y) => y.similarity - x.similarity).slice(0, 25);
}

// ------------------------------------------------------------------- funnel

const BANDS: { label: string; from: number; to: number }[] = [
  { label: "1–10", from: 1, to: 10 },
  { label: "11–25", from: 11, to: 25 },
  { label: "26–50", from: 26, to: 50 },
  { label: "51–100", from: 51, to: 100 },
  { label: "101+", from: 101, to: Number.POSITIVE_INFINITY },
];

export function buildFunnel(
  r1: CompetitionBoard | undefined,
  r2: CompetitionBoard | undefined
): FunnelBand[] {
  if (!r1?.rows.length || !r2?.rows.length) return [];

  const r2Keys = new Set(r2.rows.map((row) => row.normKey));

  return BANDS.map(({ label, from, to }) => {
    const inBand = r1.rows.filter((row) => row.rank >= from && row.rank <= to);
    const reappeared = inBand.filter((row) => r2Keys.has(row.normKey)).length;
    return {
      label,
      fromRank: from,
      toRank: to === Number.POSITIVE_INFINITY ? r1.rows.length : to,
      r1Teams: inBand.length,
      reappeared,
      rate: inBand.length ? reappeared / inBand.length : 0,
    };
  }).filter((band) => band.r1Teams > 0);
}

// ------------------------------------------------------------------- timing

export function buildTiming(board: CompetitionBoard): TimingAnalysis {
  const dated = board.rows.filter((row) => row.submissionDate);
  const coverage = board.rows.length ? dated.length / board.rows.length : 0;

  if (dated.length === 0) {
    return {
      slug: board.slug,
      label: board.label,
      windowStart: null,
      windowEnd: null,
      byDay: [],
      lastDayShareAll: null,
      lastDayShareTop: null,
      coverage,
    };
  }

  const topCutoff = Math.min(kaggleOpsConfig.topN, board.rows.length);
  const times = dated.map((row) => new Date(row.submissionDate!).getTime());
  const windowStart = Math.min(...times);
  const windowEnd = Math.max(...times);

  const buckets = new Map<string, { all: number; top: number }>();
  for (const row of dated) {
    const day = row.submissionDate!.slice(0, 10);
    const bucket = buckets.get(day) ?? { all: 0, top: 0 };
    bucket.all += 1;
    if (row.rank <= topCutoff) bucket.top += 1;
    buckets.set(day, bucket);
  }

  const lastDay = new Date(windowEnd).toISOString().slice(0, 10);
  const lastDayAll = buckets.get(lastDay)?.all ?? 0;
  const lastDayTop = buckets.get(lastDay)?.top ?? 0;
  const topDated = dated.filter((row) => row.rank <= topCutoff).length;

  return {
    slug: board.slug,
    label: board.label,
    windowStart: new Date(windowStart).toISOString(),
    windowEnd: new Date(windowEnd).toISOString(),
    byDay: [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, counts]) => ({ day, ...counts })),
    lastDayShareAll: lastDayAll / Math.max(1, dated.length),
    lastDayShareTop: topDated ? lastDayTop / topDated : null,
    coverage,
  };
}

// -------------------------------------------------------------- cross-track

export function buildCrossTrack(boards: CompetitionBoard[]): CrossTrackTeam[] {
  const byKey = new Map<string, { displayName: string; entries: CrossTrackTeam["entries"]; tracks: Set<Track> }>();

  for (const board of boards) {
    for (const row of board.rows) {
      const existing = byKey.get(row.normKey) ?? {
        displayName: row.teamName,
        entries: [],
        tracks: new Set<Track>(),
      };
      existing.entries.push({
        slug: board.slug,
        label: board.label,
        rank: row.rank,
        total: board.rows.length,
      });
      existing.tracks.add(board.track);
      byKey.set(row.normKey, existing);
    }
  }

  return [...byKey.entries()]
    .filter(([, value]) => value.tracks.size > 1)
    .map(([normKey, value]) => ({
      normKey,
      displayName: value.displayName,
      entries: value.entries.sort((a, b) => a.rank - b.rank),
    }))
    .sort((a, b) => a.entries[0].rank - b.entries[0].rank);
}

// ------------------------------------------------------------- track shape

export function buildTrackShape(boards: CompetitionBoard[]): TrackShape[] {
  return TRACKS.map((track) => {
    const r1 = boards.find((b) => b.track === track && b.round === 1);
    const r2 = boards.find((b) => b.track === track && b.round === 2);

    const teamsR1 = r1?.rows.length ?? null;
    const teamsR2 = r2?.rows.length ?? null;

    let retentionRate: number | null = null;
    if (r1?.rows.length && r2?.rows.length) {
      const r2Keys = new Set(r2.rows.map((row) => row.normKey));
      retentionRate =
        r1.rows.filter((row) => r2Keys.has(row.normKey)).length / Math.max(1, r1.rows.length);
    }

    const tied = r2?.rows.filter((row) => row.tiedCount > 1).length ?? null;

    return {
      track,
      teamsR1,
      teamsR2,
      retentionRate,
      tieDensityR2: tied !== null && r2?.rows.length ? tied / r2.rows.length : null,
      tierCountTop25R2: r2?.rows.length
        ? new Set(r2.rows.slice(0, 25).map((row) => row.tier)).size
        : null,
    } satisfies TrackShape;
  });
}

// --------------------------------------------------------------- contenders

export function buildContenders(
  boards: CompetitionBoard[],
  trajectories: Record<Track, TrajectoryEntry[]>,
  separation: SeparationAnalysis[],
  crossTrack: CrossTrackTeam[]
): ContenderDossier[] {
  const crossByKey = new Map(crossTrack.map((t) => [t.normKey, t]));
  const out: ContenderDossier[] = [];

  for (const track of TRACKS) {
    // Prefer Round 2 as the headline board; fall back to Round 1 if R2 is
    // unavailable, so a 403 on the invite-only board doesn't blank the panel.
    const board =
      boards.find((b) => b.track === track && b.round === 2 && b.rows.length) ??
      boards.find((b) => b.track === track && b.round === 1 && b.rows.length);
    if (!board) continue;

    const sep = separation.find((s) => s.slug === board.slug);
    const trajByKey = new Map(trajectories[track].map((t) => [t.normKey, t]));
    const windowDays = maxDaysBeforeClose(board.rows);

    for (const row of board.rows.slice(0, kaggleOpsConfig.topN)) {
      const traj = trajByKey.get(row.normKey) ?? null;
      const notes: string[] = [];
      const components: Partial<Record<SignalComponent, number>> = { peak: row.percentile };

      if (traj?.r1 && traj.r2) {
        components.momentum = clamp01(0.5 + (traj.percentileDelta ?? 0));
        components.consistency = 1 - Math.abs(traj.r1.percentile - traj.r2.percentile);
      } else if (board.round === 2) {
        notes.push("No Round 1 record — momentum and consistency unavailable.");
      }

      const gapBelowRatio =
        sep && sep.medianGap > EPSILON && row.gapToNext !== null
          ? row.gapToNext / sep.medianGap
          : null;
      if (gapBelowRatio !== null) components.separation = clamp01(gapBelowRatio / 3);

      if (row.daysBeforeClose !== null && windowDays > 0) {
        components.earliness = clamp01(row.daysBeforeClose / windowDays);
      }

      if (row.tiedCount > 1) {
        notes.push(`Tied on score with ${row.tiedCount - 1} other team(s) — ordering is arbitrary.`);
      }
      if (board.round === 1) {
        notes.push("Round 2 board unavailable; ranked on Round 1.");
      }

      const cross = crossByKey.get(row.normKey);
      if (cross) notes.push("Also competing in the other track.");

      const presentWeight = (Object.keys(components) as SignalComponent[]).reduce(
        (sum, key) => sum + SIGNAL_WEIGHTS[key],
        0
      );
      const totalWeight = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
      const weighted = (Object.entries(components) as [SignalComponent, number][]).reduce(
        (sum, [key, value]) => sum + SIGNAL_WEIGHTS[key] * value,
        0
      );

      out.push({
        normKey: row.normKey,
        displayName: row.teamName,
        track,
        headline: {
          slug: board.slug,
          label: board.label,
          rank: row.rank,
          total: board.rows.length,
          score: row.score,
        },
        tier: row.tier,
        gapAbove: row.rank > 1 ? row.gapToLead : null,
        gapBelow: row.gapToNext,
        gapBelowRatio,
        trajectory: traj,
        daysBeforeClose: row.daysBeforeClose,
        crossTrack: cross ? cross.entries.map((e) => e.label) : [],
        components,
        // Renormalized over present components only, so a Round-2-only team
        // isn't silently penalised to zero for missing history.
        signalCoverage: presentWeight / totalWeight,
        finalistSignal: presentWeight > 0 ? weighted / presentWeight : 0,
        notes,
      });
    }
  }

  return out.sort((a, b) => b.finalistSignal - a.finalistSignal);
}

function maxDaysBeforeClose(rows: RankedRow[]): number {
  const values = rows.map((r) => r.daysBeforeClose).filter((d): d is number => d !== null);
  return values.length ? Math.max(...values) : 0;
}

// ------------------------------------------------------------------ top level

export function buildAnalysis(boards: CompetitionBoard[]): KaggleAnalysis {
  const usable = boards.filter((b) => b.rows.length > 0);
  const warnings: string[] = [];

  for (const board of boards) {
    if (board.status === "unavailable") {
      warnings.push(`${board.label}: unavailable (${board.reason ?? "unknown"}) — ${board.message ?? ""}`.trim());
    } else if (board.status === "stale") {
      const age = board.fetchedAt ? Math.round((Date.now() - board.fetchedAt) / 60_000) : null;
      warnings.push(`${board.label}: served from cache${age !== null ? ` ${age}m old` : ""} (${board.reason ?? "refresh failed"}).`);
    }
    if (board.directionConflict) {
      warnings.push(
        `${board.label}: the API's row order disagrees with the configured metric direction — separation may be inverted.`
      );
    }
    if (board.possiblyTruncated) {
      warnings.push(
        `${board.label}: returned exactly ${board.rowCount} rows, which looks like a page limit. Percentiles and medians may be computed on a partial field.`
      );
    }
  }

  const separation = usable.map(buildSeparation);
  const timing = usable.map(buildTiming);
  const crossTrack = buildCrossTrack(usable);

  const trajectories = {} as Record<Track, TrajectoryEntry[]>;
  const nameJoinRate = {} as Record<Track, number | null>;
  const funnels = {} as Record<Track, FunnelBand[]>;
  const probableNameMatches: ProbableNameMatch[] = [];

  for (const track of TRACKS) {
    const r1 = usable.find((b) => b.track === track && b.round === 1);
    const r2 = usable.find((b) => b.track === track && b.round === 2);

    const { entries, joinRate, probable } = buildTrajectories(r1, r2, track);
    nameJoinRate[track] = joinRate;
    probableNameMatches.push(...probable);

    // A bad name join produces confidently wrong numbers, which is worse than
    // no numbers. Below the threshold, suppress the derived views entirely.
    const trustworthy = joinRate === null || joinRate >= kaggleOpsConfig.minJoinRate;
    if (!trustworthy) {
      warnings.push(
        `${trackLabels[track]}: only ${Math.round((joinRate ?? 0) * 100)}% of teams matched by name across rounds — trajectory and funnel suppressed. Check for renamed teams.`
      );
    }

    trajectories[track] = trustworthy ? entries : [];
    funnels[track] = trustworthy ? buildFunnel(r1, r2) : [];
  }

  return {
    generatedAt: Date.now(),
    boards: boards.map(stripRows),
    separation,
    trajectories,
    nameJoinRate,
    probableNameMatches,
    funnels,
    timing,
    crossTrack,
    trackShape: buildTrackShape(usable),
    contenders: buildContenders(usable, trajectories, separation, crossTrack),
    warnings,
  };
}

function stripRows(board: CompetitionBoard): BoardStatus {
  const { rows: _rows, ...status } = board;
  void _rows;
  return status;
}

/** Convenience for callers that need the registry's ordering. */
export function orderedSlugs(): CompetitionSlug[] {
  return COMPETITIONS.map((c) => c.slug);
}

export { metricHigherIsBetter, trackLabels };
