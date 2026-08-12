import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { sendReply } from "@/lib/mail-ops/gmail";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const body = await req.json();
  const { threadId, to, subject, message, inReplyTo, references } = body ?? {};

  if (!threadId || !to || !message) {
    return NextResponse.json({ error: "threadId, to, and message are required" }, { status: 400 });
  }

  try {
    await sendReply(session.accessToken!, {
      threadId,
      to,
      subject: subject ?? "",
      body: message,
      inReplyTo: inReplyTo ?? "",
      references: references ?? "",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 502 });
  }
}
