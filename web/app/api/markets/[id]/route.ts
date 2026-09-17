import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Market ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data: market, error } = await supabase
      .from("markets")
      .select("*, beliefs(*, belief_sources(*), creator_confirmations(*)), oracle_snapshots(*), market_resolutions(*), market_positions(*)")
      .or(`id.eq.${id},contract_address.eq.${id}`)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!market) {
      return NextResponse.json(
        { success: false, error: `Market with identifier ${id} not found` },
        { status: 404 }
      );
    }

    const agreePool = Number(market.agree_pool ?? market.total_pool_yes ?? market.yes_pool ?? 0);
    const disagreePool = Number(market.disagree_pool ?? market.total_pool_no ?? market.no_pool ?? 0);
    const totalPool = agreePool + disagreePool;
    const capitalConsensus = totalPool > 0 ? (agreePool / totalPool) * 100 : 50;

    const formattedMarket = {
      ...market,
      agree_pool: agreePool,
      disagree_pool: disagreePool,
      total_pool_yes: agreePool,
      total_pool_no: disagreePool,
      total_pool: totalPool,
      capital_consensus: Math.round(capitalConsensus * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      market: formattedMarket,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
