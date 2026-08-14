"use client";

import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import { QueriesGrievances } from "./QueriesGrievances";
import { BatchSender } from "./BatchSender";
import { TeamsView } from "./TeamsView";
import { ThemeToggle } from "./ThemeToggle";
import { KaggleTab } from "@/components/kaggle-ops/KaggleTab";
import { useMailOpsTheme } from "@/lib/mail-ops/theme";
import { mailOpsApi } from "@/lib/mail-ops/api";
import { cn } from "@/lib/utils";
import type { KaggleAnalysis } from "@/lib/kaggle-ops/types";

type TabId = "queries" | "batch" | "teams" | "kaggle";

const TABS: { id: TabId; label: string }[] = [
  { id: "queries", label: "Queries & Grievances" },
  { id: "batch", label: "Batch Sender" },
  { id: "teams", label: "Teams" },
  { id: "kaggle", label: "Kaggle" },
];

export function Dashboard({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<TabId>("queries");
  const [visited, setVisited] = useState<Record<TabId, boolean>>({
    queries: true,
    batch: false,
    teams: false,
    kaggle: false,
  });
  const { theme, toggle } = useMailOpsTheme();

  const [analysis, setAnalysis] = useState<KaggleAnalysis | null>(null);
  const [loadingKaggle, setLoadingKaggle] = useState(false);
  const [kaggleError, setKaggleError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (refresh = false) => {
    setLoadingKaggle(true);
    setKaggleError(null);
    try {
      const res = await fetch(mailOpsApi(`/api/kaggle-ops/analysis${refresh ? "?refresh=1" : ""}`));
      if (!res.ok) {
        setKaggleError("Could not reach the Kaggle API for any competition.");
        return;
      }
      setAnalysis(await res.json());
    } catch {
      setKaggleError("Could not load the Kaggle analysis.");
    } finally {
      setLoadingKaggle(false);
    }
  }, []);

  function activate(t: TabId) {
    setTab(t);
    setVisited((v) => ({ ...v, [t]: true }));
    // Four leaderboard fetches are expensive, so they wait for the first
    // visit to this tab rather than firing on dashboard load.
    if (t === "kaggle" && !analysis && !loadingKaggle) fetchAnalysis();
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">AISEHack mail-ops</h1>
          <p className="text-xs text-muted-foreground">Signed in as {adminEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={toggle} />
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="flex shrink-0 gap-1 border-b border-border px-4 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => activate(t.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className={cn("h-full min-h-0", tab !== "queries" && "hidden")}>
          <QueriesGrievances />
        </div>
        {visited.batch && (
          <div className={cn("h-full min-h-0", tab !== "batch" && "hidden")}>
            <BatchSender />
          </div>
        )}
        {visited.teams && (
          <div className={cn("h-full min-h-0", tab !== "teams" && "hidden")}>
            <TeamsView />
          </div>
        )}
        {visited.kaggle && (
          <div className={cn("flex h-full min-h-0 flex-col", tab !== "kaggle" && "hidden")}>
            <KaggleTab
              analysis={analysis}
              loading={loadingKaggle}
              error={kaggleError}
              onRefresh={() => fetchAnalysis(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
