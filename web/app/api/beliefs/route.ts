import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { DbBeliefStatus } from "@/types/database";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;

    const statusParam = searchParams.get("status")?.toUpperCase();
    const authorParam = searchParams.get("author")?.trim();
    const sortParam = searchParams.get("sort")?.toLowerCase() || "newest";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    let query = supabase
      .from("beliefs")
      .select("*, belief_sources(*), markets(*)", { count: "exact" });

    if (statusParam && statusParam !== "ALL") {
      query = query.eq("status", statusParam as DbBeliefStatus);
    }

    if (authorParam) {
      query = query.ilike("author", `%${authorParam}%`);
    }

    if (sortParam === "highest_confidence") {
      query = query.order("ai_confidence", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: beliefs, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: beliefs ? beliefs.length : 0,
      total: count || 0,
      beliefs: beliefs || [],
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
