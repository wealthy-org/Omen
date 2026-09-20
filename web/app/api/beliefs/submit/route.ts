import { NextRequest, NextResponse } from "next/server";
import { keccak256, toHex } from "viem";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { computeBeliefHashes, createOnChainMarket } from "@/lib/market/factory-client";
import { ETHEREUM_SEPOLIA_CHAIN_ID, DEFAULT_MARKET_DURATION_SECONDS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Request body must be an object" }, { status: 400 });
    }

    const { belief_id, contract_address, tx_hash } = body;

    if (belief_id && contract_address) {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from("markets")
        .update({
          contract_address,
        })
        .eq("belief_id", belief_id);

      return NextResponse.json({
        success: true,
        data: {
          belief_id,
          contract_address,
          tx_hash: tx_hash || null,
        },
      });
    }

    const {
      statement,
      raw_text,
      author,
      source_url,
      source_platform,
      source_timestamp,
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
    const effectiveOpenTime = open_time !== undefined && open_time !== null ? Number(open_time) : nowSec;
    const effectiveCloseTime = close_time !== undefined && close_time !== null ? Number(close_time) : (nowSec + DEFAULT_MARKET_DURATION_SECONDS);
    const effectiveChainId = chain_id !== undefined && chain_id !== null ? Number(chain_id) : ETHEREUM_SEPOLIA_CHAIN_ID;

    const { beliefHash, sourceHash, resolutionHash } = computeBeliefHashes(
      statement,
      raw_text,
      resolution_config || null
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
        ai_confidence: ai_confidence !== undefined && ai_confidence !== null ? Number(ai_confidence) : null,
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
      config: resolution_config || null,
      chainId: effectiveChainId,
    });

    const generatedMarketId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    const { data: market, error: marketError } = await supabase
      .from("markets")
      .insert({
        belief_id: belief.id,
        contract_market_id: generatedMarketId,
        title: statement.trim(),
        deadline: new Date(effectiveCloseTime * 1000).toISOString(),
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

    if (author && typeof author === "string" && author.trim()) {
      try {
        const cleanHandle = author.trim().startsWith("@") ? author.trim() : `@${author.trim()}`;
        const cleanName = author.trim().replace(/^@/, "");

        const { data: existingProfile } = await supabase
          .from("creator_profiles")
          .select("*")
          .or(`handle.ilike.${cleanHandle},handle.ilike.${cleanName}`)
          .maybeSingle();

        if (!existingProfile) {
          const fallbackWallet = submitted_by_wallet || `0x${keccak256(toHex(cleanHandle.toLowerCase())).slice(26)}`;
          await supabase
            .from("creator_profiles")
            .insert({
              handle: cleanHandle,
              wallet_address: fallbackWallet.toLowerCase(),
              confirmed_beliefs_count: 1,
              resolved_count: 0,
              correct_count: 0,
            });
        } else {
          await supabase
            .from("creator_profiles")
            .update({
              confirmed_beliefs_count: (existingProfile.confirmed_beliefs_count || 0) + 1,
            })
            .eq("id", existingProfile.id);
        }
      } catch {
      }
    }

    return NextResponse.json({
      success: true,
      marketId: market.id,
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
