import { isFresh, readBoards, writeBoards, type CachedBoard } from "./cache";
import { KaggleFetchError, fetchLeaderboard } from "./client";
import {
  COMPETITIONS,
  hasKaggleCredentials,
  kaggleOpsConfig,
  metricHigherIsBetter,
  type CompetitionSlug,
} from "./config";
import { inferDirection, rankRows } from "./analysis";
import type { CompetitionBoard } from "./types";

// Orchestrates cache + client for all four competitions.
//
// Deliberate divergence from the mail-ops convention of "bare catch -> 502":
// with four upstream calls, one invite-only competition returning 403 must not
// blank the entire tab. Failures are recorded per board and the request still
// succeeds; only a total failure with no cache is treated as an error by the
// route. A failed refresh that has a cached entry serves the cache as "stale"
// rather than discarding usable data.

export async function loadBoards(opts: { refresh?: boolean } = {}): Promise<CompetitionBoard[]> {
  const cache = await readBoards();
  const fresh: Partial<Record<CompetitionSlug, CachedBoard>> = {};

  const settled = await Promise.allSettled(
    COMPETITIONS.map(async (competition) => {
      const cached = cache[competition.slug];

      if (!opts.refresh && isFresh(cached, kaggleOpsConfig.cacheTtlMs)) {
        return { competition, cached, fromCache: true as const };
      }

      if (!hasKaggleCredentials()) {
        throw new KaggleFetchError(
          "auth",
          "Kaggle credentials are not configured",
          competition.slug
        );
      }

      const result = await fetchLeaderboard(competition.slug);
      const entry: CachedBoard = {
        fetchedAt: Date.now(),
        slug: competition.slug,
        rows: result.rows,
        rowCount: result.rowCount,
        possiblyTruncated: result.possiblyTruncated,
        coverage: result.coverage,
      };
      fresh[competition.slug] = entry;
      return { competition, cached: entry, fromCache: false as const };
    })
  );

  // One write for all boards — four parallel read-modify-write cycles against
  // a single JSON file would clobber each other.
  if (Object.keys(fresh).length > 0) await writeBoards(fresh);

  return settled.map((outcome, index) => {
    const competition = COMPETITIONS[index];

    if (outcome.status === "fulfilled") {
      return toBoard(competition, outcome.value.cached, "ok");
    }

    const error = outcome.reason;
    const reason = error instanceof KaggleFetchError ? error.reason : "network";
    const message = error instanceof Error ? error.message : "Unknown failure";
    const stale = cache[competition.slug];

    if (stale) return toBoard(competition, stale, "stale", reason, message);

    return {
      slug: competition.slug,
      label: competition.label,
      track: competition.track,
      round: competition.round,
      status: "unavailable" as const,
      reason,
      message,
      fetchedAt: null,
      scoreHigherIsBetter: metricHigherIsBetter[competition.track],
      directionSource: "config" as const,
      directionConflict: false,
      rowCount: 0,
      scoredCount: 0,
      possiblyTruncated: false,
      coverage: null,
      rows: [],
    };
  });
}

function toBoard(
  competition: (typeof COMPETITIONS)[number],
  cached: CachedBoard,
  status: "ok" | "stale",
  reason?: CompetitionBoard["reason"],
  message?: string
): CompetitionBoard {
  const configured = metricHigherIsBetter[competition.track];
  const direction = inferDirection(cached.rows, configured);

  return {
    slug: competition.slug,
    label: competition.label,
    track: competition.track,
    round: competition.round,
    status,
    reason,
    message,
    fetchedAt: cached.fetchedAt,
    scoreHigherIsBetter: direction.higherIsBetter,
    directionSource: direction.source,
    directionConflict: direction.conflict,
    rowCount: cached.rowCount,
    scoredCount: cached.rows.length,
    possiblyTruncated: cached.possiblyTruncated,
    coverage: cached.coverage,
    rows: rankRows(cached.rows, direction.higherIsBetter),
  };
}
