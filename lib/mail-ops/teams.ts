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

/**
 * Registration data has each member's real name, not the Kaggle team name
 * they compete under — so this can only match teams whose Kaggle name
 * happens to equal a registered person's name (e.g. a solo entrant). Never
 * fuzzy-matches: a wrong guess here means emailing the wrong student.
 */
export async function findTeamsByMemberName(name: string): Promise<{ team: Team; member: TeamMember }[]> {
  const data = await readTeamsFile();
  if (!data) return [];
  const target = name.trim().toLowerCase();
  if (!target) return [];

  const out: { team: Team; member: TeamMember }[] = [];
  for (const team of data.teams) {
    for (const member of team.members) {
      if (member.name?.trim().toLowerCase() === target) out.push({ team, member });
    }
  }
  return out;
}

/** Round 1's submission sheet records the Kaggle team name directly, so an exact match there is a second, independent way to identify a team. */
export async function findSubmissionByTeamName(teamName: string, track?: string): Promise<Submission | undefined> {
  const data = await readTeamsFile();
  if (!data) return undefined;
  const target = teamName.trim().toLowerCase();
  return data.submissions.find(
    (s) => s.teamName?.trim().toLowerCase() === target && (!track || s.track === track)
  );
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
