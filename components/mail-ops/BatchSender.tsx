"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ConfirmSendDialog } from "./ConfirmSendDialog";
import { BATCH_SEND_CC } from "@/lib/mail-ops/config";
import { mailOpsApi } from "@/lib/mail-ops/api";
import type { BatchSendRecord } from "@/lib/mail-ops/batch-log";
import type { InvalidRecipient } from "@/lib/mail-ops/email-validate";
import type { Track } from "@/lib/mail-ops/batches";

interface BatchSummary {
  id: string;
  track: Track;
  trackName: string;
  label: string;
  totalRecipients: number;
  validCount: number;
  invalidCount: number;
  lastSent: BatchSendRecord | null;
}

interface BatchDetail extends BatchSummary {
  valid: string[];
  invalid: InvalidRecipient[];
  history: BatchSendRecord[];
}

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function BatchSender({ onSent }: { onSent?: () => void }) {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BatchDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(mailOpsApi("/api/mail-ops/batches"));
      const data = await res.json();
      setBatches(data.batches ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBatches();
  }, []);

  const selected = batches.find((b) => b.id === selectedId) ?? null;

  function selectBatch(batch: BatchSummary) {
    setSelectedId(batch.id);
    setPreviewOpen(false);
    setPreviewData(null);
    setSuccessBanner(null);
    setSendError(null);
    setSubject(`AISEHack 2026 — Update for ${batch.trackName} participants`);
    setBody(
      `Hi everyone,\n\nThis is an update regarding the ${batch.trackName} track of AISEHack 2026.\n\n[Write your message here]\n\nBest,\nAISEHack 2026 Organizing Team`
    );
  }

  async function togglePreview() {
    if (!selected) return;
    if (previewOpen) {
      setPreviewOpen(false);
      return;
    }
    setPreviewOpen(true);
    if (!previewData || previewData.id !== selected.id) {
      setPreviewLoading(true);
      try {
        const res = await fetch(mailOpsApi(`/api/mail-ops/batches/${selected.id}`));
        setPreviewData(await res.json());
      } finally {
        setPreviewLoading(false);
      }
    }
  }

  async function handleConfirmSend() {
    if (!selected) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(mailOpsApi("/api/mail-ops/batch-send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selected.id, subject, body, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setConfirmOpen(false);
      setSuccessBanner(
        `Sent to ${data.recipientCount} recipients${data.skippedCount ? ` (${data.skippedCount} skipped)` : ""}.`
      );
      setPreviewData(null);
      fetchBatches();
      onSent?.();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send batch");
    } finally {
      setSending(false);
    }
  }

  const bySar = batches.filter((b) => b.track === "sar");
  const byPolymer = batches.filter((b) => b.track === "polymer");

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="flex min-h-0 w-[380px] shrink-0 flex-col overflow-y-auto border-r border-border">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading batches…</p>
        ) : (
          <>
            <BatchGroup title="SAR Crop Mapping" batches={bySar} selectedId={selectedId} onSelect={selectBatch} />
            <BatchGroup
              title="Polymer Property Prediction"
              batches={byPolymer}
              selectedId={selectedId}
              onSelect={selectBatch}
            />
          </>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a batch to compose a send
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {selected.trackName} — {selected.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selected.validCount} valid recipients
                {selected.invalidCount > 0 && `, ${selected.invalidCount} malformed (auto-skipped)`}
                {selected.lastSent
                  ? ` — last sent ${relativeTime(selected.lastSent.sentAt)}, ${selected.lastSent.recipientCount} recipients`
                  : " — never sent"}
              </p>
            </div>

            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Cc (fixed, applied to every send)</p>
              <div className="flex flex-wrap gap-1.5">
                {BATCH_SEND_CC.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="mt-1 w-full resize-none rounded-lg border border-input bg-muted p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
              />
            </div>

            <div>
              <button
                onClick={togglePreview}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {previewOpen ? "Hide recipient preview" : "Preview recipients"}
              </button>
              {previewOpen && (
                <div className="mt-2 rounded-lg border border-border bg-muted p-3 text-xs">
                  {previewLoading || !previewData ? (
                    <p className="text-muted-foreground">Loading…</p>
                  ) : (
                    <>
                      <p className="mb-1 text-muted-foreground">{previewData.valid.length} valid addresses</p>
                      <p className="max-h-40 overflow-y-auto break-words text-foreground">
                        {previewData.valid.join(", ")}
                      </p>
                      {previewData.invalid.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-destructive">
                            {previewData.invalid.length} addresses skipped as malformed
                          </summary>
                          <ul className="mt-1 space-y-0.5 text-muted-foreground">
                            {previewData.invalid.map((inv) => (
                              <li key={inv.email}>
                                {inv.email} — {inv.reason}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {successBanner && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                {successBanner}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={!subject.trim() || !body.trim() || selected.validCount === 0}
              >
                Send batch
              </Button>
            </div>
          </div>
        )}
      </div>

      {confirmOpen && selected && (
        <ConfirmSendDialog
          batchLabel={selected.label}
          trackName={selected.trackName}
          recipientCount={selected.validCount}
          subject={subject}
          sampleRecipients={previewData?.valid ?? []}
          lastSent={selected.lastSent}
          sending={sending}
          error={sendError}
          onConfirm={handleConfirmSend}
          onCancel={() => {
            setConfirmOpen(false);
            setSendError(null);
          }}
        />
      )}
    </div>
  );
}

function BatchGroup({
  title,
  batches,
  selectedId,
  onSelect,
}: {
  title: string;
  batches: BatchSummary[];
  selectedId: string | null;
  onSelect: (b: BatchSummary) => void;
}) {
  return (
    <div className="border-b border-border">
      <h3 className="px-4 pt-3 text-xs font-medium text-muted-foreground">{title}</h3>
      <ul className="pb-2">
        {batches.map((b) => (
          <li key={b.id}>
            <button
              onClick={() => onSelect(b)}
              className={cn(
                "w-full px-4 py-2 text-left transition-colors hover:bg-accent",
                selectedId === b.id && "bg-accent"
              )}
            >
              <p className="text-sm text-foreground">{b.label}</p>
              <p className="text-[11px] text-muted-foreground">
                {b.validCount} recipients{b.lastSent ? ` · sent ${relativeTime(b.lastSent.sentAt)}` : " · never sent"}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
