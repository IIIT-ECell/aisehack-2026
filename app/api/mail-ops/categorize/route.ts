import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { categorizeMessage } from "@/lib/mail-ops/categorize";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const body = await req.json();
  const { messageId, subject, snippet, refresh } = body ?? {};

  if (!messageId) {
    return NextResponse.json({ error: "messageId is required" }, { status: 400 });
  }

  const result = await categorizeMessage(messageId, subject ?? "", snippet ?? "", Boolean(refresh));
  return NextResponse.json(result);
}
