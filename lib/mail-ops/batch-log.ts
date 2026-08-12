import { promises as fs } from "fs";
import path from "path";

// Append-only audit log of batch-send blasts. Same on-disk pattern as
// cache.ts (single-admin tool, no DB needed); a separate file since this is
// conceptually unrelated to AI categorization. Directory is gitignored.

export interface BatchSendRecord {
  batchId: string;
  subject: string;
  sentAt: number;
  recipientCount: number;
  skippedCount: number;
}

const LOG_DIR = path.join(process.cwd(), ".mail-ops-cache");
const LOG_FILE = path.join(LOG_DIR, "batch-sends.json");

async function readLog(): Promise<BatchSendRecord[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLog(records: BatchSendRecord[]): Promise<void> {
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export async function appendBatchSend(record: BatchSendRecord): Promise<void> {
  const log = await readLog();
  log.push(record);
  await writeLog(log);
}

export async function getBatchSendHistory(): Promise<BatchSendRecord[]> {
  return readLog();
}

export async function getLastSendForBatch(batchId: string): Promise<BatchSendRecord | undefined> {
  const log = await readLog();
  return log.filter((r) => r.batchId === batchId).sort((a, b) => b.sentAt - a.sentAt)[0];
}
