import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_REGEX = /^0x[a-fA-F0-9]{10,}$/;

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Request body must be an object" }, { status: 400 });
    }

    const { tx_hash, contract_market_id, wallet_address, side, amount } = body;

    if (!tx_hash || typeof tx_hash !== "string" || !TX_HASH_REGEX.test(tx_hash.trim())) {
      return NextResponse.json(
        { error: "Invalid or missing tx_hash: must be a valid hex transaction hash starting with 0x" },
        { status: 400 }
      );
    }

    const parsedMarketId = Number(contract_market_id);
    if (
      contract_market_id === undefined ||
      contract_market_id === null ||
      !Number.isInteger(parsedMarketId) ||
      parsedMarketId < 0
    ) {
      return NextResponse.json(
        { error: "Invalid or missing contract_market_id: must be a non-negative integer" },
        { status: 400 }
      );
    }

    if (!wallet_address || typeof wallet_address !== "string" || !EVM_ADDRESS_REGEX.test(wallet_address.trim())) {
      return NextResponse.json(
        { error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    if (typeof side !== "string" || (side.trim().toLowerCase() !== "yes" && side.trim().toLowerCase() !== "no")) {
      return NextResponse.json(
        { error: "Invalid or missing side: must be 'yes' or 'no'" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing amount: must be a positive number" },
        { status: 400 }
      );
    }

    const normalizedTxHash = tx_hash.trim().toLowerCase();
    const normalizedAddress = wallet_address.trim().toLowerCase();
    const normalizedSide = side.trim().toLowerCase() as "yes" | "no";

    const supabase = getSupabaseAdminClient();

    const { data: existingBet, error: checkError } = await supabase
      .from("bets")
      .select("id")
      .eq("tx_hash", normalizedTxHash)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingBet) {
      return NextResponse.json(
        { error: `Bet transaction ${normalizedTxHash} has already been indexed` },
        { status: 409 }
      );
    }

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("*")
      .eq("contract_market_id", parsedMarketId)
      .maybeSingle();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json(
        { error: `Market with contract_market_id ${parsedMarketId} not found` },
        { status: 404 }
      );
    }

    const { data: createdBet, error: insertBetError } = await supabase
      .from("bets")
      .insert({
        market_id: market.id,
        wallet_address: normalizedAddress,
        side: normalizedSide,
        amount: numericAmount,
        claimed: false,
        tx_hash: normalizedTxHash,
      })
      .select("*")
      .single();

    if (insertBetError) {
      return NextResponse.json({ error: insertBetError.message }, { status: 500 });
    }

    const currentYesPool = Number(market.total_pool_yes ?? 0);
    const currentNoPool = Number(market.total_pool_no ?? 0);
    const updatedYesPool = normalizedSide === "yes" ? currentYesPool + numericAmount : currentYesPool;
    const updatedNoPool = normalizedSide === "no" ? currentNoPool + numericAmount : currentNoPool;

    const { error: poolUpdateError } = await supabase
      .from("markets")
      .update({
        total_pool_yes: updatedYesPool,
        total_pool_no: updatedNoPool,
      })
      .eq("id", market.id);

    if (poolUpdateError) {
      return NextResponse.json({ error: poolUpdateError.message }, { status: 500 });
    }

    const awardedPoints = 50;

    const { data: userRecord } = await supabase
      .from("users")
      .select("total_points")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    const currentPoints = userRecord ? Number(userRecord.total_points) : 0;
    const updatedPoints = currentPoints + awardedPoints;

    await supabase
      .from("users")
      .upsert(
        {
          wallet_address: normalizedAddress,
          total_points: updatedPoints,
        },
        { onConflict: "wallet_address" }
      );

    await supabase
      .from("points_events")
      .insert({
        wallet_address: normalizedAddress,
        source: "prediction_market",
        points: awardedPoints,
      });

    return NextResponse.json(
      {
        success: true,
        bet: {
          id: createdBet.id,
          market_id: createdBet.market_id,
          contract_market_id: parsedMarketId,
          market_title: market.title,
          wallet_address: createdBet.wallet_address,
          side: createdBet.side,
          amount: Number(createdBet.amount),
          claimed: createdBet.claimed,
          tx_hash: createdBet.tx_hash,
          created_at: createdBet.created_at,
        },
        points_awarded: awardedPoints,
        updated_pools: {
          total_pool_yes: updatedYesPool,
          total_pool_no: updatedNoPool,
          total_pool: updatedYesPool + updatedNoPool,
          yes_pool: updatedYesPool,
          no_pool: updatedNoPool,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
