import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { getTeamsData, searchTeams } from "@/lib/mail-ops/teams";

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
