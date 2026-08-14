import { kaggleOpsConfig } from "./config";

// Kaggle REST client. Uses plain fetch with HTTP Basic auth — the Kaggle API
// takes the same username/key pair that lives in kaggle.json, so no SDK and no
// new dependency are needed.
//
// IMPORTANT: kaggle.com is unreachable from the container this was written in,
// so the exact response envelope could NOT be observed. Everything here is
// written to tolerate several plausible shapes and to *report* what it actually
// found (see FieldCoverage) rather than assume it got things right. The
// Diagnostics panel surfaces that report — it is the instrument for validating
// these guesses on a machine that can reach Kaggle.

export interface LeaderboardRow {
  teamId: string;
  teamName: string;
  submissionDate?: string;
  score: number;
  /** Present only if the API exposes it — undocumented, treated as a bonus. */
  entries?: number;
}

/** What the normalizer actually managed to read, so wrong guesses are visible. */
export interface FieldCoverage {
  teamName: number;
  score: number;
  submissionDate: number;
  entries: number;
  /** Keys present on the first raw row that we did not consume. */
  unknownKeys: string[];
  /** Which extraction branch matched, for debugging the envelope shape. */
  envelopeShape: string;
}

export interface LeaderboardResult {
  rows: LeaderboardRow[];
  rowCount: number;
  coverage: FieldCoverage;
  /**
   * True when the row count looks like an API page limit rather than the real
   * field size. Truncation silently corrupts percentiles, medians and funnel
   * rates, so it must be surfaced loudly rather than assumed away.
   */
  possiblyTruncated: boolean;
}

export type FetchFailureReason =
  | "auth"
  | "forbidden"
  | "not-found"
  | "rate-limited"
  | "network"
  | "not-json"
  | "bad-shape";

export class KaggleFetchError extends Error {
  constructor(
    readonly reason: FetchFailureReason,
    message: string,
    readonly slug: string
  ) {
    super(message);
    this.name = "KaggleFetchError";
  }
}

const SUSPICIOUS_COUNTS = new Set([50, 100, 200, 250, 500, 1000]);

function authHeader(): string {
  const raw = `${kaggleOpsConfig.username()}:${kaggleOpsConfig.apiKey()}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

/** Case-insensitive lookup across several candidate key names. */
function pickField(source: Record<string, unknown>, names: string[]): { value: unknown; key?: string } {
  const entries = Object.entries(source);
  for (const name of names) {
    const hit = entries.find(([k]) => k.toLowerCase() === name.toLowerCase());
    if (hit && hit[1] !== null && hit[1] !== undefined) {
      return { value: hit[1], key: hit[0] };
    }
  }
  return { value: undefined };
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

const NAME_KEYS = ["teamName", "team", "displayName", "teamNameNullable", "name"];
const SCORE_KEYS = ["score", "publicScore", "scoreNullable", "value"];
const DATE_KEYS = ["submissionDate", "lastSubmissionDate", "submissionDateRaw", "date"];
const ID_KEYS = ["teamId", "id"];
const ENTRY_KEYS = ["entries", "submissionCount", "totalEntries"];

/** Pulls the row array out of whatever envelope the API returned. */
function extractRows(payload: unknown): { rows: Record<string, unknown>[]; shape: string } {
  if (Array.isArray(payload)) {
    return { rows: payload as Record<string, unknown>[], shape: "bare-array" };
  }
  if (!payload || typeof payload !== "object") return { rows: [], shape: "not-an-object" };

  const obj = payload as Record<string, unknown>;

  for (const key of ["submissions", "publicLeaderboard", "leaderboard", "results", "rows"]) {
    const found = pickField(obj, [key]).value;
    if (Array.isArray(found)) {
      return { rows: found as Record<string, unknown>[], shape: key };
    }
  }

  // Fall back to the first array-valued property, at the top level or one down.
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      return { rows: value as Record<string, unknown>[], shape: `fallback:${key}` };
    }
    if (value && typeof value === "object") {
      for (const [nestedKey, nested] of Object.entries(value as Record<string, unknown>)) {
        if (Array.isArray(nested)) {
          return { rows: nested as Record<string, unknown>[], shape: `fallback:${key}.${nestedKey}` };
        }
      }
    }
  }

  return { rows: [], shape: "unrecognized" };
}

export function normalizeLeaderboard(payload: unknown): LeaderboardResult {
  const { rows: raw, shape } = extractRows(payload);

  const rows: LeaderboardRow[] = [];
  let nameHits = 0;
  let scoreHits = 0;
  let dateHits = 0;
  let entryHits = 0;
  const consumed = new Set<string>();

  raw.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;
    const source = entry as Record<string, unknown>;

    const name = pickField(source, NAME_KEYS);
    const score = pickField(source, SCORE_KEYS);
    const date = pickField(source, DATE_KEYS);
    const id = pickField(source, ID_KEYS);
    const entries = pickField(source, ENTRY_KEYS);

    for (const hit of [name, score, date, id, entries]) {
      if (hit.key) consumed.add(hit.key);
    }

    const teamName = typeof name.value === "string" ? name.value.trim() : "";
    const numericScore = toNumber(score.value);
    const isoDate = toIsoDate(date.value);
    const numericEntries = toNumber(entries.value);

    if (teamName) nameHits += 1;
    if (numericScore !== undefined) scoreHits += 1;
    if (isoDate) dateHits += 1;
    if (numericEntries !== undefined) entryHits += 1;

    // A row without a usable name or score cannot take part in any analysis.
    if (!teamName || numericScore === undefined) return;

    rows.push({
      teamId: id.value === undefined ? `idx-${index}` : String(id.value),
      teamName,
      submissionDate: isoDate,
      score: numericScore,
      entries: numericEntries,
    });
  });

  const denom = Math.max(1, raw.length);
  const firstRow = raw[0] && typeof raw[0] === "object" ? (raw[0] as Record<string, unknown>) : {};

  return {
    rows,
    rowCount: raw.length,
    possiblyTruncated: SUSPICIOUS_COUNTS.has(raw.length),
    coverage: {
      teamName: nameHits / denom,
      score: scoreHits / denom,
      submissionDate: dateHits / denom,
      entries: entryHits / denom,
      unknownKeys: Object.keys(firstRow).filter((k) => !consumed.has(k)),
      envelopeShape: shape,
    },
  };
}

function reasonForStatus(status: number): FetchFailureReason {
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  return "network";
}

/**
 * Fetches one competition's leaderboard.
 * Throws KaggleFetchError so the caller can report which competition was
 * unreachable without failing the whole analysis.
 */
export async function fetchLeaderboard(slug: string): Promise<LeaderboardResult> {
  const url = `${kaggleOpsConfig.apiBase}/competitions/${encodeURIComponent(slug)}/leaderboard/view`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: authHeader(), Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(kaggleOpsConfig.requestTimeoutMs),
    });
  } catch {
    throw new KaggleFetchError("network", "Could not reach the Kaggle API", slug);
  }

  if (!response.ok) {
    const reason = reasonForStatus(response.status);
    const hint =
      reason === "forbidden" || reason === "not-found"
        ? "no access — confirm this Kaggle account joined the competition and accepted its rules"
        : `HTTP ${response.status}`;
    throw new KaggleFetchError(reason, hint, slug);
  }

  // Never call response.json() directly: an expired session or a Cloudflare
  // interstitial answers 200 with HTML, and the resulting parse error would be
  // indistinguishable from a genuine network fault.
  const body = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new KaggleFetchError("not-json", "Kaggle returned a non-JSON response", slug);
  }

  const result = normalizeLeaderboard(payload);
  if (result.rowCount === 0) {
    throw new KaggleFetchError("bad-shape", "Could not find leaderboard rows in the response", slug);
  }

  return result;
}
