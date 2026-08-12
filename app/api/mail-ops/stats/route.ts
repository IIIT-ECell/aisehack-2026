import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getAllCachedCategories } from "@/lib/mail-ops/cache";
import { CATEGORIES } from "@/lib/mail-ops/config";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const cache = await getAllCachedCategories();
  const entries = Object.values(cache);

  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<string, number>;
  const byDay: Record<string, number> = {};

  for (const entry of entries) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    const day = new Date(entry.cachedAt).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  return NextResponse.json({
    total: entries.length,
    byCategory,
    byDay,
  });
}
