import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Request body must be an object" },
        { status: 400 }
      );
    }

    const { wallet_address, side, amount, tx_hash, block_number } = body;

    if (!wallet_address || typeof wallet_address !== "string" || !EVM_ADDRESS_REGEX.test(wallet_address.trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    if (side !== "AGREE" && side !== "DISAGREE") {
      return NextResponse.json(
        { success: false, error: "Side must be either AGREE or DISAGREE" },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (!tx_hash || typeof tx_hash !== "string") {
      return NextResponse.json(
        { success: false, error: "tx_hash is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("*")
      .or(`id.eq.${id},contract_address.eq.${id}`)
      .maybeSingle();

    if (marketError) {
      return NextResponse.json(
        { success: false, error: marketError.message },
        { status: 500 }
      );
    }

    if (!market) {
      return NextResponse.json(
        { success: false, error: `Market with identifier ${id} not found` },
        { status: 404 }
      );
    }

    const { data: existingPosition } = await supabase
      .from("market_positions")
      .select("id")
      .eq("tx_hash", tx_hash)
      .maybeSingle();

    if (existingPosition) {
      return NextResponse.json(
        { success: false, error: `Position with tx_hash ${tx_hash} already indexed` },
        { status: 409 }
      );
    }

    const { data: insertedPosition, error: posError } = await supabase
      .from("market_positions")
      .insert({
        market_id: market.id,
        wallet_address: wallet_address.trim().toLowerCase(),
        side,
        amount: parsedAmount,
        tx_hash,
        claimed: false,
      })
      .select("*")
      .single();

    if (posError) {
      return NextResponse.json(
        { success: false, error: posError.message },
        { status: 500 }
      );
    }

    await supabase.from("market_events").insert({
      market_id: market.id,
      event_type: "PositionTaken",
      wallet_address: wallet_address.trim().toLowerCase(),
      amount: parsedAmount,
      tx_hash,
      block_number: block_number ? Number(block_number) : null,
    });

    const currentAgree = Number(market.agree_pool ?? 0);
    const currentDisagree = Number(market.disagree_pool ?? 0);

    const updatePayload =
      side === "AGREE"
        ? {
            agree_pool: currentAgree + parsedAmount,
          }
        : {
            disagree_pool: currentDisagree + parsedAmount,
          };

    await supabase.from("markets").update(updatePayload).eq("id", market.id);

    return NextResponse.json(
      {
        success: true,
        position: insertedPosition,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
