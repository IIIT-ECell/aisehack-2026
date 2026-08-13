import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getAllCachedCategories } from "@/lib/mail-ops/cache";
import { listMail, getThread } from "@/lib/mail-ops/gmail";
import { categorizeMessage } from "@/lib/mail-ops/categorize";
import { mailOpsConfig } from "@/lib/mail-ops/config";

const QUERY_CATEGORIES = new Set(["general-query", "other"]);

async function filteredFeed() {
  const cache = await getAllCachedCategories();
  return Object.entries(cache)
    .filter(([, entry]) => QUERY_CATEGORIES.has(entry.category) && entry.threadId)
    .map(([messageId, entry]) => ({
      id: messageId,
      threadId: entry.threadId!,
      from: entry.from ?? "",
      fromName: entry.fromName ?? entry.from ?? "",
      subject: entry.subject ?? "(no subject)",
      snippet: entry.summary,
      date: entry.date ?? "",
      unread: entry.unread ?? false,
      category: entry.category,
      awaitingReply: entry.awaitingReply ?? false,
    }))
    .sort((a, b) => {
      if (a.awaitingReply !== b.awaitingReply) return a.awaitingReply ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
}

// Whether the thread's most recent message was sent by the student rather
// than the admin — i.e. the admin still owes a reply.
async function computeAwaitingReply(accessToken: string, threadId: string): Promise<boolean> {
  try {
    const thread = await getThread(accessToken, threadId);
    const last = thread.messages[thread.messages.length - 1];
    if (!last) return true;
    return !last.from.toLowerCase().includes(mailOpsConfig.adminEmail);
  } catch {
    return true;
  }
}

// GET: cache-filtered feed only — zero extra Gmail/AI calls, instant.
export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  return NextResponse.json({ items: await filteredFeed() });
}

// Runs `fn` over `items` with at most `limit` in flight at once. Plain
// sequential awaiting of 100 Gmail+categorize round-trips was taking
// minutes per scan and getting killed by an upstream proxy timeout (502)
// in production — this cuts wall-clock time roughly by `limit`x while
// staying modest enough not to hammer the Gmail/Gemini APIs.
async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

// POST: admin-initiated "scan for new" — categorizes any not-yet-cached
// message in the given query, same pipeline as the Inbox "Categorize"
// button, then returns the refreshed filtered feed.
//
// Gmail's list API only returns 25 messages per page. This walks pages
// until it has collected `max` not-yet-cached messages (or runs out of
// pages/budget), so older un-replied queries beyond the first page actually
// get scanned instead of silently never showing up in the feed. Both `max`
// and MAX_PAGES are kept modest so a single scan reliably finishes within
// a normal proxy timeout — click "Scan for new" again to work through a
// larger backlog incrementally; already-cached messages are skipped.
const MAX_PAGES = 6;
const CONCURRENCY = 5;

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const body = await req.json().catch(() => ({}));
  const query = body?.query || mailOpsConfig.defaultQuery;
  const max = Math.min(Number(body?.max) || 40, 60);

  try {
    const cache = await getAllCachedCategories();
    const toScan: Awaited<ReturnType<typeof listMail>>["items"] = [];
    let pageToken: string | undefined;
    let pages = 0;

    do {
      const page = await listMail(session.accessToken!, query, pageToken);
      for (const item of page.items) {
        if (!cache[item.id]) toScan.push(item);
      }
      pageToken = page.nextPageToken;
      pages += 1;
    } while (pageToken && pages < MAX_PAGES && toScan.length < max);

    const capped = toScan.slice(0, max);
    await mapWithConcurrency(capped, CONCURRENCY, async (item) => {
      const awaitingReply = await computeAwaitingReply(session.accessToken!, item.threadId);
      await categorizeMessage(item.id, item.subject, item.snippet, false, {
        threadId: item.threadId,
        from: item.from,
        fromName: item.fromName,
        subject: item.subject,
        date: item.date,
        unread: item.unread,
        awaitingReply,
      });
    });

    return NextResponse.json({ items: await filteredFeed(), scanned: capped.length, pagesFetched: pages });
  } catch {
    return NextResponse.json({ error: "Failed to scan mail" }, { status: 502 });
  }
}
