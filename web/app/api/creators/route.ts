import { NextRequest, NextResponse } from "next/server";
import { desc, ilike, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const sort = searchParams.get("sort") || "confirmed_beliefs";
    const search = searchParams.get("search")?.trim();

    const db = getDb();
    const { creator_profiles } = schema;
    const where = search
      ? or(ilike(creator_profiles.handle, `%${search}%`), ilike(creator_profiles.wallet_address, `%${search}%`))
      : undefined;
    const orderBy = sort === "accuracy"
      ? desc(creator_profiles.correct_count)
      : sort === "resolved"
        ? desc(creator_profiles.resolved_count)
        : desc(creator_profiles.confirmed_beliefs_count);

    const [profiles, count] = await Promise.all([
      db.query.creator_profiles.findMany({
        where,
        orderBy,
        limit,
        offset,
        extras: {
          total_beliefs_count: sql<number>`(
            select count(*)::int from beliefs b
            where lower(b.author) in (lower(${creator_profiles.handle}), lower(ltrim(${creator_profiles.handle}, '@')), lower(${creator_profiles.wallet_address}))
          )`.as("total_beliefs_count"),
        },
      }),
      db.$count(creator_profiles, where),
    ]);

    const formattedProfiles = profiles.map((profile) => {
      const resolved = Number(profile.resolved_count ?? 0);
      const correct = Number(profile.correct_count ?? 0);
      const accuracy = resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : 0;

      return {
        ...profile,
        accuracy_percentage: accuracy,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedProfiles,
      creators: formattedProfiles,
      total: count ?? formattedProfiles.length,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
