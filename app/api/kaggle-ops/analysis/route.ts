import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { loadBoards } from "@/lib/kaggle-ops/boards";
import { buildAnalysis } from "@/lib/kaggle-ops/analysis";

export async function GET(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "1";

  try {
    const boards = await loadBoards({ refresh });

    // Only a total failure is an error. A single competition being unreachable
    // (the invite-only Round 2 boards are the likely case) is reported inside
    // the payload so the rest of the dashboard still renders.
    if (boards.every((board) => board.status === "unavailable")) {
      return NextResponse.json(
        {
          error: "Failed to fetch any Kaggle leaderboard",
          boards: boards.map((board) => ({
            slug: board.slug,
            label: board.label,
            reason: board.reason,
            message: board.message,
          })),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(buildAnalysis(boards));
  } catch {
    return NextResponse.json({ error: "Failed to build Kaggle analysis" }, { status: 502 });
  }
}
