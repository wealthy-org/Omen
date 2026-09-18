import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { MarketRecord } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (typeof id !== "string" || id.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Market ID parameter is required" },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();
    const supabase = getSupabaseAdminClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedId);
    let query = supabase
      .from("markets")
      .select("*, beliefs(*, belief_sources(*), creator_confirmations(*)), oracle_snapshots(*), market_resolutions(*), market_positions(*)");

    if (typeof query.or === "function") {
      if (isUuid) {
        query = query.or(`id.eq.${trimmedId},contract_address.eq.${trimmedId}`);
      } else if (trimmedId.startsWith("0x")) {
        query = query.or(`contract_address.eq.${trimmedId}`);
      } else {
        query = query.or(`contract_market_id.eq.${trimmedId},contract_address.eq.${trimmedId}`);
      }
    } else if (typeof query.eq === "function") {
      if (isUuid) {
        query = query.eq("id", trimmedId);
      } else if (trimmedId.startsWith("0x")) {
        query = query.eq("contract_address", trimmedId);
      } else {
        query = query.eq("contract_market_id", Number(trimmedId));
      }
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: `Market with identifier "${trimmedId}" not found` },
        { status: 404 }
      );
    }

    const market = data as MarketRecord;
    const belief = market.beliefs ?? null;
    const confirmations = belief?.creator_confirmations ?? [];
    const isConfirmed = belief?.status === "CONFIRMED" ? true : confirmations.length > 0;
    const primaryCreatorWallet = confirmations[0]?.creator_wallet ?? null;

    const agreePool = Number(market.agree_pool ?? 0);
    const disagreePool = Number(market.disagree_pool ?? 0);
    const totalPool = agreePool + disagreePool;
    const capitalConsensus = totalPool > 0 ? (agreePool / totalPool) * 100 : 50;

    const targetPriceVal = typeof market.resolution_config?.target_price === "number"
      ? market.resolution_config.target_price
      : null;

    const winningOutcome = market.winner ?? (market.market_resolutions && market.market_resolutions.length > 0 ? market.market_resolutions[0].resolved_outcome : null);

    const statement = belief?.statement ?? market.title;
    if (!statement || statement.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: `Market "${trimmedId}" is missing a valid statement` },
        { status: 500 }
      );
    }

    const formattedMarket = {
      ...market,
      id: market.id,
      belief_id: market.belief_id,
      statement: statement.trim(),
      author: belief?.author ?? null,
      authorHandle: belief?.author ?? null,
      creatorAddress: primaryCreatorWallet,
      sourceUrl: belief?.source_url ?? null,
      sourcePlatform: belief?.source_platform ?? null,
      createdAt: market.created_at,
      closesAt: market.close_time,
      isConfirmed,
      status: market.status,
      winningSide: winningOutcome,
      agreePoolEth: agreePool,
      disagreePoolEth: disagreePool,
      totalVolumeEth: totalPool,
      socialConsensusPct: belief?.ai_confidence !== null && belief?.ai_confidence !== undefined
        ? Math.round(Number(belief.ai_confidence))
        : Math.round(capitalConsensus),
      marketAddress: market.contract_address ?? null,
      chainId: market.chain_id,
      oracleFeed: market.resolution_source ?? null,
      targetPrice: targetPriceVal,
      resolutionType: market.resolution_type,
      agree_pool: agreePool,
      disagree_pool: disagreePool,
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
