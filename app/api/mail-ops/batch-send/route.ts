import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getBatch } from "@/lib/mail-ops/batches";
import { validateRecipients } from "@/lib/mail-ops/email-validate";
import { sendBulkBcc } from "@/lib/mail-ops/gmail";
import { appendBatchSend } from "@/lib/mail-ops/batch-log";
import { BATCH_SEND_CC } from "@/lib/mail-ops/config";

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const body = await req.json();
  const { batchId, subject, body: messageBody, confirm } = body ?? {};

  if (!batchId || !subject || !messageBody) {
    return NextResponse.json({ error: "batchId, subject, and body are required" }, { status: 400 });
  }
  if (confirm !== true) {
    return NextResponse.json({ error: "confirm must be true to send" }, { status: 400 });
  }

  const batch = getBatch(batchId);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const adminEmail = (session.user?.email ?? "").toLowerCase();
  const excluded = new Set([...BATCH_SEND_CC.map((e) => e.toLowerCase()), adminEmail]);

  const { valid, invalid } = validateRecipients(batch.recipients);
  const bcc = valid.filter((e) => !excluded.has(e.toLowerCase()));
  const skippedCount = invalid.length + (valid.length - bcc.length);

  if (bcc.length === 0) {
    return NextResponse.json({ error: "No valid recipients to send to" }, { status: 400 });
  }

  try {
    await sendBulkBcc(session.accessToken!, {
      to: session.user?.email ?? adminEmail,
      cc: [...BATCH_SEND_CC],
      bcc,
      subject,
      body: messageBody,
    });

    const sentAt = Date.now();
    await appendBatchSend({
      batchId,
      subject,
      sentAt,
      recipientCount: bcc.length,
      skippedCount,
    });

    return NextResponse.json({ ok: true, recipientCount: bcc.length, skippedCount, sentAt });
  } catch {
    return NextResponse.json({ error: "Failed to send batch" }, { status: 502 });
  }
}
