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
