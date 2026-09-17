import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const [marketsRes, usersRes] = await Promise.all([
      supabase.from("markets").select("*"),
      supabase.from("users").select("total_points"),
    ]);

    if (marketsRes.error) {
      return NextResponse.json({ success: false, error: marketsRes.error.message }, { status: 500 });
    }

    if (usersRes.error) {
      return NextResponse.json({ success: false, error: usersRes.error.message }, { status: 500 });
    }

    const liveMarkets = marketsRes.data || [];
    const activeMarketsCount = liveMarkets.filter((m) => m.status === "active" || m.status === "OPEN").length;
    const totalTvl = liveMarkets.reduce(
      (sum, m) => sum + (Number(m.total_pool_yes || m.agree_pool || m.yes_pool || 0) + Number(m.total_pool_no || m.disagree_pool || m.no_pool || 0)),
      0
    );

    const usersData = usersRes.data || [];
    const activeWalletsCount = usersData.length;
    const totalPoints = usersData.reduce(
      (sum, u) => sum + Number(u.total_points || 0),
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        total_tvl_eth: totalTvl.toFixed(2),
        active_markets: activeMarketsCount,
        total_points: totalPoints,
        active_wallets: activeWalletsCount,
      },
    });
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
