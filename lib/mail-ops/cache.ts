import { promises as fs } from "fs";
import path from "path";
import type { MailCategory } from "./config";

// Small file-based cache so we don't re-run (paid) AI categorization on
// every dashboard load. This is a single-admin internal tool, so a JSON
// file is enough — no database needed. Directory is gitignored.

export interface CategoryResult {
  category: MailCategory;
  summary: string;
  cachedAt: number;
  // Display fields for the Queries & Grievances feed, so it can render list
  // rows straight from the cache without extra Gmail calls. Optional because
  // entries cached before this field existed won't have them.
  threadId?: string;
  from?: string;
  fromName?: string;
  subject?: string;
  date?: string;
  unread?: boolean;
  // Whether the last message in the thread is from the student (true) or
  // the admin has already sent the most recent reply (false). Computed at
  // scan time by inspecting the thread; undefined means never checked.
  awaitingReply?: boolean;
}

const CACHE_DIR = path.join(process.cwd(), ".mail-ops-cache");
const CACHE_FILE = path.join(CACHE_DIR, "categories.json");

async function readCache(): Promise<Record<string, CategoryResult>> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCache(data: Record<string, CategoryResult>): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCachedCategory(messageId: string): Promise<CategoryResult | undefined> {
  const cache = await readCache();
  return cache[messageId];
}

export async function setCachedCategory(messageId: string, result: CategoryResult): Promise<void> {
  const cache = await readCache();
  cache[messageId] = result;
  await writeCache(cache);
}

export async function getAllCachedCategories(): Promise<Record<string, CategoryResult>> {
  return readCache();
}

// Called after the admin sends a reply, so every cached message belonging
// to that thread stops showing up as "awaiting reply" immediately, without
// needing a re-scan.
export async function setAwaitingReplyByThread(threadId: string, awaitingReply: boolean): Promise<void> {
  const cache = await readCache();
  let changed = false;
  for (const entry of Object.values(cache)) {
    if (entry.threadId === threadId && entry.awaitingReply !== awaitingReply) {
      entry.awaitingReply = awaitingReply;
      changed = true;
    }
  }
  if (changed) await writeCache(cache);
}
