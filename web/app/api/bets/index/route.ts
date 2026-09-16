import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tx_hash, contract_market_id, wallet_address, side, amount } = body;

    if (!tx_hash || contract_market_id === undefined || !wallet_address || !side || amount === undefined) {
      return NextResponse.json({ error: "Missing required bet fields" }, { status: 400 });
    }

    const normalizedAddress = wallet_address.toLowerCase();
    const normalizedSide = side.toLowerCase();

    const supabase = getSupabaseAdminClient();

    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("*")
      .eq("contract_market_id", Number(contract_market_id))
      .maybeSingle();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const { data: existingBet } = await supabase
      .from("bets")
      .select("id")
      .eq("tx_hash", tx_hash)
      .maybeSingle();

    if (existingBet) {
      return NextResponse.json({ error: "Transaction hash already indexed" }, { status: 409 });
    }

    const { data: newBet, error: insertBetError } = await supabase
      .from("bets")
      .insert({
        market_id: market.id,
        wallet_address: normalizedAddress,
        side: normalizedSide as "yes" | "no",
        amount: Number(amount),
        claimed: false,
        tx_hash,
      })
      .select()
      .single();

    if (insertBetError) {
      return NextResponse.json({ error: insertBetError.message }, { status: 500 });
    }

    const updatedYes = normalizedSide === "yes" ? Number(market.yes_pool || 0) + Number(amount) : Number(market.yes_pool || 0);
    const updatedNo = normalizedSide === "no" ? Number(market.no_pool || 0) + Number(amount) : Number(market.no_pool || 0);

    await supabase
      .from("markets")
      .update({
        yes_pool: updatedYes,
        no_pool: updatedNo,
      })
      .eq("id", market.id);

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (user) {
      const rewardPoints = 50;
      await supabase
        .from("users")
        .update({ total_points: Number(user.total_points || 0) + rewardPoints })
        .eq("wallet_address", normalizedAddress);

      await supabase.from("points_events").insert({
        wallet_address: normalizedAddress,
        quest_id: null,
        source: "prediction_market",
        points: rewardPoints,
      });
    }

    return NextResponse.json({ success: true, bet: newBet }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
