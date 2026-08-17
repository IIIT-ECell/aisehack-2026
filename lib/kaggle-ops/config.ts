// Central config for the kaggle-ops analysis panel.
// Mirrors lib/mail-ops/config.ts: optional values are plain properties read at
// import, required secrets are lazy thunks so importing this module never
// breaks the build when credentials are absent.

// .trim(): a value pasted from kaggle.json (or a deploy env file) carrying a
// stray trailing space or newline sends Kaggle a byte-for-byte wrong
// username/key, which the API rejects as a plain 401 with no hint that
// whitespace, not the credential itself, was the problem.
function required(name: string): string {
  const value = (process.env[name] ?? "").trim();
  if (!value) {
    throw new Error(
      `[kaggle-ops] Missing required environment variable: ${name}. See lib/kaggle-ops/README.md for setup.`
    );
  }
  return value;
}

export const TRACKS = ["polymer", "sar"] as const;
export type Track = (typeof TRACKS)[number];

export const trackLabels: Record<Track, string> = {
  polymer: "Polymer Property Prediction",
  sar: "Remote Sensing / SAR",
};

/**
 * The canonical registry of the four AISEHack 2.0 Kaggle competitions.
 * This is the single source of truth for slugs — API routes validate incoming
 * slugs against it rather than proxying arbitrary competition names.
 */
export const COMPETITIONS = [
  {
    slug: "aisehack-2-0",
    track: "polymer",
    round: 1,
    label: "Polymer · Round 1",
  },
  {
    slug: "ppp-round-2",
    track: "polymer",
    round: 2,
    label: "Polymer · Round 2",
  },
  {
    slug: "anrf-aise-hack-2026-round-1-sar-crop-mapping-challenge",
    track: "sar",
    round: 1,
    label: "SAR · Round 1 (Crop Mapping)",
  },
  {
    slug: "anrf-aise-hack-2-0-round-2-sar-crop-health-yield-estimation",
    track: "sar",
    round: 2,
    label: "SAR · Round 2 (Crop Health & Yield)",
  },
] as const satisfies readonly {
  slug: string;
  track: Track;
  round: 1 | 2;
  label: string;
}[];

export type CompetitionSlug = (typeof COMPETITIONS)[number]["slug"];

export function findCompetition(slug: string) {
  return COMPETITIONS.find((c) => c.slug === slug);
}

export function competitionsForTrack(track: Track) {
  return COMPETITIONS.filter((c) => c.track === track);
}

/**
 * Whether a higher score is better for each track's metric.
 *
 * The Kaggle leaderboard API does NOT expose metric direction, so this cannot
 * be derived — it must be set by hand. Getting it wrong inverts the separation
 * analysis, so the UI surfaces the assumption next to the results rather than
 * hiding it. Override per track via env if a metric turns out to be
 * error-like (lower-better).
 */
export const metricHigherIsBetter: Record<Track, boolean> = {
  polymer: process.env.KAGGLE_OPS_POLYMER_LOWER_IS_BETTER !== "true",
  sar: process.env.KAGGLE_OPS_SAR_LOWER_IS_BETTER !== "true",
};

export const kaggleOpsConfig = {
  username: () => required("KAGGLE_OPS_USERNAME"),
  apiKey: () => required("KAGGLE_OPS_KEY"),
  apiBase: "https://www.kaggle.com/api/v1",
  cacheTtlMs: Number(process.env.KAGGLE_OPS_CACHE_TTL_MS) || 10 * 60 * 1000,
  requestTimeoutMs: 15_000,
  /** How many top teams get a full contender dossier. */
  topN: Number(process.env.KAGGLE_OPS_TOP_N) || 20,
  /** A gap this many times the median starts a new tier. */
  tierGapMultiplier: Number(process.env.KAGGLE_OPS_TIER_GAP_MULTIPLIER) || 2.5,
  /** Below this R1↔R2 name-join rate, trajectory/funnel self-disable. */
  minJoinRate: 0.4,
  /** Teams beyond this rank are ignored by the gap/cutoff analysis. */
  separationDepth: 30,
  /** Percentile (0-1) at or above which a team counts as "top" in a round. */
  topPercentile: 0.1,
} as const;

/** Whether credentials are present, without throwing — used to render setup hints. */
export function hasKaggleCredentials(): boolean {
  return Boolean((process.env.KAGGLE_OPS_USERNAME ?? "").trim() && (process.env.KAGGLE_OPS_KEY ?? "").trim());
}
