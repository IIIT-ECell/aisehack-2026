"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { MailList, type MailRowData } from "./MailList";
import { ThreadView, type ThreadMessage } from "./ThreadView";
import { StatsPanel, type Stats } from "./StatsPanel";
import { mailOpsConfig } from "@/lib/mail-ops/config";
import type { MailCategory } from "@/lib/mail-ops/config";

export function Dashboard({ adminEmail }: { adminEmail: string }) {
  const [query, setQuery] = useState(mailOpsConfig.defaultQuery);
  const [items, setItems] = useState<MailRowData[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<MailRowData | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showStats, setShowStats] = useState(true);

  const fetchList = useCallback(async (q: string) => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/mail-ops/threads?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/mail-ops/stats");
    setStats(await res.json());
  }, []);

  useEffect(() => {
    // Initial load only; fetchList/fetchStats are re-invoked explicitly by
    // user actions afterwards (search submit, categorize), not by deps.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchList(query);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(item: MailRowData) {
    setSelected(item);
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/mail-ops/threads/${item.threadId}`);
      const data = await res.json();
      setThreadMessages(data.messages ?? []);
    } finally {
      setLoadingThread(false);
    }
  }

  async function handleCategorize(item: MailRowData) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, categorizing: true } : i)));
    try {
      const res = await fetch("/api/mail-ops/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: item.id, subject: item.subject, snippet: item.snippet }),
      });
      const data: { category: MailCategory } = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, category: data.category, categorizing: false } : i))
      );
      fetchStats();
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, categorizing: false } : i)));
    }
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">AISEHack mail-ops</h1>
          <p className="text-xs text-zinc-500">Signed in as {adminEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => setShowStats((s) => !s)}
          >
            {showStats ? "Hide stats" : "Show stats"}
          </button>
          <button className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {showStats && (
        <div className="border-b border-white/10 px-4 py-4">
          <StatsPanel stats={stats} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-[420px] shrink-0 flex-col border-r border-white/10">
          <form
            className="border-b border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              fetchList(query);
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mail (Gmail search syntax)"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none"
            />
          </form>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <p className="p-6 text-sm text-zinc-500">Loading mail…</p>
            ) : (
              <MailList
                items={items}
                selectedThreadId={selected?.threadId}
                onSelect={handleSelect}
                onCategorize={handleCategorize}
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          {selected ? (
            <ThreadView
              threadId={selected.threadId}
              subject={selected.subject}
              messages={threadMessages}
              loading={loadingThread}
              onSent={() => handleSelect(selected)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
              Select a message to view the thread
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
