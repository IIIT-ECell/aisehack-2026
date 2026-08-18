import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { findSubmissionByTeamName, findTeamsByMemberName, getTeamsData, searchTeams } from "@/lib/mail-ops/teams";

export async function GET(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const track = searchParams.get("track") ?? undefined;

  const data = await getTeamsData();
  if (!data) {
    return NextResponse.json({
      teams: [],
      total: 0,
      submissions: [],
      importedAt: null,
      error: "No team data imported yet. Run scripts/import-teams.py against the registration form export.",
    });
  }

  const teams = await searchTeams(q, track);

  return NextResponse.json({
    teams,
    total: data.teams.length,
    submissions: data.submissions,
    importedAt: data.generatedAt,
  });
}

// Batch-resolves a list of Kaggle team names (as shown on a leaderboard) to
// registered members. Kaggle team names aren't collected at registration, so
// this can only match a name that happens to equal a registered person's
// real name -- everything else comes back unmatched rather than guessed, so
// a wrong match never sends an email to the wrong student.
export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const body = await req.json().catch(() => ({}));
  const teamNames: string[] = Array.isArray(body?.teamNames)
    ? body.teamNames.filter((n: unknown): n is string => typeof n === "string" && n.trim().length > 0)
    : [];
  const track: string | undefined = typeof body?.track === "string" ? body.track : undefined;

  const data = await getTeamsData();
  if (!data) {
    return NextResponse.json({
      results: [],
      error: "No team data imported yet. Run scripts/import-teams.py against the registration form export.",
    });
  }

  const results = await Promise.all(
    teamNames.map(async (teamName) => {
      const matches = await findTeamsByMemberName(teamName);
      const submission = await findSubmissionByTeamName(teamName, track);
      return {
        teamName,
        matches: matches.map(({ team, member }) => ({
          memberName: member.name,
          email: member.email,
          teammates: team.members.filter((m) => m.email !== member.email).map((m) => m.name).filter(Boolean),
        })),
        submission: submission
          ? { kaggleNotebook: submission.kaggleNotebook, hasCode: Boolean(submission.code) }
          : null,
      };
    })
  );

  return NextResponse.json({ results });
}
