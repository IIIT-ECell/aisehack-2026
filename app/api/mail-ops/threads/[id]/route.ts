import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getThread } from "@/lib/mail-ops/gmail";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { id } = await params;

  try {
    const thread = await getThread(session.accessToken!, id);
    return NextResponse.json(thread);
  } catch {
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 502 });
  }
}
