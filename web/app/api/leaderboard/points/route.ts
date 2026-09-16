import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();
    const { searchParams } = req.nextUrl;

    const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
    const rawOffset = parseInt(searchParams.get("offset") || "0", 10);

    const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 100);
    const offset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;

    const rawWallet = searchParams.get("wallet_address");

    const { data: users, count, error } = await supabase
      .from("users")
      .select("wallet_address, total_points, streak_count", { count: "exact" })
      .order("total_points", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leaderboard = (users || []).map((user, index) => ({
      rank: offset + index + 1,
      wallet_address: user.wallet_address,
      total_points: Number(user.total_points || 0),
      streak_count: user.streak_count || 1,
      streak_days: user.streak_count || 1,
    }));

    let currentUserRank = null;

    if (rawWallet && EVM_ADDRESS_REGEX.test(rawWallet.trim())) {
      const normalizedAddress = rawWallet.trim().toLowerCase();
      const { data: targetUser } = await supabase
        .from("users")
        .select("wallet_address, total_points, streak_count")
        .eq("wallet_address", normalizedAddress)
        .maybeSingle();

      if (targetUser) {
        const { count: higherCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gt("total_points", targetUser.total_points);

        currentUserRank = {
          rank: (higherCount || 0) + 1,
          wallet_address: targetUser.wallet_address,
          total_points: Number(targetUser.total_points || 0),
          totalPoints: Number(targetUser.total_points || 0),
          streak_count: targetUser.streak_count || 1,
          streakDays: targetUser.streak_count || 1,
        };
      }
    }

    return NextResponse.json({
      success: true,
      total_users: count || 0,
      limit,
      offset,
      leaderboard,
      currentUserRank,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
