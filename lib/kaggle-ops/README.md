# kaggle-ops — cross-round leaderboard analysis

A Kaggle tab inside the existing admin dashboard at `/mail-ops-x9k2`. It has no
URL of its own and no separate login: it sits behind the same Google
sign-in allowlist as the mail tab (`lib/mail-ops/auth.ts`), and its API routes
are gated by the same `requireAdminSession()` guard.

## What it is for

AISEHack 2.0 ran two Kaggle rounds across two tracks:

| Track | Round 1 | Round 2 |
|---|---|---|
| Polymer | `aisehack-2-0` | `ppp-round-2` |
| SAR / Remote Sensing | `anrf-aise-hack-2026-round-1-sar-crop-mapping-challenge` | `anrf-aise-hack-2-0-round-2-sar-crop-health-yield-estimation` |

Kaggle already shows standings, so this deliberately does **not** rehash them.
Kaggle treats all four as unrelated competitions with no shared team identity,
and it renders the score column as a sorted list without ever saying whether the
ordering is meaningful. Everything here is one of the two things that follow
from that:

1. **Joins Kaggle cannot make** — Round 1 × Round 2, and Polymer × SAR.
2. **Statistics on a column Kaggle only sorts** — gap structure, tiers, ties,
   and where a defensible cutoff actually falls.

### The panels

- **Top contenders** — the centrepiece. Per team: standing, cross-round
  movement, consistency, separation from the next team, and how early the best
  score landed, combined into one transparent signal with its components shown.
  It is a ranking aid for finalist selection, not a verdict.
- **Score separation** — gaps between consecutive teams as multiples of the
  board's median gap, the largest gaps as candidate cutoffs, and exact ties
  called out. This is what answers "is #1 really ahead of #8, or is the top ten
  a coin flip?"
- **Round 1 → Round 2 trajectory** — climbers, fallers, teams that held, new
  entrants, and teams that did not return.
- **Who came back for Round 2** — reappearance rate by Round 1 rank band.
- **When the best scores landed**, **field shape by track**, **teams in both
  tracks**, and a **Diagnostics** panel.

## Setup

1. kaggle.com → your avatar → **Settings → API → Create New Token**. This
   downloads `kaggle.json` containing `{"username": "...", "key": "..."}`.
   Creating a new token invalidates any previous one.
2. Put both values in `.env.local` (gitignored):
   ```
   KAGGLE_OPS_USERNAME=...
   KAGGLE_OPS_KEY=...
   ```
3. **Signed in as that same Kaggle account**, open each of the four
   competitions in a browser and confirm the rules are accepted / the
   invitation is accepted. The API mirrors web permissions exactly — a
   competition the account has not joined returns 403 no matter how valid the
   token is. This is the most likely setup failure, especially for the
   invite-only Round 2 boards.
4. Restart the dev server; env vars are read at import.

## Known limits of the data

The leaderboard endpoint exposes only `{ teamId, teamName, submissionDate,
score }`. That rules out several things it would be reasonable to expect, and
they are absent rather than approximated:

- **No per-team submission counts** → no "efficiency" or leaderboard-probing
  metric.
- **No team member lists** → no individual or institution breakdown.
- **No per-team submission history** → only the best-scoring submission's date
  is known, so the timing panel shows *when*, never *how much*.
- **No private leaderboard** at participant access level.

Two further caveats are surfaced in the UI rather than buried here:

- **Cross-track scores are not comparable.** The tracks use different metrics,
  so only counts and ratios are ever compared across them.
- **Round 2 is invite-only.** A team's absence from Round 2 may mean it was not
  invited, not that it dropped out. The funnel is labelled "reappearance", not
  attrition.

## Assumptions that need verifying against a live API

This feature was written in an environment where `kaggle.com` is blocked by the
network egress proxy, so the response shape could not be observed directly.
The client is written to tolerate several plausible shapes and to **report what
it actually parsed** instead of assuming it guessed right.

**Open the Diagnostics panel first.** For each board it shows the envelope shape
that matched, per-field coverage bars, any response fields the client did not
consume, and the row count. A coverage bar near zero means the API used a field
name `client.ts` does not expect — fix it in the `*_KEYS` arrays at the top of
that file. `GET /api/kaggle-ops/leaderboards` returns the same detail plus
sample parsed rows.

Specific things to check:

1. **Row count.** Compare against the team count on the Kaggle leaderboard page.
   If the endpoint paginates, percentiles and medians are computed on a partial
   field. The UI flags suspiciously round counts automatically.
2. **Metric direction.** Inferred from the API's own row ordering, falling back
   to config. A disagreement raises a warning. If a track's metric is an error
   measure, set `KAGGLE_OPS_<TRACK>_LOWER_IS_BETTER=true`.
3. **Name join rate.** Shown on the trajectory panel. Teams rename between
   rounds; below 40% the trajectory and funnel panels disable themselves rather
   than showing confidently wrong numbers, and probable renames are listed for
   manual confirmation (never auto-merged).
4. **Host access.** If this account turns out to hold *host* rights on any
   competition, considerably more becomes available — all submissions, the
   private leaderboard, team members — which would enable genuine overfitting
   and shakeup analysis. Worth checking; the current design assumes participant
   access only.

## Caching

Fetched boards are cached in `.kaggle-ops-cache/leaderboards.json` (gitignored —
it contains participant team names) with a TTL, default 10 minutes. The
"Refresh from Kaggle" button bypasses it. Derived analysis is never cached; it
is a pure function of the cached rows, recomputed per request.

If a refresh fails but a cached copy exists, the cached rows are served and the
board is marked **stale** with the failure reason rather than being dropped —
so one unreachable competition degrades that board alone instead of blanking
the tab.
