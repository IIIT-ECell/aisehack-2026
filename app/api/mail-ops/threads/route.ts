import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { listMail } from "@/lib/mail-ops/gmail";
import { mailOpsConfig } from "@/lib/mail-ops/config";

export async function GET(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || mailOpsConfig.defaultQuery;
  const pageToken = searchParams.get("pageToken") ?? undefined;

  try {
    const result = await listMail(session.accessToken!, query, pageToken);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mail from Gmail" }, { status: 502 });
  }
}
