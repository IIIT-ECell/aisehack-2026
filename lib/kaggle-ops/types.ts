import type { FetchFailureReason, FieldCoverage, LeaderboardRow } from "./client";
import type { CompetitionSlug, Track } from "./config";

export interface RankedRow extends LeaderboardRow {
  /** Join key: normalized team name (see normalizeTeamName). */
  normKey: string;
  /** Competition ranking — ties share a rank and consume the next (1, 2, 2, 4). */
  rank: number;
  /** 0..1, where 1 is the top of the board. */
  percentile: number;
  /** Absolute score distance to the next-worse team, or null at the bottom. */
  gapToNext: number | null;
  gapToLead: number;
  /** How many teams share this exact score. >1 means the metric can't separate them. */
  tiedCount: number;
  tier: number;
  /** Days between this submission and the last submission on the board. */
  daysBeforeClose: number | null;
}

export interface BoardStatus {
  slug: CompetitionSlug;
  label: string;
  track: Track;
  round: 1 | 2;
  status: "ok" | "stale" | "unavailable";
  reason?: FetchFailureReason;
  message?: string;
  fetchedAt: number | null;
  scoreHigherIsBetter: boolean;
  /** Whether direction came from the API's own row order or from config. */
  directionSource: "api-order" | "config";
  directionConflict: boolean;
  rowCount: number;
  scoredCount: number;
  possiblyTruncated: boolean;
  coverage: FieldCoverage | null;
}

export interface CompetitionBoard extends BoardStatus {
  rows: RankedRow[];
}

export interface TierSummary {
  tier: number;
  fromRank: number;
  toRank: number;
  size: number;
  bestScore: number;
  worstScore: number;
  gapToPrevTier: number | null;
}

export interface CutoffCandidate {
  afterRank: number;
  gap: number;
  /** Gap expressed as a multiple of the board's median gap. */
  gapRatio: number;
}

export interface TieGroup {
  score: number;
  /** Tied teams share a single rank under competition ranking. */
  rank: number;
  teams: string[];
}

export interface SeparationAnalysis {
  slug: CompetitionSlug;
  label: string;
  medianGap: number;
  leadOverSecond: number | null;
  leadOverSecondRatio: number | null;
  tiers: TierSummary[];
  cutoffs: CutoffCandidate[];
  topTies: TieGroup[];
  verdict: "decisive" | "clustered" | "noise-level" | "insufficient-data";
  verdictText: string;
}

export interface RoundSnapshot {
  rank: number;
  total: number;
  percentile: number;
  score: number;
}

export interface TrajectoryEntry {
  normKey: string;
  displayName: string;
  track: Track;
  r1?: RoundSnapshot;
  r2?: RoundSnapshot;
  /** r1.rank - r2.rank; positive means the team climbed. */
  rankDelta: number | null;
  percentileDelta: number | null;
  status: "climber" | "held" | "faller" | "r1-only" | "r2-only";
}

export interface ProbableNameMatch {
  track: Track;
  r1Name: string;
  r2Name: string;
  similarity: number;
}

export interface FunnelBand {
  label: string;
  fromRank: number;
  toRank: number;
  r1Teams: number;
  reappeared: number;
  rate: number;
}

export interface TimingAnalysis {
  slug: CompetitionSlug;
  label: string;
  windowStart: string | null;
  windowEnd: string | null;
  byDay: { day: string; all: number; top: number }[];
  lastDayShareAll: number | null;
  lastDayShareTop: number | null;
  coverage: number;
}

export interface CrossTrackTeam {
  normKey: string;
  displayName: string;
  entries: { slug: CompetitionSlug; label: string; rank: number; total: number }[];
}

export type SignalComponent = "peak" | "momentum" | "consistency" | "separation" | "earliness";

export interface ContenderDossier {
  normKey: string;
  displayName: string;
  track: Track;
  headline: { slug: CompetitionSlug; label: string; rank: number; total: number; score: number };
  tier: number;
  gapAbove: number | null;
  gapBelow: number | null;
  gapBelowRatio: number | null;
  trajectory: TrajectoryEntry | null;
  daysBeforeClose: number | null;
  crossTrack: string[];
  components: Partial<Record<SignalComponent, number>>;
  /** Fraction of the total signal weight that was actually computable. */
  signalCoverage: number;
  finalistSignal: number;
  notes: string[];
}

export interface TrackShape {
  track: Track;
  teamsR1: number | null;
  teamsR2: number | null;
  retentionRate: number | null;
  tieDensityR2: number | null;
  tierCountTop25R2: number | null;
}

export interface KaggleAnalysis {
  generatedAt: number;
  boards: BoardStatus[];
  separation: SeparationAnalysis[];
  trajectories: Record<Track, TrajectoryEntry[]>;
  nameJoinRate: Record<Track, number | null>;
  probableNameMatches: ProbableNameMatch[];
  funnels: Record<Track, FunnelBand[]>;
  timing: TimingAnalysis[];
  crossTrack: CrossTrackTeam[];
  trackShape: TrackShape[];
  contenders: ContenderDossier[];
  warnings: string[];
}
