import { promises as fs } from "fs";
import path from "path";

// Registration-form data imported (one-time, manually) from the Google
// Form responses export via scripts/import-teams.py. Real students' names,
// phone numbers, and emails — SERVER-ONLY, never import from a "use client"
// component. The backing JSON lives in .mail-ops-cache/ (gitignored).

export interface TeamMember {
  name: string;
  email: string;
  kaggleId: string;
}

export interface Team {
  id: string;
  timestamp: string;
  track: "sar" | "polymer" | "unknown";
  trackRaw: string;
  soloOrTeam: string;
  willingToTravel: string;
  place: string;
  contactNumber: string;
  linkedin: string;
  twitter: string;
  members: TeamMember[];
}

export interface Submission {
  teamName: string;
  track: string;
  kaggleNotebook: string;
  code: string;
  rank: number | null;
}

interface TeamsFile {
  generatedAt: string;
  sourceFile: string;
  teams: Team[];
  emailIndex: Record<string, string>;
  submissions: Submission[];
}

const TEAMS_FILE = path.join(process.cwd(), ".mail-ops-cache", "teams.json");

let cached: TeamsFile | null = null;

async function readTeamsFile(): Promise<TeamsFile | null> {
  if (cached) return cached;
  try {
    const raw = await fs.readFile(TEAMS_FILE, "utf-8");
    cached = JSON.parse(raw);
    return cached;
  } catch {
    return null;
  }
}

export async function getTeamsData(): Promise<TeamsFile | null> {
  return readTeamsFile();
}

export async function findTeamByEmail(email: string): Promise<Team | undefined> {
  const data = await readTeamsFile();
  if (!data) return undefined;
  const teamId = data.emailIndex[email.trim().toLowerCase()];
  if (!teamId) return undefined;
  return data.teams.find((t) => t.id === teamId);
}

export async function searchTeams(query: string, track?: string): Promise<Team[]> {
  const data = await readTeamsFile();
  if (!data) return [];
  const q = query.trim().toLowerCase();

  return data.teams.filter((t) => {
    if (track && t.track !== track) return false;
    if (!q) return true;
    if (t.place?.toLowerCase().includes(q)) return true;
    return t.members.some(
      (m) => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  });
}
