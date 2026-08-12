import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getBatchSendHistory } from "@/lib/mail-ops/batch-log";

export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const history = (await getBatchSendHistory()).sort((a, b) => b.sentAt - a.sentAt);
  return NextResponse.json({ history });
}
