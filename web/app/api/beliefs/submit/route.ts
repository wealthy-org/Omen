import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { computeBeliefHashes, createOnChainMarket } from "@/lib/market/factory-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      statement,
      author,
      source_url,
      source_platform,
      source_timestamp,
      raw_text,
      submitted_by_wallet,
      ai_confidence,
      open_time,
      close_time,
      resolution_type,
      resolution_config,
      chain_id,
    } = body;

    if (!statement || typeof statement !== "string" || !statement.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: statement" },
        { status: 400 }
      );
    }

    if (!raw_text || typeof raw_text !== "string" || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required field: raw_text" },
        { status: 400 }
      );
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const effectiveOpenTime = open_time ? Number(open_time) : nowSec;
    const effectiveCloseTime = close_time ? Number(close_time) : (nowSec + 7 * 86400);
    const effectiveChainId = Number(chain_id) || 11155111;

    const { beliefHash, sourceHash, resolutionHash } = computeBeliefHashes(
      statement,
      raw_text,
      resolution_config
    );

    const supabase = getSupabaseAdminClient();

    const { data: belief, error: beliefError } = await supabase
      .from("beliefs")
      .insert({
        statement: statement.trim(),
        author: author || null,
        source_url: source_url || null,
        source_platform: source_platform || null,
        source_timestamp: source_timestamp || null,
        ai_confidence: ai_confidence !== undefined ? Number(ai_confidence) : null,
        status: "DETECTED",
      })
      .select()
      .single();

    if (beliefError || !belief) {
      return NextResponse.json(
        { success: false, error: beliefError?.message || "Failed to create belief" },
        { status: 500 }
      );
    }

    await supabase
      .from("belief_sources")
      .insert({
        belief_id: belief.id,
        raw_text: raw_text.trim(),
        submitted_by_wallet: submitted_by_wallet || null,
      })
      .select()
      .single();

    const onChainResult = await createOnChainMarket({
      beliefHash,
      sourceHash,
      resolutionHash,
      openTime: effectiveOpenTime,
      closeTime: effectiveCloseTime,
      config: resolution_config,
      chainId: effectiveChainId,
    });

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .insert({
        belief_id: belief.id,
        contract_address: onChainResult.contractAddress,
        chain_id: effectiveChainId,
        agree_pool: 0,
        disagree_pool: 0,
        open_time: new Date(effectiveOpenTime * 1000).toISOString(),
        close_time: new Date(effectiveCloseTime * 1000).toISOString(),
        status: "OPEN",
        resolution_type: resolution_type || null,
        resolution_config: resolution_config || null,
        metadata_hash: resolutionHash,
      })
      .select()
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { success: false, error: marketError?.message || "Failed to create market record" },
        { status: 500 }
      );
    }

    await supabase
      .from("market_events")
      .insert({
        market_id: market.id,
        event_type: "MarketCreated",
        wallet_address: submitted_by_wallet || author || null,
        amount: null,
        tx_hash: onChainResult.txHash,
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      data: {
        belief_id: belief.id,
        market_id: market.id,
        contract_address: onChainResult.contractAddress,
        tx_hash: onChainResult.txHash,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
