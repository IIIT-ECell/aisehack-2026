"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { QueriesGrievances } from "./QueriesGrievances";
import { BatchSender } from "./BatchSender";
import { TeamsView } from "./TeamsView";
import { ThemeToggle } from "./ThemeToggle";
import { useMailOpsTheme } from "@/lib/mail-ops/theme";
import { cn } from "@/lib/utils";

type TabId = "queries" | "batch" | "teams";

const TABS: { id: TabId; label: string }[] = [
  { id: "queries", label: "Queries & Grievances" },
  { id: "batch", label: "Batch Sender" },
  { id: "teams", label: "Teams" },
];

export function Dashboard({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<TabId>("queries");
  const [visited, setVisited] = useState<Record<TabId, boolean>>({
    queries: true,
    batch: false,
    teams: false,
  });
  const { theme, toggle } = useMailOpsTheme();

  function activate(t: TabId) {
    setTab(t);
    setVisited((v) => ({ ...v, [t]: true }));
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
      </div>
    </div>
  );
}
