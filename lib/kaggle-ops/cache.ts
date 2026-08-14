import { promises as fs } from "fs";
import path from "path";
import type { FieldCoverage, LeaderboardRow } from "./client";
import type { CompetitionSlug } from "./config";

// File cache for fetched leaderboards, in the same spirit as
// lib/mail-ops/cache.ts (gitignored dir, read swallows errors) with two
// deliberate differences:
//
//  1. It has a TTL. mail-ops caches forever because its keys are immutable
//     message IDs; leaderboard standings change, so entries must expire.
//  2. Writes go through writeBoards(), which takes ALL boards at once. The
//     four competitions are fetched in parallel, and four separate
//     read-modify-write cycles against one JSON file would clobber each other.

export interface CachedBoard {
  fetchedAt: number;
  slug: string;
  rows: LeaderboardRow[];
  rowCount: number;
  possiblyTruncated: boolean;
  coverage: FieldCoverage;
}

type CacheFile = Partial<Record<CompetitionSlug, CachedBoard>>;

const CACHE_DIR = path.join(process.cwd(), ".kaggle-ops-cache");
const CACHE_FILE = path.join(CACHE_DIR, "leaderboards.json");

export async function readBoards(): Promise<CacheFile> {
  try {
    return JSON.parse(await fs.readFile(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * Merges the given boards into the cache in a single read-modify-write.
 * Failures are swallowed: the standalone Docker image may have a read-only
 * working directory, and losing the cache must never fail a request.
 */
export async function writeBoards(boards: CacheFile): Promise<void> {
  try {
    const existing = await readBoards();
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify({ ...existing, ...boards }, null, 2), "utf-8");
  } catch {
    // Cache is an optimization, not a requirement.
  }
}

export function isFresh(entry: CachedBoard | undefined, ttlMs: number): entry is CachedBoard {
  return Boolean(entry) && Date.now() - entry!.fetchedAt < ttlMs;
}
