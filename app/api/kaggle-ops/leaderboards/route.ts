import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/mail-ops/guard";
import { loadBoards } from "@/lib/kaggle-ops/boards";

// Raw-ish view of the fetched boards. Exists mainly as a verification
// affordance: kaggle.com is unreachable from the environment this was written
// in, so this endpoint lets the operator confirm on their own machine that the
// field-name and envelope guesses in client.ts actually matched.

export async function GET(req: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "1";

  try {
    const boards = await loadBoards({ refresh });

    return NextResponse.json({
      boards: boards.map((board) => ({
        slug: board.slug,
        label: board.label,
        status: board.status,
        reason: board.reason,
        message: board.message,
        fetchedAt: board.fetchedAt,
        rowCount: board.rowCount,
        scoredCount: board.scoredCount,
        possiblyTruncated: board.possiblyTruncated,
        scoreHigherIsBetter: board.scoreHigherIsBetter,
        directionSource: board.directionSource,
        directionConflict: board.directionConflict,
        coverage: board.coverage,
        sampleRows: board.rows.slice(0, 5),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch Kaggle leaderboards" }, { status: 502 });
  }
}
