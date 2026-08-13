"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { mailOpsApi } from "@/lib/mail-ops/api";

export interface ThreadMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  bodyText: string;
  messageIdHeader: string;
  references: string;
}

export function ThreadView({
  threadId,
  subject,
  messages,
  loading,
  onSent,
}: {
  threadId: string;
  subject: string;
  messages: ThreadMessage[];
  loading: boolean;
  onSent: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastMessage = messages[messages.length - 1];

  async function handleSend() {
    if (!reply.trim() || !lastMessage) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(mailOpsApi("/api/mail-ops/reply"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          to: lastMessage.from,
          subject,
          message: reply,
          inReplyTo: lastMessage.messageIdHeader,
          references: lastMessage.references,
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setReply("");
      onSent();
    } catch {
      setError("Failed to send reply. Check that the Gmail send scope is granted.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading thread…</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="truncate text-sm font-medium text-foreground">{subject}</h2>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-muted p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{m.from}</span>
              <span className="shrink-0">{m.date}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{m.bodyText}</p>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={lastMessage ? `Reply to ${lastMessage.from}…` : "Reply…"}
          rows={4}
          className="w-full resize-none rounded-lg border border-input bg-muted p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={handleSend} isLoading={sending} disabled={!reply.trim() || sending}>
            Send reply
          </Button>
        </div>
      </div>
    </div>
  );
}
