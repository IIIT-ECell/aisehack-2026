import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { BATCHES, TRACKS } from "@/lib/mail-ops/batches";
import { validateRecipients } from "@/lib/mail-ops/email-validate";
import { getLastSendForBatch } from "@/lib/mail-ops/batch-log";

// Summary list for the batch picker. Deliberately never includes the raw
// recipient addresses — only counts and the last-send record.
export async function GET() {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const batches = await Promise.all(
    BATCHES.map(async (batch) => {
      const { valid, invalid } = validateRecipients(batch.recipients);
      const lastSent = await getLastSendForBatch(batch.id);
      return {
        id: batch.id,
        track: batch.track,
        trackName: TRACKS[batch.track].name,
        label: batch.label,
        totalRecipients: batch.recipients.length,
        validCount: valid.length,
        invalidCount: invalid.length,
        lastSent: lastSent ?? null,
      };
    })
  );

  return NextResponse.json({ batches });
}
