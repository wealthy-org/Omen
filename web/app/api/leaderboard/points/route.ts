import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const walletAddress = searchParams.get("wallet_address")?.toLowerCase();

    const supabase = getSupabaseAdminClient();
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("total_points", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const leaderboard = (users || []).map((u, idx) => ({
      rank: offset + idx + 1,
      wallet_address: u.wallet_address,
      total_points: Number(u.total_points || 0),
      streak_days: u.streak_count || 1,
    }));

    let currentUserRank = null;
    if (walletAddress) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (userRecord) {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gt("total_points", userRecord.total_points || 0);

        currentUserRank = {
          rank: (count || 0) + 1,
          wallet_address: userRecord.wallet_address,
          totalPoints: Number(userRecord.total_points || 0),
          streakDays: userRecord.streak_count || 1,
        };
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
