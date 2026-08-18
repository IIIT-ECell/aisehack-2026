"use client";

import { useState } from "react";
import { mailOpsApi } from "@/lib/mail-ops/api";
import type { Track } from "@/lib/kaggle-ops/config";
import type { ContenderDossier } from "@/lib/kaggle-ops/types";
import { Empty, Panel } from "./Bits";

interface LookupResult {
  teamName: string;
  matches: { memberName: string; email: string; teammates: string[] }[];
  submission: { kaggleNotebook: string; hasCode: boolean } | null;
}

/**
 * Bridges Kaggle team names (from a live leaderboard) to registered
 * students' emails. Kaggle exposes no team-member list and the registration
 * form never collected each team's Kaggle name, so this can only match a
 * Kaggle name that happens to equal a registered person's real name --
 * everything else is reported as unmatched rather than guessed, so this
 * never risks emailing the wrong student.
 */
export function TeamEmailLookup({ contenders, track }: { contenders: ContenderDossier[]; track: Track }) {
  const [count, setCount] = useState(Math.min(20, contenders.length || 20));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [copied, setCopied] = useState(false);

  async function runLookup() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const teamNames = contenders.slice(0, count).map((c) => c.displayName);
      const res = await fetch(mailOpsApi("/api/mail-ops/teams"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamNames, track }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults(null);
        return;
      }
      setResults(data.results ?? []);
    } catch {
      setError("Could not reach the team lookup.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  const matchedEmails = results
    ? [...new Set(results.flatMap((r) => r.matches.map((m) => m.email)).filter(Boolean))]
    : [];
  const unmatched = results?.filter((r) => r.matches.length === 0) ?? [];

  async function copyEmails() {
    await navigator.clipboard.writeText(matchedEmails.join(", "));
    setCopied(true);
  }

  return (
    <Panel
      title="Find registrant emails"
      subtitle="Matches Kaggle team names against registration data by exact name -- only works when a team's Kaggle name equals a registered person's real name. Anything unmatched needs manual outreach; nothing here is guessed."
    >
      {contenders.length === 0 ? (
        <Empty>No contenders on this track yet.</Empty>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="text-[11px] text-muted-foreground">
              Top
              <input
                type="number"
                min={1}
                max={contenders.length}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(contenders.length, Number(e.target.value) || 1)))}
                className="mx-1.5 w-14 rounded border border-input bg-muted px-1.5 py-0.5 text-center text-foreground"
              />
              of {contenders.length}
            </label>
            <button
              onClick={runLookup}
              disabled={loading}
              className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary disabled:opacity-50"
            >
              {loading ? "Looking up…" : "Find registrant emails"}
            </button>
            {matchedEmails.length > 0 && (
              <button
                onClick={copyEmails}
                className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary"
              >
                {copied ? "Copied!" : `Copy ${matchedEmails.length} matched email${matchedEmails.length === 1 ? "" : "s"}`}
              </button>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {results && (
            <div className="space-y-3">
              <ul className="space-y-1.5">
                {results
                  .filter((r) => r.matches.length > 0)
                  .map((r) => (
                    <li key={r.teamName} className="text-[11px]">
                      <span className="font-medium text-foreground">{r.teamName}</span>
                      {r.matches.length > 1 && (
                        <span className="ml-1.5 text-amber-400">
                          {r.matches.length} possible matches — confirm before emailing
                        </span>
                      )}
                      <ul className="ml-3 mt-0.5 space-y-0.5">
                        {r.matches.map((m) => (
                          <li key={m.email} className="text-muted-foreground">
                            {m.memberName} — {m.email}
                            {m.teammates.length > 0 && ` (with ${m.teammates.join(", ")})`}
                          </li>
                        ))}
                      </ul>
                      {r.submission?.kaggleNotebook && (
                        <p className="ml-3 text-[10px] text-sky-300">
                          Round 1 notebook already on file: {r.submission.kaggleNotebook}
                        </p>
                      )}
                    </li>
                  ))}
              </ul>

              {unmatched.length > 0 && (
                <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2">
                  <p className="mb-1 text-[11px] text-amber-300">
                    No registrant match — these need manual outreach (e.g. via the team-formation
                    WhatsApp group or a general announcement):
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {unmatched.map((r) => r.teamName).join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
