import { NextRequest, NextResponse } from "next/server";
import { keccak256, toHex } from "viem";
import { eq, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
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
      await getDb()
        .update(schema.markets)
        .set({ contract_address })
        .where(eq(schema.markets.belief_id, belief_id));

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

    const db = getDb();
    const { beliefs, belief_sources, markets, market_events, creator_profiles } = schema;

    const [belief] = await db
      .insert(beliefs)
      .values({
        statement: statement.trim(),
        author: author || null,
        source_url: source_url || null,
        source_platform: source_platform || null,
        source_timestamp: source_timestamp || null,
        ai_confidence: ai_confidence !== undefined && ai_confidence !== null ? Number(ai_confidence) : null,
        status: "DETECTED",
      })
      .returning();

    await db.insert(belief_sources).values({
      belief_id: belief.id,
      raw_text: raw_text.trim(),
      submitted_by_wallet: submitted_by_wallet || null,
    });

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
    const [market] = await db
      .insert(markets)
      .values({
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
      .returning();

    await db.insert(market_events).values({
      market_id: market.id,
      event_type: "MarketCreated",
      wallet_address: submitted_by_wallet || author || null,
      amount: null,
      tx_hash: onChainResult.txHash,
    }).onConflictDoNothing();

    if (author && typeof author === "string" && author.trim()) {
      try {
        const cleanHandle = author.trim().startsWith("@") ? author.trim() : `@${author.trim()}`;
        const cleanName = author.trim().replace(/^@/, "");

        const existingProfile = await db.query.creator_profiles.findFirst({
          where: or(ilike(creator_profiles.handle, cleanHandle), ilike(creator_profiles.handle, cleanName)),
        });

        if (!existingProfile) {
          const fallbackWallet = submitted_by_wallet || `0x${keccak256(toHex(cleanHandle.toLowerCase())).slice(26)}`;
          await db.insert(creator_profiles).values({
            handle: cleanHandle,
            wallet_address: fallbackWallet.toLowerCase(),
          });
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
    console.error("[API Error POST /api/beliefs/submit]:", error);
    const rawMsg = (error?.message || "").toLowerCase();
    let safeError = "Failed to deploy market to blockchain. Please try again.";
    if (rawMsg.includes("insufficient funds") || rawMsg.includes("exceeds the balance")) {
      safeError = "Insufficient wallet funds for on-chain gas fee. Please top up testnet ETH and try again.";
    } else if (rawMsg.includes("revert")) {
      safeError = "Smart contract execution reverted. Please verify market parameters.";
    }
    return NextResponse.json(
      { success: false, error: safeError },
      { status: 500 }
    );
  }
}
