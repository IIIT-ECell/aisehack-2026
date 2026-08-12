"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  email: string;
  kaggleId: string;
}

interface Team {
  id: string;
  track: "sar" | "polymer" | "unknown";
  trackRaw: string;
  soloOrTeam: string;
  willingToTravel: string;
  place: string;
  contactNumber: string;
  linkedin: string;
  members: TeamMember[];
}

const TRACK_LABEL: Record<string, string> = {
  sar: "SAR Crop Mapping",
  polymer: "Polymer Property Prediction",
  unknown: "Unknown track",
};

export function TeamsView() {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<"" | "sar" | "polymer">("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async (q: string, t: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (t) params.set("track", t);
      const res = await fetch(`/api/mail-ops/teams?${params.toString()}`);
      const data = await res.json();
      setTeams(data.teams ?? []);
      setTotal(data.total ?? 0);
      setError(data.error ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeams("", "");
  }, [fetchTeams]);

  useEffect(() => {
    const t = setTimeout(() => fetchTeams(query, track), 250);
    return () => clearTimeout(t);
  }, [query, track, fetchTeams]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or city…"
          className="w-64 rounded-lg border border-input bg-muted px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none"
        />
        <div className="flex gap-1">
          {(["", "sar", "polymer"] as const).map((t) => (
            <button
              key={t || "all"}
              onClick={() => setTrack(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                track === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "" ? "All tracks" : TRACK_LABEL[t]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {loading ? "Searching…" : `${teams.length} of ${total} teams`}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {error && teams.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">{error}</p>
        )}
        {!error && teams.length === 0 && !loading && (
          <p className="p-6 text-sm text-muted-foreground">No teams match this search.</p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-lg border border-border bg-muted p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-primary">{TRACK_LABEL[team.track]}</span>
                <span className="text-[11px] text-muted-foreground">
                  {team.soloOrTeam?.includes("Solo") ? "Solo" : `${team.members.length} members`}
                </span>
              </div>
              <ul className="space-y-1">
                {team.members.map((m, i) => (
                  <li key={i} className="text-sm text-foreground">
                    <span className="font-medium">{m.name || "(no name)"}</span>
                    {m.email && <span className="ml-1 text-xs text-muted-foreground">{m.email}</span>}
                  </li>
                ))}
              </ul>
              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                {team.place && <p>{team.place}</p>}
                {team.contactNumber && <p>{team.contactNumber}</p>}
                <p>Goa travel: {team.willingToTravel || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
