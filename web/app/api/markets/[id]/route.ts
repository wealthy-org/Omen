import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

interface BeliefRecord {
  id: string;
  author: string | null;
  statement: string;
  source_url: string | null;
  source_platform: string | null;
  source_timestamp: string | null;
  ai_confidence: number | null;
  status: string;
  created_at: string;
  belief_sources?: Array<{
    id: string;
    raw_text: string;
    submitted_by_wallet: string | null;
    created_at: string;
  }>;
  creator_confirmations?: Array<{
    id: string;
    creator_wallet: string;
    confirmed_at: string;
    signature: string;
    tx_hash: string | null;
  }>;
}

interface MarketResolutionRecord {
  id: string;
  market_id: string;
  oracle_source: string | null;
  start_price: number | null;
  end_price: number | null;
  resolved_outcome: string;
  resolution_tx_hash: string | null;
  resolved_at: string;
}

interface MarketRecord {
  id: string;
  belief_id: string | null;
  contract_address: string | null;
  chain_id: number;
  contract_market_id: number | null;
  title: string | null;
  description: string | null;
  category: string | null;
  agree_pool: number | string;
  disagree_pool: number | string;
  total_pool_yes: number | string | null;
  total_pool_no: number | string | null;
  open_time: string;
  close_time: string;
  deadline: string | null;
  resolution_type: string | null;
  resolution_config: Record<string, unknown> | null;
  resolution_source: string | null;
  metadata_hash: string | null;
  status: string;
  winner: string | null;
  created_at: string;
  beliefs?: BeliefRecord | null;
  market_resolutions?: MarketResolutionRecord[];
  oracle_snapshots?: unknown[];
  market_positions?: unknown[];
}

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

    const formattedMarket = {
      ...market,
      id: market.id,
      belief_id: market.belief_id,
      statement: belief?.statement ?? market.title ?? "",
      author: belief?.author ?? null,
      authorHandle: belief?.author ?? "",
      creatorAddress: primaryCreatorWallet ?? "",
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
      marketAddress: market.contract_address ?? "",
      chainId: market.chain_id,
      oracleFeed: market.resolution_source ?? "",
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
