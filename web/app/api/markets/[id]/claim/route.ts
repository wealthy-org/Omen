import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    const { wallet_address, tx_hash } = body;

    if (!wallet_address || typeof wallet_address !== "string" || !EVM_ADDRESS_REGEX.test(wallet_address.trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing wallet_address: must be a valid 42-character EVM address" },
        { status: 400 }
      );
    }

    const normalizedAddress = wallet_address.trim().toLowerCase();
    const supabase = getSupabaseAdminClient();

    let query = supabase.from("markets").select("*");
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      query = query.eq("id", id);
    } else if (!isNaN(Number(id))) {
      query = query.eq("contract_market_id", Number(id));
    } else {
      query = query.or(`id.eq.${id},contract_address.eq.${id}`);
    }

    const { data: market, error: marketError } = await query.maybeSingle();

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

    const { data: updatedPositions, error: updateError } = await supabase
      .from("market_positions")
      .update({
        claimed: true,
      })
      .eq("market_id", market.id)
      .eq("wallet_address", normalizedAddress)
      .select("*");

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    try {
      await supabase.from("market_events").insert({
        market_id: market.id,
        event_type: "MarketClaimed",
        wallet_address: normalizedAddress,
        tx_hash: typeof tx_hash === "string" ? tx_hash : null,
      });
    } catch {
      void 0;
    }

    return NextResponse.json({
      success: true,
      claimed: true,
      market_id: market.id,
      wallet_address: normalizedAddress,
      updated_positions_count: updatedPositions ? updatedPositions.length : 0,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
