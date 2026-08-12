import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getBatch, TRACKS } from "@/lib/mail-ops/batches";
import { validateRecipients } from "@/lib/mail-ops/email-validate";
import { getBatchSendHistory, getLastSendForBatch } from "@/lib/mail-ops/batch-log";

// Full detail for one batch — only fetched when the admin explicitly
// expands "Preview recipients" in the UI.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { id } = await params;
  const batch = getBatch(id);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const { valid, invalid } = validateRecipients(batch.recipients);
  const lastSent = await getLastSendForBatch(batch.id);
  const history = (await getBatchSendHistory())
    .filter((r) => r.batchId === batch.id)
    .sort((a, b) => b.sentAt - a.sentAt);

  return NextResponse.json({
    id: batch.id,
    track: batch.track,
    trackName: TRACKS[batch.track].name,
    label: batch.label,
    valid,
    invalid,
    lastSent: lastSent ?? null,
    history,
  });
}
