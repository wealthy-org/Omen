import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { DbBeliefStatus } from "@/types/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const statusParam = searchParams.get("status")?.toUpperCase();
    const authorParam = searchParams.get("author")?.trim();
    const sortParam = searchParams.get("sort")?.toLowerCase() || "newest";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const db = getDb();
    const { beliefs } = schema;
    const where = and(
      statusParam && statusParam !== "ALL" ? eq(beliefs.status, statusParam as DbBeliefStatus) : undefined,
      authorParam ? ilike(beliefs.author, `%${authorParam}%`) : undefined
    );
    const orderBy = sortParam === "highest_confidence"
      ? desc(beliefs.ai_confidence)
      : desc(beliefs.created_at);

    const [beliefList, count] = await Promise.all([
      db.query.beliefs.findMany({
        where,
        orderBy,
        limit,
        offset,
        with: { belief_sources: true, markets: true },
      }),
      db.$count(beliefs, where),
    ]);

    return NextResponse.json({
      success: true,
      count: beliefList.length,
      total: count || 0,
      beliefs: beliefList,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
