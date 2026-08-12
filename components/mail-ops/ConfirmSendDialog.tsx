"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { BatchSendRecord } from "@/lib/mail-ops/batch-log";

export function ConfirmSendDialog({
  batchLabel,
  trackName,
  recipientCount,
  subject,
  sampleRecipients,
  lastSent,
  sending,
  error,
  onConfirm,
  onCancel,
}: {
  batchLabel: string;
  trackName: string;
  recipientCount: number;
  subject: string;
  sampleRecipients: string[];
  lastSent: BatchSendRecord | null;
  sending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const requiredText = `SEND ${recipientCount}`;
  const confirmed = typed.trim() === requiredText;
  const shown = sampleRecipients.slice(0, 8);
  const more = recipientCount - shown.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 text-foreground shadow-xl">
        <h2 className="text-sm font-semibold">Confirm batch send</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {trackName} — {batchLabel}
        </p>

        <div className="mt-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          This will send a real, irreversible email to <strong>{recipientCount}</strong> recipients. This
          cannot be undone once sent.
        </div>

        {lastSent && (
          <div className="mt-3 rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
            Already sent on {new Date(lastSent.sentAt).toLocaleString()} to {lastSent.recipientCount}{" "}
            recipients. Sending again will re-blast this batch.
          </div>
        )}

        <div className="mt-3 text-xs">
          <p className="text-muted-foreground">Subject</p>
          <p className="mt-0.5 truncate text-foreground">{subject || "(empty)"}</p>
        </div>

        <div className="mt-3 text-xs">
          <p className="text-muted-foreground">Sample recipients</p>
          <p className="mt-0.5 break-words text-foreground">
            {shown.join(", ")}
            {more > 0 && <span className="text-muted-foreground"> …and {more} more</span>}
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs text-muted-foreground">
            Type <span className="font-mono text-foreground">{requiredText}</span> to confirm
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requiredText}
            className="mt-1 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
          />
        </div>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={sending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={!confirmed || sending}
            isLoading={sending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Send to {recipientCount} recipients
          </Button>
        </div>
      </div>
    </div>
  );
}
