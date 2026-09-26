import { NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const [liveMarkets, totalBeliefsCount, verifiedCreatorsCount, activeWalletsCount] = await Promise.all([
      db.query.markets.findMany({
        columns: { status: true, agree_pool: true, disagree_pool: true },
      }),
      db.$count(schema.beliefs),
      db.$count(schema.creator_profiles),
      db.$count(schema.users),
    ]);

    const activeMarketsCount = liveMarkets.filter((m) => m.status === "active" || m.status === "OPEN").length;
    const totalTvl = liveMarkets.reduce((sum, m) => {
      const agree = Number(m.agree_pool ?? 0);
      const disagree = Number(m.disagree_pool ?? 0);
      return sum + (agree + disagree);
    }, 0);

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
