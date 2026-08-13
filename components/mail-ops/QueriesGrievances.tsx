"use client";

import { useEffect, useState, useCallback } from "react";
import { MailList, type MailRowData } from "./MailList";
import { ThreadView, type ThreadMessage } from "./ThreadView";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { mailOpsApi } from "@/lib/mail-ops/api";

interface SenderTeam {
  track: "sar" | "polymer" | "unknown";
  soloOrTeam: string;
  contactNumber: string;
  place: string;
  members: { name: string; email: string; kaggleId: string }[];
}

const TRACK_LABEL: Record<string, string> = {
  sar: "SAR Crop Mapping",
  polymer: "Polymer Property Prediction",
  unknown: "Unknown track",
};

export function QueriesGrievances() {
  const [items, setItems] = useState<MailRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<MailRowData | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [onlyAwaitingReply, setOnlyAwaitingReply] = useState(false);
  const [senderTeam, setSenderTeam] = useState<SenderTeam | null | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [lastScan, setLastScan] = useState<{ scanned: number; pagesFetched: number } | null>(null);

  const awaitingCount = items.filter((i) => i.awaitingReply).length;
  const q = search.trim().toLowerCase();
  const visibleItems = items
    .filter((i) => !onlyAwaitingReply || i.awaitingReply)
    .filter(
      (i) =>
        !q ||
        i.fromName.toLowerCase().includes(q) ||
        i.from.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.snippet.toLowerCase().includes(q)
    );

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(mailOpsApi("/api/mail-ops/queries"));
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFeed();
  }, [fetchFeed]);

  async function handleScan() {
    setScanning(true);
    try {
      const res = await fetch(mailOpsApi("/api/mail-ops/queries"), { method: "POST", body: JSON.stringify({}) });
      const data = await res.json();
      setItems(data.items ?? []);
      setLastScan({ scanned: data.scanned ?? 0, pagesFetched: data.pagesFetched ?? 0 });
    } finally {
      setScanning(false);
    }
  }

  async function handleSelect(item: MailRowData) {
    setSelected(item);
    setLoadingThread(true);
    setSenderTeam(undefined);
    try {
      const [threadRes, teamRes] = await Promise.all([
        fetch(mailOpsApi(`/api/mail-ops/threads/${item.threadId}`)),
        item.from ? fetch(mailOpsApi(`/api/mail-ops/teams?q=${encodeURIComponent(item.from)}`)) : null,
      ]);
      const data = await threadRes.json();
      setThreadMessages(data.messages ?? []);
      if (teamRes) {
        const teamData = await teamRes.json();
        setSenderTeam(teamData.teams?.[0] ?? null);
      } else {
        setSenderTeam(null);
      }
    } finally {
      setLoadingThread(false);
    }
  }

  async function handleReplied(item: MailRowData) {
    setItems((prev) => prev.map((i) => (i.threadId === item.threadId ? { ...i, awaitingReply: false } : i)));
    await handleSelect(item);
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="flex min-h-0 w-[420px] shrink-0 flex-col border-r border-border">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-3">
          <div>
            <p className="text-xs text-muted-foreground">General queries &amp; grievances</p>
            <p className="mt-0.5 text-[11px] text-destructive">
              {awaitingCount} awaiting reply
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleScan} isLoading={scanning} disabled={scanning}>
            Scan for new
          </Button>
        </div>
        {lastScan && (
          <p className="shrink-0 border-b border-border px-3 py-1 text-[10px] text-muted-foreground">
            Last scan: checked {lastScan.pagesFetched * 25} messages across {lastScan.pagesFetched} page
            {lastScan.pagesFetched === 1 ? "" : "s"}, categorized {lastScan.scanned} new.
          </p>
        )}
        <div className="shrink-0 border-b border-border p-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full rounded-lg border border-input bg-muted px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setOnlyAwaitingReply((v) => !v)}
          className={cn(
            "shrink-0 border-b border-border px-3 py-1.5 text-left text-[11px] font-medium transition-colors",
            onlyAwaitingReply ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {onlyAwaitingReply ? "Showing: not yet replied only" : "Show: not yet replied only"}
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No categorized queries yet. Click &quot;Scan for new&quot; to pull and categorize the latest mail.
            </p>
          ) : visibleItems.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {q ? "No queries match your search." : "Nothing awaiting reply — you're caught up."}
            </p>
          ) : (
            <MailList
              items={visibleItems}
              selectedThreadId={selected?.threadId}
              onSelect={handleSelect}
              onCategorize={() => {}}
            />
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {selected && senderTeam && (
          <div className="shrink-0 border-b border-border bg-muted/50 px-4 py-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="font-medium text-primary">{TRACK_LABEL[senderTeam.track]}</span>
              <span className="text-muted-foreground">
                {senderTeam.soloOrTeam?.includes("Solo") ? "Solo" : `Team of ${senderTeam.members.length}`}
              </span>
              {senderTeam.contactNumber && (
                <span className="text-muted-foreground">{senderTeam.contactNumber}</span>
              )}
              {senderTeam.place && <span className="text-muted-foreground">{senderTeam.place}</span>}
            </div>
            {senderTeam.members.length > 1 && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                Teammates: {senderTeam.members.map((m) => m.name).filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1">
          {selected ? (
            <ThreadView
              threadId={selected.threadId}
              subject={selected.subject}
              messages={threadMessages}
              loading={loadingThread}
              onSent={() => handleReplied(selected)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a query to view the thread
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
