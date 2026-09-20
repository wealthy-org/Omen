import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const [marketsRes, beliefsRes, creatorsRes, usersRes] = await Promise.all([
      supabase.from("markets").select("*"),
      supabase.from("beliefs").select("id", { count: "exact", head: true }),
      supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    if (marketsRes.error) {
      return NextResponse.json({ success: false, error: marketsRes.error.message }, { status: 500 });
    }

    const liveMarkets = marketsRes.data ?? [];
    const activeMarketsCount = liveMarkets.filter((m) => m.status === "active" || m.status === "OPEN").length;
    const totalTvl = liveMarkets.reduce((sum, m) => {
      const agree = Number(m.agree_pool ?? 0);
      const disagree = Number(m.disagree_pool ?? 0);
      return sum + (agree + disagree);
    }, 0);

    const totalBeliefsCount = beliefsRes.count ?? liveMarkets.length;
    const verifiedCreatorsCount = creatorsRes.count ?? 0;
    const activeWalletsCount = usersRes.count ?? 0;

    return NextResponse.json({
      success: true,
      stats: {
        total_tvl_eth: totalTvl.toFixed(2),
        total_volume_eth: totalTvl.toFixed(2),
        active_markets: activeMarketsCount,
        total_beliefs: totalBeliefsCount,
        verified_creators: verifiedCreatorsCount,
        active_wallets: activeWalletsCount,
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
